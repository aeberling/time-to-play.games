import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '@/lib/auth/jwt';

// Extended Socket type with custom properties
interface AuthenticatedSocket extends Socket {
  userId: string;
  displayName: string;
  isGuest: boolean;
  currentGame?: string;
}

// Store for active connections
const activeGames = new Map<string, any>();
const userSockets = new Map<string, AuthenticatedSocket>();

export default function setupSocketHandlers(io: Server) {
  // Authentication middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const payload = verifyAccessToken(token);
      if (!payload) {
        return next(new Error('Invalid token'));
      }

      // Attach user info to socket
      const authSocket = socket as AuthenticatedSocket;
      authSocket.userId = payload.userId;
      authSocket.displayName = payload.displayName;
      authSocket.isGuest = payload.isGuest;

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    console.log(`User connected: ${authSocket.displayName} (${authSocket.userId})`);

    // Store user's socket
    userSockets.set(authSocket.userId, authSocket);

    // Handle game room joining
    authSocket.on('game:join', async (gameId: string) => {
      try {
        // Join the game room
        authSocket.join(`game:${gameId}`);
        authSocket.currentGame = gameId;

        console.log(`${authSocket.displayName} joined game ${gameId}`);

        // Notify other players
        authSocket.to(`game:${gameId}`).emit('player:joined', {
          userId: authSocket.userId,
          displayName: authSocket.displayName,
        });

        // Send current game state to the joining player
        const gameState = activeGames.get(gameId);
        if (gameState) {
          authSocket.emit('game:state', gameState);
        }
      } catch (error) {
        console.error('Error joining game:', error);
        authSocket.emit('error', { message: 'Failed to join game' });
      }
    });

    // Handle game room leaving
    authSocket.on('game:leave', (gameId: string) => {
      authSocket.leave(`game:${gameId}`);
      authSocket.currentGame = undefined;

      authSocket.to(`game:${gameId}`).emit('player:left', {
        userId: authSocket.userId,
        displayName: authSocket.displayName,
      });
    });

    // Handle game moves
    authSocket.on('game:move', async (data: { gameId: string; move: any }) => {
      try {
        const { gameId, move } = data;

        // Broadcast move to other players in the game
        authSocket.to(`game:${gameId}`).emit('game:move', {
          userId: authSocket.userId,
          move,
          timestamp: Date.now(),
        });

        // Update game state
        const gameState = activeGames.get(gameId) || {};
        activeGames.set(gameId, {
          ...gameState,
          lastMove: move,
          lastMoveBy: authSocket.userId,
          lastMoveAt: Date.now(),
        });
      } catch (error) {
        console.error('Error processing move:', error);
        authSocket.emit('error', { message: 'Failed to process move' });
      }
    });

    // Handle chat messages
    authSocket.on('chat:message', (data: { gameId: string; message: string }) => {
      const { gameId, message } = data;

      // Broadcast message to all players in the game
      io.to(`game:${gameId}`).emit('chat:message', {
        userId: authSocket.userId,
        displayName: authSocket.displayName,
        message,
        timestamp: Date.now(),
      });
    });

    // Handle player ready status
    authSocket.on('player:ready', (data: { gameId: string; isReady: boolean }) => {
      const { gameId, isReady } = data;

      authSocket.to(`game:${gameId}`).emit('player:ready', {
        userId: authSocket.userId,
        isReady,
      });
    });

    // Handle disconnect
    authSocket.on('disconnect', () => {
      console.log(`User disconnected: ${authSocket.displayName} (${authSocket.userId})`);

      // Remove from active users
      userSockets.delete(authSocket.userId);

      // Notify current game if user was in one
      if (authSocket.currentGame) {
        authSocket.to(`game:${authSocket.currentGame}`).emit('player:disconnected', {
          userId: authSocket.userId,
          displayName: authSocket.displayName,
        });
      }
    });

    // Handle reconnection
    authSocket.on('game:reconnect', async (gameId: string) => {
      try {
        authSocket.join(`game:${gameId}`);
        authSocket.currentGame = gameId;

        // Send current game state
        const gameState = activeGames.get(gameId);
        if (gameState) {
          authSocket.emit('game:state', gameState);
        }

        // Notify other players of reconnection
        authSocket.to(`game:${gameId}`).emit('player:reconnected', {
          userId: authSocket.userId,
          displayName: authSocket.displayName,
        });
      } catch (error) {
        console.error('Error reconnecting to game:', error);
        authSocket.emit('error', { message: 'Failed to reconnect' });
      }
    });
  });

  // Helper function to emit to specific user
  const emitToUser = (userId: string, event: string, data: any) => {
    const socket = userSockets.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  };

  // Helper function to emit to game room
  const emitToGame = (gameId: string, event: string, data: any) => {
    io.to(`game:${gameId}`).emit(event, data);
  };

  // Expose helpers
  (io as any).emitToUser = emitToUser;
  (io as any).emitToGame = emitToGame;
}
