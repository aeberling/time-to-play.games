import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { GameStateManager } from '@/lib/game/state';
import { prisma } from '@/lib/db';
import { registerGames, validatorRegistry } from '@/lib/games/registry';

// Extended Socket type with custom properties
interface AuthenticatedSocket extends Socket {
  userId: string;
  displayName: string;
  isGuest: boolean;
  currentGame?: string;
}

// Store for active connections
const userSockets = new Map<string, AuthenticatedSocket>();

// Register all games
registerGames();

export default function setupSocketHandlers(io: Server) {
  // Authentication middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      console.log('Socket auth attempt:', {
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      });

      if (!token) {
        console.error('Socket auth failed: No token provided');
        return next(new Error('Authentication required'));
      }

      const payload = verifyAccessToken(token);
      if (!payload) {
        console.error('Socket auth failed: Invalid token');
        return next(new Error('Invalid token'));
      }

      // Attach user info to socket
      const authSocket = socket as AuthenticatedSocket;
      authSocket.userId = payload.userId;
      authSocket.displayName = payload.displayName;
      authSocket.isGuest = payload.isGuest;

      console.log('Socket auth success:', {
        userId: payload.userId,
        displayName: payload.displayName,
        isGuest: payload.isGuest,
      });

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

        // Update player connection status
        await GameStateManager.updatePlayerConnection(
          gameId,
          authSocket.userId,
          true
        );

        // Get current game state
        const gameState = await GameStateManager.getState(gameId);

        // Notify other players
        authSocket.to(`game:${gameId}`).emit('player:joined', {
          userId: authSocket.userId,
          displayName: authSocket.displayName,
        });

        // Send current game state to the joining player
        if (gameState) {
          authSocket.emit('game:state', gameState);
        }

        // Check if all players are ready to start
        if (gameState?.status === 'WAITING') {
          const allReady = await GameStateManager.areAllPlayersReady(gameId);
          if (allReady && gameState.players.length >= 2) {
            // Start the game
            await GameStateManager.updateState(gameId, {
              status: 'IN_PROGRESS',
              currentTurn: 1,
              turnStartedAt: Date.now(),
            });

            // Update database
            await prisma.game.update({
              where: { id: gameId },
              data: {
                status: 'IN_PROGRESS',
                startedAt: new Date(),
                currentTurn: 1,
              },
            });

            // Notify all players game has started
            io.to(`game:${gameId}`).emit('game:started', {
              gameId,
              currentTurn: 1,
            });
          }
        }
      } catch (error) {
        console.error('Error joining game:', error);
        authSocket.emit('error', { message: 'Failed to join game' });
      }
    });

    // Handle game room leaving
    authSocket.on('game:leave', async (gameId: string) => {
      authSocket.leave(`game:${gameId}`);
      authSocket.currentGame = undefined;

      // Update player connection status
      await GameStateManager.updatePlayerConnection(gameId, authSocket.userId, false);

      authSocket.to(`game:${gameId}`).emit('player:left', {
        userId: authSocket.userId,
        displayName: authSocket.displayName,
      });
    });

    // Handle game moves
    authSocket.on('game:move', async (data: { gameId: string; move: any }) => {
      try {
        const { gameId, move } = data;

        // Get current game state
        const gameState = await GameStateManager.getState(gameId);
        if (!gameState) {
          authSocket.emit('error', { message: 'Game not found' });
          return;
        }

        // Get game-specific validator
        const validator = validatorRegistry.get(gameState.gameType);
        if (!validator) {
          authSocket.emit('error', { message: 'Game type not supported' });
          return;
        }

        // Validate the move
        const validation = await validator.validate(
          gameState,
          move,
          authSocket.userId
        );

        if (!validation.valid) {
          authSocket.emit('move:invalid', {
            error: validation.error,
          });
          return;
        }

        // Update game data if validator provided updates
        if (validation.updatedGameData) {
          gameState.gameData = validation.updatedGameData;
        }

        // Update last move info
        gameState.lastMoveAt = Date.now();

        // Save to Redis
        await GameStateManager.setState(gameId, gameState);

        // Save move to database
        await prisma.gameMove.create({
          data: {
            gameId,
            playerId: authSocket.userId,
            moveNumber: (gameState.gameData?.moveCount || 0) + 1,
            moveData: move,
          },
        });

        // Broadcast move to all players in the game
        io.to(`game:${gameId}`).emit('game:move', {
          userId: authSocket.userId,
          move,
          timestamp: Date.now(),
        });

        // Advance turn
        await GameStateManager.nextTurn(gameId);

        // Get updated state
        const updatedState = await GameStateManager.getState(gameId);
        if (updatedState) {
          io.to(`game:${gameId}`).emit('game:state', updatedState);
        }

        // Save snapshot to database periodically (every 5 moves)
        const moveCount = gameState.gameData?.moveCount || 0;
        if (moveCount % 5 === 0) {
          await GameStateManager.saveSnapshot(gameId);
        }
      } catch (error) {
        console.error('Error processing move:', error);
        authSocket.emit('error', { message: 'Failed to process move' });
      }
    });

    // Handle chat messages
    authSocket.on('chat:message', async (data: { gameId: string; message: string }) => {
      const { gameId, message } = data;

      try {
        // Save chat message to database
        await prisma.chatMessage.create({
          data: {
            gameId,
            userId: authSocket.userId,
            messageType: 'CHAT',
            content: message,
          },
        });

        // Broadcast message to all players in the game
        io.to(`game:${gameId}`).emit('chat:message', {
          userId: authSocket.userId,
          displayName: authSocket.displayName,
          message,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Error processing chat message:', error);
      }
    });

    // Handle player ready status
    authSocket.on('player:ready', async (data: { gameId: string; isReady: boolean }) => {
      const { gameId, isReady } = data;

      try {
        // Update ready status in state
        await GameStateManager.updatePlayerReady(gameId, authSocket.userId, isReady);

        // Update database
        await prisma.gamePlayer.updateMany({
          where: {
            gameId,
            userId: authSocket.userId,
          },
          data: {
            isReady,
          },
        });

        // Broadcast to all players
        io.to(`game:${gameId}`).emit('player:ready', {
          userId: authSocket.userId,
          isReady,
        });

        // Check if all players are ready
        const allReady = await GameStateManager.areAllPlayersReady(gameId);
        if (allReady) {
          io.to(`game:${gameId}`).emit('game:all_ready');
        }
      } catch (error) {
        console.error('Error updating ready status:', error);
      }
    });

    // Handle disconnect
    authSocket.on('disconnect', async () => {
      console.log(`User disconnected: ${authSocket.displayName} (${authSocket.userId})`);

      // Remove from active users
      userSockets.delete(authSocket.userId);

      // Update player connection status if in a game
      if (authSocket.currentGame) {
        await GameStateManager.updatePlayerConnection(
          authSocket.currentGame,
          authSocket.userId,
          false
        );

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

        // Update player connection status
        await GameStateManager.updatePlayerConnection(gameId, authSocket.userId, true);

        // Get current game state from Redis/DB
        const gameState = await GameStateManager.getState(gameId);
        if (gameState) {
          authSocket.emit('game:state', gameState);
        }

        // Get recent chat messages
        const recentMessages = await prisma.chatMessage.findMany({
          where: { gameId },
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        });

        authSocket.emit('chat:history', recentMessages.reverse());

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
