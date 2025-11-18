# Game Timer System

## Overview

The timer system adds urgency and pacing to games, preventing stalling and ensuring smooth gameplay. Each game can have configurable time controls with different presets based on the game type.

## Timer Types

### Per-Player Timer (Chess Clock Style)

Most common for turn-based games. Each player has their own time bank.

**How it works:**
- Each player starts with X minutes
- On your turn, your clock counts down
- When you make a move, your clock stops, opponent's clock starts
- Optional: Add increment (e.g., +5 seconds per move)
- If your time runs out, you lose

**Best for:** War, Chess, strategic games

### Total Game Timer

Single shared timer for the entire game.

**How it works:**
- Game starts with X minutes total
- Clock counts down regardless of whose turn
- When time expires, game ends (winner = player with most points/cards)

**Best for:** Quick casual games, party games

### Move Timer (Fixed Time Per Turn)

Each move must be made within a fixed time.

**How it works:**
- You have X seconds per move (e.g., 30 seconds)
- Clock resets after each move
- If time expires, random valid move is made OR you lose the round

**Best for:** Fast-paced games, War (auto-flip mode)

## Database Schema

```prisma
// Add to Game model
model Game {
  id              String      @id @default(cuid())
  gameType        GameType
  status          GameStatus  @default(WAITING)

  // ... existing fields ...

  // Timer configuration
  timerConfig     Json?       // Timer settings for this game

  // Timer state (for active games)
  timerState      Json?       // Current timer state

  // ... rest of fields ...
}

// Timer configuration structure (stored in timerConfig)
interface TimerConfig {
  enabled: boolean;
  type: 'per-player' | 'total-game' | 'per-move';

  // Per-player timer settings
  initialTimeSeconds?: number;      // e.g., 600 (10 minutes)
  incrementSeconds?: number;        // e.g., 5 (add 5 seconds per move)

  // Total game timer settings
  totalTimeSeconds?: number;        // e.g., 300 (5 minutes)

  // Per-move timer settings
  moveTimeSeconds?: number;         // e.g., 30 (30 seconds per move)

  // Penalties
  timeoutAction: 'lose' | 'random-move' | 'skip-turn';
}

// Timer state structure (stored in timerState)
interface TimerState {
  // Per-player timers
  playerTimes?: {
    [playerIndex: number]: number;  // Remaining seconds
  };

  // Total game timer
  remainingSeconds?: number;

  // Active timer
  activePlayerIndex?: number;       // Whose clock is running
  lastUpdateTime: string;           // ISO timestamp of last update

  // Per-move timer
  currentMoveStartTime?: string;    // When current move started
  currentMoveTimeLimit?: number;    // Seconds allowed for this move
}
```

## Timer Presets by Game Type

### War Card Game Presets

```typescript
const warTimerPresets = [
  {
    id: 'war-blitz',
    name: 'Blitz',
    description: 'Lightning fast - 3 minutes per player',
    config: {
      enabled: true,
      type: 'per-player',
      initialTimeSeconds: 180,  // 3 minutes
      incrementSeconds: 2,
      timeoutAction: 'lose'
    }
  },
  {
    id: 'war-rapid',
    name: 'Rapid',
    description: 'Quick game - 5 minutes per player',
    config: {
      enabled: true,
      type: 'per-player',
      initialTimeSeconds: 300,  // 5 minutes
      incrementSeconds: 3,
      timeoutAction: 'lose'
    }
  },
  {
    id: 'war-standard',
    name: 'Standard',
    description: 'Normal pace - 10 minutes per player',
    config: {
      enabled: true,
      type: 'per-player',
      initialTimeSeconds: 600,  // 10 minutes
      incrementSeconds: 5,
      timeoutAction: 'lose'
    }
  },
  {
    id: 'war-casual',
    name: 'Casual',
    description: 'Relaxed - 15 minutes per player',
    config: {
      enabled: true,
      type: 'per-player',
      initialTimeSeconds: 900,  // 15 minutes
      incrementSeconds: 5,
      timeoutAction: 'lose'
    }
  },
  {
    id: 'war-untimed',
    name: 'No Timer',
    description: 'Take your time - no time limit',
    config: {
      enabled: false,
      type: 'per-player',
      timeoutAction: 'lose'
    }
  }
];
```

### Chess Timer Presets (Future)

```typescript
const chessTimerPresets = [
  {
    id: 'chess-bullet',
    name: 'Bullet',
    description: '1 minute per player',
    config: {
      enabled: true,
      type: 'per-player',
      initialTimeSeconds: 60,
      incrementSeconds: 0,
      timeoutAction: 'lose'
    }
  },
  {
    id: 'chess-blitz',
    name: 'Blitz',
    description: '3+2 (3 min + 2 sec increment)',
    config: {
      enabled: true,
      type: 'per-player',
      initialTimeSeconds: 180,
      incrementSeconds: 2,
      timeoutAction: 'lose'
    }
  },
  {
    id: 'chess-rapid',
    name: 'Rapid',
    description: '10+5 (10 min + 5 sec increment)',
    config: {
      enabled: true,
      type: 'per-player',
      initialTimeSeconds: 600,
      incrementSeconds: 5,
      timeoutAction: 'lose'
    }
  },
  {
    id: 'chess-classical',
    name: 'Classical',
    description: '30+20 (30 min + 20 sec increment)',
    config: {
      enabled: true,
      type: 'per-player',
      initialTimeSeconds: 1800,
      incrementSeconds: 20,
      timeoutAction: 'lose'
    }
  }
];
```

## Timer Implementation

### Server-Side Timer Management

```typescript
// server/timer/TimerManager.ts
export class TimerManager {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  startTimer(gameId: string, timerConfig: TimerConfig, timerState: TimerState) {
    // Clear existing timer
    this.stopTimer(gameId);

    if (!timerConfig.enabled) return;

    // Start interval to update clients every second
    const interval = setInterval(async () => {
      await this.updateTimer(gameId);
    }, 1000);

    this.timers.set(gameId, interval);
  }

  stopTimer(gameId: string) {
    const interval = this.timers.get(gameId);
    if (interval) {
      clearInterval(interval);
      this.timers.delete(gameId);
    }
  }

  private async updateTimer(gameId: string) {
    // Load game state from Redis
    const gameStateJson = await redis.get(`game:${gameId}:state`);
    if (!gameStateJson) {
      this.stopTimer(gameId);
      return;
    }

    const gameState = JSON.parse(gameStateJson);
    const { timerConfig, timerState } = gameState;

    if (!timerConfig?.enabled) {
      this.stopTimer(gameId);
      return;
    }

    // Calculate elapsed time
    const now = Date.now();
    const lastUpdate = new Date(timerState.lastUpdateTime).getTime();
    const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);

    if (elapsedSeconds === 0) return; // No update needed

    // Update timer based on type
    let timeExpired = false;

    if (timerConfig.type === 'per-player') {
      const activePlayer = timerState.activePlayerIndex;
      if (activePlayer !== undefined) {
        const currentTime = timerState.playerTimes[activePlayer];
        const newTime = Math.max(0, currentTime - elapsedSeconds);
        timerState.playerTimes[activePlayer] = newTime;

        if (newTime === 0) {
          timeExpired = true;
        }
      }
    } else if (timerConfig.type === 'total-game') {
      const newTime = Math.max(0, timerState.remainingSeconds - elapsedSeconds);
      timerState.remainingSeconds = newTime;

      if (newTime === 0) {
        timeExpired = true;
      }
    } else if (timerConfig.type === 'per-move') {
      const moveStartTime = new Date(timerState.currentMoveStartTime).getTime();
      const moveElapsed = Math.floor((now - moveStartTime) / 1000);

      if (moveElapsed >= timerState.currentMoveTimeLimit) {
        timeExpired = true;
      }
    }

    // Update last update time
    timerState.lastUpdateTime = new Date().toISOString();

    // Save updated state
    gameState.timerState = timerState;
    await redis.setex(
      `game:${gameId}:state`,
      1800,
      JSON.stringify(gameState)
    );

    // Broadcast timer update to all players
    this.io.to(`game:${gameId}`).emit('timer:update', {
      timerState,
      timeExpired
    });

    // Handle timeout
    if (timeExpired) {
      this.handleTimeout(gameId, timerConfig, gameState);
    }
  }

  private async handleTimeout(
    gameId: string,
    timerConfig: TimerConfig,
    gameState: any
  ) {
    this.stopTimer(gameId);

    switch (timerConfig.timeoutAction) {
      case 'lose':
        // Current player loses
        const losingPlayer = gameState.timerState.activePlayerIndex;
        const winningPlayer = losingPlayer === 0 ? 1 : 0;

        gameState.status = 'COMPLETED';
        gameState.winnerId = gameState.players[winningPlayer].userId;

        // Save and broadcast game over
        await redis.setex(
          `game:${gameId}:state`,
          1800,
          JSON.stringify(gameState)
        );

        this.io.to(`game:${gameId}`).emit('game:over', {
          winnerId: gameState.winnerId,
          reason: 'timeout',
          finalState: gameState
        });

        // Finalize in database
        await finalizeGame(gameId, gameState);
        break;

      case 'random-move':
        // Make a random valid move
        const validMoves = getValidMoves(gameState);
        if (validMoves.length > 0) {
          const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
          await processMove(gameId, gameState.players[gameState.timerState.activePlayerIndex].userId, randomMove);
        }
        break;

      case 'skip-turn':
        // Skip to next player
        gameState.currentTurn = (gameState.currentTurn + 1) % gameState.players.length;
        await redis.setex(
          `game:${gameId}:state`,
          1800,
          JSON.stringify(gameState)
        );
        this.io.to(`game:${gameId}`).emit('game:move_made', {
          moveData: { skipped: true },
          newGameState: gameState
        });
        break;
    }
  }

  pauseTimer(gameId: string) {
    // Stop the interval but keep timer state
    const interval = this.timers.get(gameId);
    if (interval) {
      clearInterval(interval);
      this.timers.delete(gameId);
    }
  }

  resumeTimer(gameId: string, timerConfig: TimerConfig, timerState: TimerState) {
    this.startTimer(gameId, timerConfig, timerState);
  }

  switchActiveTimer(gameId: string, newPlayerIndex: number, addIncrement: boolean = true) {
    // Called when a move is made
    // 1. Stop current player's timer
    // 2. Add increment if configured
    // 3. Start next player's timer
  }
}
```

### Socket Event Handlers

```typescript
// server/handlers/timer.handler.ts

export function setupTimerHandlers(io: Server, timerManager: TimerManager) {

  io.on('connection', (socket) => {

    // When a move is made, handle timer switch
    socket.on('game:move', async (data) => {
      const { gameId, moveData } = data;
      const userId = socket.data.userId;

      // ... validate and process move ...

      // Handle timer
      const gameState = await getGameState(gameId);
      const { timerConfig, timerState } = gameState;

      if (timerConfig?.enabled && timerConfig.type === 'per-player') {
        // Add increment to player who just moved
        const currentPlayerIndex = gameState.players.findIndex(p => p.userId === userId);

        if (timerConfig.incrementSeconds > 0) {
          timerState.playerTimes[currentPlayerIndex] += timerConfig.incrementSeconds;
        }

        // Switch to next player's timer
        const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
        timerState.activePlayerIndex = nextPlayerIndex;
        timerState.lastUpdateTime = new Date().toISOString();

        // Update state
        gameState.timerState = timerState;
        await saveGameState(gameId, gameState);

        // Notify timer manager
        timerManager.switchActiveTimer(gameId, nextPlayerIndex, false);
      }

      // Broadcast move
      io.to(`game:${gameId}`).emit('game:move_made', {
        userId,
        moveData,
        newGameState: gameState
      });
    });

    // Pause timer (e.g., player goes to settings)
    socket.on('timer:pause', async ({ gameId }) => {
      // Only allow in casual games or by both players agreeing
      timerManager.pauseTimer(gameId);
    });

    // Resume timer
    socket.on('timer:resume', async ({ gameId }) => {
      const gameState = await getGameState(gameId);
      timerManager.resumeTimer(gameId, gameState.timerConfig, gameState.timerState);
    });
  });
}
```

## Client-Side Timer Display

### Timer Component

```typescript
// components/game/GameTimer.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { motion } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';

interface TimerProps {
  playerIndex: number;
  timerConfig: TimerConfig;
  timerState: TimerState;
  isActive: boolean;
}

export function GameTimer({ playerIndex, timerConfig, timerState, isActive }: TimerProps) {
  const [displayTime, setDisplayTime] = useState(0);
  const socket = useSocket();

  useEffect(() => {
    // Initialize display time
    if (timerConfig.type === 'per-player') {
      setDisplayTime(timerState.playerTimes[playerIndex]);
    } else if (timerConfig.type === 'total-game') {
      setDisplayTime(timerState.remainingSeconds);
    }

    // Listen for timer updates
    socket.on('timer:update', (data) => {
      if (timerConfig.type === 'per-player') {
        setDisplayTime(data.timerState.playerTimes[playerIndex]);
      } else if (timerConfig.type === 'total-game') {
        setDisplayTime(data.timerState.remainingSeconds);
      }
    });

    return () => {
      socket.off('timer:update');
    };
  }, [socket, timerConfig, timerState, playerIndex]);

  // Client-side countdown (for smooth UI)
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setDisplayTime(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;
  const isLowTime = displayTime < 30;
  const isCritical = displayTime < 10;

  return (
    <motion.div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold transition-colors',
        isActive && 'bg-primary-100 border-2 border-primary-500',
        !isActive && 'bg-gray-100',
        isLowTime && 'bg-yellow-100 border-yellow-500',
        isCritical && 'bg-red-100 border-red-500 animate-pulse'
      )}
      animate={{
        scale: isActive ? [1, 1.05, 1] : 1
      }}
      transition={{
        duration: 1,
        repeat: isActive ? Infinity : 0
      }}
    >
      <Clock className={cn(
        'w-5 h-5',
        isActive && 'text-primary-500',
        isLowTime && 'text-yellow-600',
        isCritical && 'text-red-600'
      )} />

      <span className={cn(
        isActive && 'text-primary-700',
        isLowTime && 'text-yellow-700',
        isCritical && 'text-red-700'
      )}>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>

      {isCritical && (
        <AlertCircle className="w-5 h-5 text-red-600 animate-bounce" />
      )}
    </motion.div>
  );
}
```

### Timer Selection UI (Create Game)

```typescript
// components/lobby/TimerSelector.tsx
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Zap, Coffee } from 'lucide-react';

interface TimerSelectorProps {
  gameType: string;
  onSelect: (preset: TimerPreset) => void;
}

export function TimerSelector({ gameType, onSelect }: TimerSelectorProps) {
  const presets = getTimerPresets(gameType);
  const [selected, setSelected] = useState(presets[2]); // Default to standard

  const handleSelect = (preset: TimerPreset) => {
    setSelected(preset);
    onSelect(preset);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Time Control
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {presets.map((preset) => (
          <Card
            key={preset.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-lg',
              selected.id === preset.id && 'border-2 border-primary-500 bg-primary-50'
            )}
            onClick={() => handleSelect(preset)}
          >
            <CardHeader className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {getPresetIcon(preset.id)}
                <CardTitle className="text-base">{preset.name}</CardTitle>
              </div>
              <CardDescription className="text-sm">
                {preset.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Custom timer option */}
      <Button variant="outline" className="w-full">
        Custom Time Control
      </Button>
    </div>
  );
}

function getPresetIcon(presetId: string) {
  if (presetId.includes('blitz') || presetId.includes('bullet')) {
    return <Zap className="w-4 h-4 text-yellow-500" />;
  }
  if (presetId.includes('casual') || presetId.includes('untimed')) {
    return <Coffee className="w-4 h-4 text-green-500" />;
  }
  return <Clock className="w-4 h-4 text-blue-500" />;
}
```

## Timer Persistence During Reconnection

When a player reconnects:

1. Server sends full game state including `timerState`
2. Client calculates current time based on `lastUpdateTime`
3. Timer resumes from correct position
4. No time is lost during disconnection (clock pauses when player disconnects)

```typescript
// On reconnection
socket.on('game:state', (gameState) => {
  const { timerState, timerConfig } = gameState;

  if (timerConfig?.enabled) {
    // Calculate actual time elapsed since last update
    const now = Date.now();
    const lastUpdate = new Date(timerState.lastUpdateTime).getTime();
    const elapsed = Math.floor((now - lastUpdate) / 1000);

    // Adjust displayed time
    if (timerConfig.type === 'per-player') {
      const activePlayer = timerState.activePlayerIndex;
      timerState.playerTimes[activePlayer] = Math.max(
        0,
        timerState.playerTimes[activePlayer] - elapsed
      );
    }

    // Start local countdown
    startLocalTimer(timerConfig, timerState);
  }
});
```

## API Updates

### Create Game with Timer

```typescript
// POST /api/games
{
  "gameType": "WAR",
  "maxPlayers": 2,
  "timerPresetId": "war-rapid"  // or "custom"
  // If custom:
  "customTimer": {
    "type": "per-player",
    "initialTimeSeconds": 420,
    "incrementSeconds": 3,
    "timeoutAction": "lose"
  }
}
```

### Get Game with Timer Info

```typescript
// GET /api/games/[gameId]
{
  "game": {
    "id": "game_123",
    "gameType": "WAR",
    "timerConfig": {
      "enabled": true,
      "type": "per-player",
      "initialTimeSeconds": 300,
      "incrementSeconds": 3,
      "timeoutAction": "lose"
    },
    "timerState": {
      "playerTimes": {
        "0": 285,
        "1": 298
      },
      "activePlayerIndex": 0,
      "lastUpdateTime": "2024-01-15T10:35:00Z"
    }
  }
}
```

## Testing Considerations

```typescript
// Test timer expiration
test('should end game when player time expires', async () => {
  // Set up game with 1 second timer
  // Wait for expiration
  // Verify game over event
  // Verify winner is correct
});

// Test increment
test('should add increment after move', async () => {
  // Make move
  // Verify time increased by increment
});

// Test reconnection
test('should maintain timer state after reconnection', async () => {
  // Start game with timer
  // Disconnect player
  // Wait 5 seconds
  // Reconnect
  // Verify timer shows correct time
});
```

---

This timer system adds excitement and prevents games from stalling while being flexible enough to accommodate different play styles and game types.
