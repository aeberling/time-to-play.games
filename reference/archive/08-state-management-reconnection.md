# Game State Management & Reconnection System

## Overview

One of the core requirements for Time to Play is resilience: players should be able to reconnect to games after network interruptions without losing progress. This document details the complete state management and reconnection architecture.

## State Storage Strategy

### Two-Tier Storage System

```
┌──────────────────────────────────────────────────────┐
│                   Redis (Hot Storage)                 │
│  - Active games (currently being played)              │
│  - 30-minute TTL (refreshed on each move)            │
│  - Fast access (sub-millisecond)                      │
│  - Automatic expiration cleanup                       │
└──────────────────────────────────────────────────────┘
                        ↕ (Periodic snapshots)
┌──────────────────────────────────────────────────────┐
│              PostgreSQL (Cold Storage)                │
│  - Complete game history                              │
│  - Every move recorded                                │
│  - Final game states                                  │
│  - Permanent storage                                  │
└──────────────────────────────────────────────────────┘
```

### Why This Approach?

1. **Performance**: Redis provides instant access for active games
2. **Durability**: PostgreSQL ensures no data loss
3. **Cost-Effective**: Only active games consume fast (expensive) memory
4. **Recovery**: Can reconstruct any game from PostgreSQL if needed

## State Lifecycle

### 1. Game Creation

```typescript
// When a game is created
async function createGame(userId: string, gameType: string) {
  // 1. Create record in PostgreSQL
  const game = await prisma.game.create({
    data: {
      gameType,
      status: 'WAITING',
      maxPlayers: 2,
      players: {
        create: {
          userId,
          playerIndex: 0,
          isReady: true
        }
      }
    }
  });

  // 2. Initialize state in Redis
  const initialState = initializeGameState(gameType);
  await redis.setex(
    `game:${game.id}:state`,
    1800, // 30 minutes
    JSON.stringify({
      gameId: game.id,
      gameType,
      status: 'WAITING',
      players: [{
        userId,
        playerIndex: 0,
        isConnected: true,
        isReady: true
      }],
      gameState: initialState,
      createdAt: new Date().toISOString(),
      lastMoveAt: new Date().toISOString(),
      moveCount: 0
    })
  );

  // 3. Add to available games list
  await redis.zadd('games:waiting', Date.now(), game.id);

  return game;
}
```

### 2. Active Gameplay

Every move follows this pattern:

```typescript
async function processMove(gameId: string, userId: string, moveData: any) {
  // 1. Acquire lock (prevent race conditions)
  const lock = await acquireLock(`game:${gameId}:lock`, 5000);

  try {
    // 2. Load from Redis
    const stateJson = await redis.get(`game:${gameId}:state`);
    const currentState = JSON.parse(stateJson);

    // 3. Validate move
    const game = GameFactory.create(currentState.gameType, currentState);
    const validation = game.validateMove(moveData);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 4. Apply move
    const newState = game.applyMove(moveData);
    newState.lastMoveAt = new Date().toISOString();
    newState.moveCount += 1;

    // 5. Save to Redis (refresh TTL)
    await redis.setex(
      `game:${gameId}:state`,
      1800, // Reset to 30 minutes
      JSON.stringify(newState)
    );

    // 6. Record move in PostgreSQL (async, non-blocking)
    recordMoveInDB(gameId, userId, moveData, newState.moveCount)
      .catch(err => console.error('Failed to record move:', err));

    // 7. Snapshot to PostgreSQL every 10 moves
    if (newState.moveCount % 10 === 0) {
      snapshotGameState(gameId, newState)
        .catch(err => console.error('Failed to snapshot:', err));
    }

    return newState;

  } finally {
    await releaseLock(lock);
  }
}
```

### 3. Game Completion

```typescript
async function finalizeGame(gameId: string, finalState: any) {
  // 1. Save final state to PostgreSQL
  await prisma.game.update({
    where: { id: gameId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      winnerId: finalState.winnerId,
      stateSnapshot: finalState
    }
  });

  // 2. Update player records
  await prisma.gamePlayer.updateMany({
    where: { gameId },
    data: {
      // Update placement, score, etc.
    }
  });

  // 3. Update user statistics
  await updateUserStats(finalState.players);

  // 4. Keep in Redis for 5 more minutes (allow viewing)
  await redis.expire(`game:${gameId}:state`, 300);

  // 5. Remove from active games list
  await redis.zrem('games:active', gameId);
}
```

## Reconnection System

### Scenario 1: Quick Reconnection (< 30 min)

**Most common case**: Player's WiFi hiccups, page refresh, browser crash

```typescript
// Client reconnection flow
async function reconnectToGame(gameId: string) {
  // 1. Establish new WebSocket connection
  socket.connect();

  // 2. Request to rejoin game
  socket.emit('game:join', { gameId });

  // 3. Server validates player is part of game
  // 4. Server loads state from Redis (still there!)
  // 5. Server sends full game state
  socket.on('game:state', (state) => {
    // 6. Client renders current state
    renderGameState(state);
  });

  // 7. Server notifies other players
  // Other players see: "Opponent reconnected"
}
```

**Server-side handler**:

```typescript
socket.on('game:join', async ({ gameId }) => {
  const userId = socket.data.userId;

  // Verify player is in this game
  const gamePlayer = await prisma.gamePlayer.findFirst({
    where: { gameId, userId }
  });

  if (!gamePlayer) {
    socket.emit('error', { message: 'Not part of this game' });
    return;
  }

  // Load state from Redis
  let gameState = await redis.get(`game:${gameId}:state`);

  if (!gameState) {
    // State expired from Redis, reconstruct from DB
    gameState = await reconstructGameState(gameId);

    // Restore to Redis
    await redis.setex(
      `game:${gameId}:state`,
      1800,
      JSON.stringify(gameState)
    );
  }

  const state = JSON.parse(gameState);

  // Mark player as connected
  const playerIndex = state.players.findIndex(p => p.userId === userId);
  state.players[playerIndex].isConnected = true;

  // Update Redis
  await redis.setex(
    `game:${gameId}:state`,
    1800,
    JSON.stringify(state)
  );

  // Join socket room
  socket.join(`game:${gameId}`);

  // Send full state to reconnecting player
  socket.emit('game:state', state);

  // Notify others
  socket.to(`game:${gameId}`).emit('player:joined', {
    userId,
    playerIndex,
    displayName: socket.data.displayName
  });
});
```

### Scenario 2: Long Disconnection (> 30 min, state expired from Redis)

**Less common**: Player left game open overnight, Redis TTL expired

```typescript
async function reconstructGameState(gameId: string): Promise<GameState> {
  // 1. Load game record
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      players: {
        include: { user: true }
      },
      moves: {
        orderBy: { moveNumber: 'asc' }
      }
    }
  });

  if (!game) {
    throw new Error('Game not found');
  }

  // 2. Check if we have a recent snapshot
  if (game.stateSnapshot) {
    // Use snapshot as starting point
    return game.stateSnapshot as GameState;
  }

  // 3. Reconstruct from move history
  const gameEngine = GameFactory.create(game.gameType);
  let state = gameEngine.initializeGame();

  // Replay all moves
  for (const move of game.moves) {
    const moveData = JSON.parse(move.moveData);
    state = gameEngine.applyMove(state, moveData);
  }

  // 4. Update player connection status
  state.players.forEach(p => {
    p.isConnected = false; // All disconnected since state expired
  });

  return state;
}
```

### Scenario 3: Mid-Move Disconnection

**Edge case**: Player disconnects while their move is being processed

```typescript
// Server maintains move queue per game
const moveQueues = new Map<string, Promise<any>>();

async function processMove(gameId: string, userId: string, moveData: any) {
  // Ensure moves are processed sequentially
  const previousMove = moveQueues.get(gameId) || Promise.resolve();

  const movePromise = previousMove.then(async () => {
    // Process move (as shown earlier)
    // ...
  });

  moveQueues.set(gameId, movePromise);

  try {
    return await movePromise;
  } catch (error) {
    // Move failed, but state is consistent
    throw error;
  } finally {
    // Clean up if last move
    if (moveQueues.get(gameId) === movePromise) {
      moveQueues.delete(gameId);
    }
  }
}
```

## Client-Side State Management

### Using Zustand for Game State

```typescript
// stores/gameStore.ts
import { create } from 'zustand';

interface GameStore {
  gameState: GameState | null;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  optimisticMoves: Move[];

  setGameState: (state: GameState) => void;
  setConnectionStatus: (status: string) => void;
  addOptimisticMove: (move: Move) => void;
  clearOptimisticMoves: () => void;
  revertOptimisticMove: (moveId: string) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  connectionStatus: 'disconnected',
  optimisticMoves: [],

  setGameState: (state) => set({ gameState: state }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  addOptimisticMove: (move) =>
    set((state) => ({
      optimisticMoves: [...state.optimisticMoves, move]
    })),

  clearOptimisticMoves: () => set({ optimisticMoves: [] }),

  revertOptimisticMove: (moveId) =>
    set((state) => ({
      optimisticMoves: state.optimisticMoves.filter(m => m.id !== moveId)
    }))
}));
```

### Optimistic Updates

```typescript
function makeMove(moveData: any) {
  const { gameState, addOptimisticMove, clearOptimisticMoves } = useGameStore();

  // 1. Create optimistic move
  const optimisticMove = {
    id: generateId(),
    moveData,
    timestamp: Date.now()
  };

  // 2. Apply optimistically (instant UI update)
  const optimisticState = gameEngine.applyMove(gameState, moveData);
  setGameState(optimisticState);
  addOptimisticMove(optimisticMove);

  // 3. Send to server
  socket.emit('game:move', { gameId, moveData });

  // 4. Wait for confirmation
  socket.once('game:move_made', (serverResponse) => {
    // Server confirmed, use server state (source of truth)
    setGameState(serverResponse.newGameState);
    clearOptimisticMoves();
  });

  socket.once('error', (error) => {
    // Move rejected, revert optimistic update
    setGameState(gameState); // Restore previous state
    clearOptimisticMoves();
    showError(error.message);
  });
}
```

### Reconnection UI

```typescript
// components/ReconnectionOverlay.tsx
export function ReconnectionOverlay() {
  const connectionStatus = useGameStore(s => s.connectionStatus);
  const [retryCount, setRetryCount] = useState(0);

  if (connectionStatus === 'connected') return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
        {connectionStatus === 'disconnected' ? (
          <>
            <h2 className="text-xl font-bold mb-4">Connection Lost</h2>
            <p className="text-gray-600 mb-4">
              You've been disconnected from the game. Your progress is saved.
            </p>
            <Button onClick={reconnect}>Reconnect</Button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Reconnecting...</h2>
            <p className="text-gray-600 mb-4">
              Attempting to reconnect ({retryCount}/5)
            </p>
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </>
        )}
      </div>
    </div>
  );
}
```

## Handling Edge Cases

### Case 1: Both Players Disconnect

```typescript
// Server: Check game activity periodically
setInterval(async () => {
  const games = await redis.keys('game:*:state');

  for (const key of games) {
    const state = JSON.parse(await redis.get(key));

    // Check if all players disconnected
    const allDisconnected = state.players.every(p => !p.isConnected);

    if (allDisconnected) {
      const timeSinceLastMove = Date.now() - new Date(state.lastMoveAt).getTime();

      // If no activity for 10 minutes, reduce TTL
      if (timeSinceLastMove > 10 * 60 * 1000) {
        await redis.expire(key, 300); // 5 minutes until cleanup
      }
    }
  }
}, 60 * 1000); // Check every minute
```

### Case 2: Player Opens Game in Multiple Tabs

```typescript
// Only allow one active connection per player per game
io.on('connection', (socket) => {
  socket.on('game:join', async ({ gameId }) => {
    const userId = socket.data.userId;

    // Find existing socket for this player in this game
    const room = io.sockets.adapter.rooms.get(`game:${gameId}`);
    if (room) {
      for (const socketId of room) {
        const otherSocket = io.sockets.sockets.get(socketId);
        if (otherSocket?.data.userId === userId) {
          // Disconnect old connection
          otherSocket.emit('error', {
            code: 'MULTIPLE_CONNECTIONS',
            message: 'Game opened in another tab'
          });
          otherSocket.disconnect();
        }
      }
    }

    // Continue with join...
  });
});
```

### Case 3: Conflicting Moves (Race Condition)

Prevented by Redis lock, but add additional validation:

```typescript
async function validateMoveSequence(gameId: string, expectedMoveNumber: number) {
  const state = await redis.get(`game:${gameId}:state`);
  const currentState = JSON.parse(state);

  if (currentState.moveCount !== expectedMoveNumber - 1) {
    throw new Error('Move sequence mismatch - game state changed');
  }
}

// Client sends expected move number
socket.emit('game:move', {
  gameId,
  moveData,
  expectedMoveNumber: gameState.moveCount + 1
});
```

## State Debugging Tools

### Admin Dashboard

```typescript
// app/admin/games/[gameId]/page.tsx
export default async function GameDebugPage({ params }) {
  const { gameId } = params;

  // Load from both sources
  const [redisState, dbGame] = await Promise.all([
    redis.get(`game:${gameId}:state`),
    prisma.game.findUnique({
      where: { id: gameId },
      include: { moves: true, players: true }
    })
  ]);

  return (
    <div>
      <h1>Game Debug: {gameId}</h1>

      <section>
        <h2>Redis State</h2>
        <pre>{JSON.stringify(JSON.parse(redisState), null, 2)}</pre>
      </section>

      <section>
        <h2>Database State</h2>
        <pre>{JSON.stringify(dbGame, null, 2)}</pre>
      </section>

      <section>
        <h2>Move History</h2>
        {dbGame.moves.map(move => (
          <div key={move.id}>
            Move {move.moveNumber}: {move.moveData}
          </div>
        ))}
      </section>
    </div>
  );
}
```

### State Validation

```typescript
// Periodically validate Redis state matches DB
async function validateStateConsistency(gameId: string) {
  const redisState = JSON.parse(await redis.get(`game:${gameId}:state`));
  const reconstructedState = await reconstructGameState(gameId);

  // Compare critical fields
  const discrepancies = [];

  if (redisState.moveCount !== reconstructedState.moveCount) {
    discrepancies.push('Move count mismatch');
  }

  if (redisState.status !== reconstructedState.status) {
    discrepancies.push('Status mismatch');
  }

  if (discrepancies.length > 0) {
    console.error('State inconsistency detected:', discrepancies);
    // Alert monitoring system
    Sentry.captureMessage('State inconsistency', {
      extra: { gameId, discrepancies }
    });
  }
}
```

---

This state management system ensures games are resilient, performant, and debuggable, providing a smooth experience even when network conditions are poor.
