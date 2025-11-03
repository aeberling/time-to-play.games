# Real-Time Game System Architecture

## Overview

The real-time game system uses WebSockets (Socket.io) to provide instant communication between players. This document details how the system handles connections, game state synchronization, and edge cases like disconnections.

## WebSocket Server Architecture

### Server Setup

```typescript
// server/socket.ts
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS,
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// Redis adapter for multi-server setup (future scaling)
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));
```

### Connection Flow

```
┌─────────┐                                    ┌─────────────┐
│ Client  │                                    │   Server    │
└────┬────┘                                    └──────┬──────┘
     │                                                │
     │ 1. HTTP Request (with JWT cookie)              │
     ├───────────────────────────────────────────────>│
     │                                                │
     │ 2. Validate JWT, get userId                   │
     │                                                ├─────┐
     │                                                │     │
     │                                                │<────┘
     │                                                │
     │ 3. Establish WebSocket connection              │
     │<───────────────────────────────────────────────┤
     │                                                │
     │ 4. Emit 'connection' event                     │
     │                                                │
     │ 5. Client: emit 'game:join' {gameId}          │
     ├───────────────────────────────────────────────>│
     │                                                │
     │ 6. Server: Validate & load game state         │
     │                                                ├─────┐
     │                                                │     │
     │                                                │<────┘
     │                                                │
     │ 7. Server: Join socket room                    │
     │                                                ├─────┐
     │                                                │     │
     │                                                │<────┘
     │                                                │
     │ 8. Emit 'game:state' to client                │
     │<───────────────────────────────────────────────┤
     │                                                │
     │ 9. Broadcast 'player:joined' to room          │
     │<───────────────────────────────────────────────┤
     │                                                │
```

## Socket Event Handlers

### Connection Management

```typescript
// server/handlers/connection.handler.ts

io.use(async (socket, next) => {
  // Middleware: Authenticate socket connection
  const token = socket.handshake.auth.token;

  try {
    const decoded = await verifyJWT(token);
    socket.data.userId = decoded.userId;
    socket.data.displayName = decoded.displayName;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', async (socket) => {
  const userId = socket.data.userId;

  console.log(`User ${userId} connected`);

  // Store socket ID in Redis for player session
  await redis.setex(
    `player:${userId}:session`,
    86400, // 24 hours
    JSON.stringify({
      userId,
      socketId: socket.id,
      currentGameId: null,
      lastActiveAt: new Date().toISOString()
    })
  );

  // Register event handlers
  socket.on('game:join', handleGameJoin(socket));
  socket.on('game:move', handleGameMove(socket));
  socket.on('game:leave', handleGameLeave(socket));
  socket.on('disconnect', handleDisconnect(socket));
});
```

### Game Join Handler

```typescript
// server/handlers/game-join.handler.ts

export const handleGameJoin = (socket: Socket) => {
  return async (data: { gameId: string }) => {
    const userId = socket.data.userId;
    const { gameId } = data;

    try {
      // 1. Validate player is part of this game (PostgreSQL)
      const gamePlayer = await prisma.gamePlayer.findFirst({
        where: { gameId, userId }
      });

      if (!gamePlayer) {
        socket.emit('error', { message: 'Not authorized for this game' });
        return;
      }

      // 2. Load game state from Redis
      const gameStateJson = await redis.get(`game:${gameId}:state`);

      if (!gameStateJson) {
        // Game not in Redis, reconstruct from DB
        const gameState = await reconstructGameState(gameId);
        await redis.setex(
          `game:${gameId}:state`,
          1800, // 30 minutes
          JSON.stringify(gameState)
        );
      }

      const gameState = JSON.parse(gameStateJson);

      // 3. Update player connection status
      const playerIndex = gameState.players.findIndex(
        (p: any) => p.userId === userId
      );
      gameState.players[playerIndex].isConnected = true;

      // 4. Save updated state
      await redis.setex(
        `game:${gameId}:state`,
        1800,
        JSON.stringify(gameState)
      );

      // 5. Join socket room
      socket.join(`game:${gameId}`);

      // 6. Update player session
      const session = JSON.parse(
        await redis.get(`player:${userId}:session`) || '{}'
      );
      session.currentGameId = gameId;
      session.lastActiveAt = new Date().toISOString();
      await redis.setex(
        `player:${userId}:session`,
        86400,
        JSON.stringify(session)
      );

      // 7. Send full game state to joining player
      socket.emit('game:state', gameState);

      // 8. Notify other players
      socket.to(`game:${gameId}`).emit('player:joined', {
        userId,
        displayName: socket.data.displayName,
        playerIndex
      });

      // 9. Update database (async, non-blocking)
      prisma.gamePlayer.update({
        where: { id: gamePlayer.id },
        data: {
          isConnected: true,
          lastConnectedAt: new Date()
        }
      }).catch(console.error);

    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('error', { message: 'Failed to join game' });
    }
  };
};
```

### Game Move Handler

```typescript
// server/handlers/game-move.handler.ts

export const handleGameMove = (socket: Socket) => {
  return async (data: { gameId: string; moveData: any }) => {
    const userId = socket.data.userId;
    const { gameId, moveData } = data;

    // Use Redlock for distributed locking
    const lock = await acquireLock(`game:${gameId}:lock`, 5000);

    if (!lock) {
      socket.emit('error', { message: 'Game is locked, try again' });
      return;
    }

    try {
      // 1. Load current game state
      const gameStateJson = await redis.get(`game:${gameId}:state`);
      if (!gameStateJson) {
        throw new Error('Game not found');
      }

      const gameState = JSON.parse(gameStateJson);

      // 2. Validate it's player's turn
      const currentPlayer = gameState.players[gameState.currentTurn];
      if (currentPlayer.userId !== userId) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }

      // 3. Validate move using game engine
      const game = GameFactory.create(gameState.gameType, gameState);
      const validationResult = game.validateMove(moveData);

      if (!validationResult.valid) {
        socket.emit('error', { message: validationResult.error });
        return;
      }

      // 4. Apply move
      const newGameState = game.applyMove(moveData);
      newGameState.lastMoveAt = new Date().toISOString();
      newGameState.moveCount += 1;

      // 5. Check for game over
      const gameOverResult = game.checkGameOver(newGameState);
      if (gameOverResult.isGameOver) {
        newGameState.status = 'COMPLETED';
        newGameState.winnerId = gameOverResult.winnerId;
      }

      // 6. Save to Redis
      await redis.setex(
        `game:${gameId}:state`,
        1800,
        JSON.stringify(newGameState)
      );

      // 7. Broadcast to all players in room
      io.to(`game:${gameId}`).emit('game:move_made', {
        userId,
        moveData,
        newGameState: newGameState,
        timestamp: new Date().toISOString()
      });

      // 8. If game over, notify and finalize
      if (gameOverResult.isGameOver) {
        io.to(`game:${gameId}`).emit('game:over', {
          winnerId: gameOverResult.winnerId,
          reason: gameOverResult.reason,
          finalState: newGameState
        });

        // Finalize game in database (async)
        finalizeGame(gameId, newGameState).catch(console.error);
      }

      // 9. Record move in database (async)
      prisma.gameMove.create({
        data: {
          gameId,
          userId,
          moveNumber: newGameState.moveCount,
          moveData: JSON.stringify(moveData)
        }
      }).catch(console.error);

    } catch (error) {
      console.error('Error processing move:', error);
      socket.emit('error', { message: 'Failed to process move' });
    } finally {
      await releaseLock(lock);
    }
  };
};
```

### Disconnect Handler

```typescript
// server/handlers/disconnect.handler.ts

export const handleDisconnect = (socket: Socket) => {
  return async () => {
    const userId = socket.data.userId;

    console.log(`User ${userId} disconnected`);

    try {
      // 1. Get player's current game
      const sessionJson = await redis.get(`player:${userId}:session`);
      if (!sessionJson) return;

      const session = JSON.parse(sessionJson);
      const gameId = session.currentGameId;

      if (!gameId) return;

      // 2. Update game state
      const gameStateJson = await redis.get(`game:${gameId}:state`);
      if (!gameStateJson) return;

      const gameState = JSON.parse(gameStateJson);
      const playerIndex = gameState.players.findIndex(
        (p: any) => p.userId === userId
      );

      if (playerIndex !== -1) {
        gameState.players[playerIndex].isConnected = false;

        // Save updated state
        await redis.setex(
          `game:${gameId}:state`,
          1800, // Keep for 30 min for reconnection
          JSON.stringify(gameState)
        );

        // 3. Notify other players
        socket.to(`game:${gameId}`).emit('player:left', {
          userId,
          playerIndex,
          displayName: socket.data.displayName,
          canReconnect: true
        });
      }

      // 4. Update database (async)
      prisma.gamePlayer.updateMany({
        where: { gameId, userId },
        data: { isConnected: false }
      }).catch(console.error);

      // 5. Set timeout to abandon game if no reconnection
      setTimeout(async () => {
        const stillDisconnected = await checkPlayerDisconnected(gameId, userId);
        if (stillDisconnected) {
          await handleAbandonedGame(gameId, userId);
        }
      }, 5 * 60 * 1000); // 5 minutes

    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  };
};
```

## Reconnection Flow

### Client-Side Reconnection

```typescript
// client/lib/socket.ts

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(gameId: string) {
    this.socket = io(process.env.NEXT_PUBLIC_WS_URL, {
      auth: { token: getAuthToken() },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.reconnectAttempts = 0;

      // Rejoin game room
      this.socket?.emit('game:join', { gameId });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);

      if (reason === 'io server disconnect') {
        // Server kicked us, don't reconnect automatically
        this.handleForceDisconnect();
      }
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
      this.reconnectAttempts = attempt;
    });

    this.socket.on('reconnect', (attempt) => {
      console.log(`Reconnected after ${attempt} attempts`);
      // State will be resent via game:join → game:state
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect');
      this.handleReconnectFailed();
    });
  }
}
```

### Server-Side Reconnection Handling

When a player reconnects:
1. Socket.io automatically re-establishes connection
2. Client emits `game:join` with gameId
3. Server validates player still in game
4. Server sends full `game:state` to catch up player
5. Server broadcasts `player:joined` to other players
6. Game continues seamlessly

## State Synchronization Strategy

### Optimistic Updates

For smooth UX, client applies moves optimistically before server confirmation:

```typescript
// Client-side
function makeMove(moveData: any) {
  // 1. Apply move locally (optimistic)
  const newState = gameEngine.applyMove(currentState, moveData);
  setGameState(newState);

  // 2. Send to server
  socket.emit('game:move', { gameId, moveData });

  // 3. Wait for confirmation
  socket.once('game:move_made', (serverState) => {
    // Replace optimistic state with server state
    setGameState(serverState.newGameState);
  });

  socket.once('error', (error) => {
    // Rollback optimistic update
    setGameState(currentState);
    showError(error.message);
  });
}
```

### Conflict Resolution

If client state diverges from server (rare):
- Server state is always source of truth
- Client receives `game:state` event to force resync
- Client discards local state and re-renders

## Performance Optimizations

### Message Compression

```typescript
io.on('connection', (socket) => {
  // Enable per-message compression
  socket.compress(true);
});
```

### Batching Updates

For games with rapid state changes:

```typescript
// Server batches updates every 100ms
const updateQueue = new Map<string, any>();

function queueStateUpdate(gameId: string, state: any) {
  updateQueue.set(gameId, state);
}

setInterval(() => {
  updateQueue.forEach((state, gameId) => {
    io.to(`game:${gameId}`).emit('game:state_update', state);
  });
  updateQueue.clear();
}, 100);
```

### Room Management

- Use Socket.io rooms for efficient broadcasting
- Players only receive updates for their games
- Minimize message size (send deltas, not full state)

## Error Handling

### Client Errors

```typescript
socket.on('error', (error) => {
  switch (error.code) {
    case 'NOT_YOUR_TURN':
      toast.error('Wait for your turn!');
      break;
    case 'INVALID_MOVE':
      toast.error('Invalid move');
      revertOptimisticUpdate();
      break;
    case 'GAME_NOT_FOUND':
      router.push('/play');
      toast.error('Game no longer exists');
      break;
    default:
      toast.error('Something went wrong');
  }
});
```

### Server Errors

```typescript
socket.on('error', (error) => {
  console.error('Socket error:', error);

  // Log to monitoring service
  Sentry.captureException(error, {
    tags: { type: 'socket_error' },
    extra: { gameId, userId }
  });
});
```

## Monitoring & Debugging

### Socket.io Admin UI

```typescript
import { instrument } from '@socket.io/admin-ui';

instrument(io, {
  auth: {
    type: 'basic',
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
  }
});
```

Access at: `https://admin.socket.io`

### Custom Metrics

```typescript
// Track active connections
io.engine.on('connection_error', (err) => {
  console.error('Connection error:', err);
});

// Track room sizes
setInterval(() => {
  const rooms = io.sockets.adapter.rooms;
  rooms.forEach((sockets, room) => {
    if (room.startsWith('game:')) {
      console.log(`Room ${room}: ${sockets.size} players`);
    }
  });
}, 60000); // Every minute
```

## Security Considerations

### Rate Limiting

```typescript
import rateLimit from 'socket.io-rate-limit';

io.use(rateLimit({
  tokensPerInterval: 10, // 10 actions
  interval: 10000, // per 10 seconds
  fireImmediately: true
}));
```

### Input Validation

```typescript
import { z } from 'zod';

const gameMoveSchema = z.object({
  gameId: z.string().cuid(),
  moveData: z.object({
    cardIndex: z.number().min(0).optional(),
    position: z.tuple([z.number(), z.number()]).optional()
  })
});

// Validate all incoming data
socket.on('game:move', (data) => {
  const result = gameMoveSchema.safeParse(data);
  if (!result.success) {
    socket.emit('error', { message: 'Invalid move data' });
    return;
  }
  // Process move...
});
```

---

This real-time system provides a robust, scalable foundation for turn-based multiplayer gaming with excellent user experience even in challenging network conditions.
