# Database Schema & Data Models

## Overview

Time to Play uses PostgreSQL for persistent data storage and Redis for active game state. This document outlines the complete data model, relationships, and indexing strategy.

## PostgreSQL Schema (Persistent Data)

### Users Table

Stores both guest and registered user accounts.

```prisma
model User {
  id            String    @id @default(cuid())
  username      String?   @unique
  email         String?   @unique
  passwordHash  String?

  // User type
  isGuest       Boolean   @default(true)
  guestToken    String?   @unique // For guest users

  // Profile
  displayName   String
  avatarUrl     String?

  // Timestamps
  createdAt     DateTime  @default(now())
  lastSeenAt    DateTime  @default(now())

  // Relations
  games         GamePlayer[]
  stats         UserStats?

  @@index([email])
  @@index([guestToken])
}
```

**Notes**:
- Guest users: `isGuest=true`, no email/password, unique `guestToken`
- Registered users: `isGuest=false`, required email/password
- `displayName` defaults to "Guest_XXXX" for guests
- Converting guest to registered: update `isGuest`, add email/password, keep existing stats

### Games Table

Stores all games (active and completed).

```prisma
model Game {
  id              String      @id @default(cuid())
  gameType        GameType    // 'WAR', 'CHESS', etc.
  status          GameStatus  @default(WAITING)

  // Game configuration
  maxPlayers      Int         @default(2)
  currentTurn     Int         @default(0) // Index of current player

  // Game state (snapshot)
  stateSnapshot   Json?       // Latest state from Redis

  // Results
  winnerId        String?
  winnerPlayer    User?       @relation("GameWinner", fields: [winnerId], references: [id])

  // Timestamps
  createdAt       DateTime    @default(now())
  startedAt       DateTime?
  completedAt     DateTime?

  // Relations
  players         GamePlayer[]
  moves           GameMove[]

  @@index([status])
  @@index([gameType])
  @@index([createdAt])
}

enum GameType {
  WAR
  CHESS
  HEARTS
  SPADES
}

enum GameStatus {
  WAITING     // Waiting for players
  READY       // All players joined, not started
  IN_PROGRESS // Game is active
  COMPLETED   // Game finished normally
  ABANDONED   // Game abandoned/timed out
}
```

### GamePlayer Table

Junction table for game participants.

```prisma
model GamePlayer {
  id              String      @id @default(cuid())

  // Relations
  gameId          String
  game            Game        @relation(fields: [gameId], references: [id], onDelete: Cascade)
  userId          String
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Player info
  playerIndex     Int         // 0, 1, 2, 3 (position in game)
  isReady         Boolean     @default(false)

  // Connection status
  isConnected     Boolean     @default(false)
  lastConnectedAt DateTime    @default(now())

  // Results
  placement       Int?        // 1=winner, 2=second, etc.
  score           Int?        // Game-specific score

  // Timestamps
  joinedAt        DateTime    @default(now())

  @@unique([gameId, userId])
  @@unique([gameId, playerIndex])
  @@index([userId])
  @@index([gameId])
}
```

### GameMove Table

Records every move made in a game (for replay/history).

```prisma
model GameMove {
  id              String      @id @default(cuid())

  // Relations
  gameId          String
  game            Game        @relation(fields: [gameId], references: [id], onDelete: Cascade)
  userId          String      // Player who made the move

  // Move data
  moveNumber      Int         // Sequential move counter
  moveData        Json        // Game-specific move data

  // Timestamps
  createdAt       DateTime    @default(now())

  @@index([gameId, moveNumber])
  @@index([gameId, createdAt])
}
```

### UserStats Table

Aggregated statistics per user per game type.

```prisma
model UserStats {
  id              String      @id @default(cuid())

  // Relations
  userId          String      @unique
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  // War game stats
  warGamesPlayed  Int         @default(0)
  warGamesWon     Int         @default(0)
  warGamesLost    Int         @default(0)
  warWinRate      Float       @default(0)
  warElo          Int         @default(1200)

  // Chess stats (future)
  chessGamesPlayed Int        @default(0)
  chessGamesWon    Int        @default(0)
  chessGamesLost   Int        @default(0)
  chessElo         Int        @default(1200)

  // Overall
  totalGamesPlayed Int        @default(0)
  totalGamesWon    Int        @default(0)
  longestWinStreak Int        @default(0)
  currentWinStreak Int        @default(0)

  // Timestamps
  updatedAt       DateTime    @updatedAt
}
```

## Redis Data Structures (Active Games)

Redis stores hot, active game data with automatic expiration. All keys use a consistent prefix.

### Active Game State

**Key Pattern**: `game:{gameId}:state`
**Type**: JSON String
**TTL**: 30 minutes (refreshed on each move)

```typescript
interface RedisGameState {
  gameId: string;
  gameType: 'WAR' | 'CHESS' | 'HEARTS';
  status: 'WAITING' | 'READY' | 'IN_PROGRESS' | 'COMPLETED';

  players: {
    userId: string;
    displayName: string;
    playerIndex: number;
    isConnected: boolean;
    isReady: boolean;
  }[];

  currentTurn: number; // Index of current player

  // Game-specific state (example for War)
  gameState: WarGameState | ChessGameState | HeartsGameState;

  // Metadata
  createdAt: string;
  lastMoveAt: string;
  moveCount: number;
}
```

### Player Session

**Key Pattern**: `player:{userId}:session`
**Type**: JSON String
**TTL**: 24 hours

```typescript
interface PlayerSession {
  userId: string;
  socketId: string; // Current socket connection
  currentGameId: string | null;
  lastActiveAt: string;
}
```

### Active Game List (for matchmaking)

**Key Pattern**: `games:waiting`
**Type**: Sorted Set
**Score**: Timestamp

```typescript
// Members: gameId
// Score: Unix timestamp of creation
ZADD games:waiting {timestamp} {gameId}
```

### Game Lock (prevent concurrent modifications)

**Key Pattern**: `game:{gameId}:lock`
**Type**: String
**TTL**: 10 seconds

Used to prevent race conditions when multiple players move simultaneously.

## Data Access Patterns

### Pattern 1: Creating a New Game

1. **PostgreSQL**: Insert into `Game` table
2. **PostgreSQL**: Insert into `GamePlayer` table for creator
3. **Redis**: Create `game:{gameId}:state` with initial state
4. **Redis**: Add gameId to `games:waiting` sorted set

### Pattern 2: Joining a Game

1. **PostgreSQL**: Insert into `GamePlayer` table
2. **Redis**: Update `game:{gameId}:state` with new player
3. **Redis**: If game full, remove from `games:waiting`

### Pattern 3: Making a Move

1. **Redis**: Acquire lock `game:{gameId}:lock`
2. **Redis**: Read `game:{gameId}:state`
3. Validate move (in-memory)
4. **Redis**: Update `game:{gameId}:state`
5. **Redis**: Update `player:{userId}:session` lastActiveAt
6. **PostgreSQL**: Insert into `GameMove` (async, non-blocking)
7. **Redis**: Release lock

### Pattern 4: Game Completion

1. **Redis**: Update `game:{gameId}:state` status to COMPLETED
2. **PostgreSQL**: Update `Game` table (status, winner, completedAt)
3. **PostgreSQL**: Update `GamePlayer` table (placement, score)
4. **PostgreSQL**: Update `UserStats` for all players
5. **PostgreSQL**: Insert final state snapshot into `Game.stateSnapshot`
6. **Redis**: Set TTL to 5 minutes (allow reconnection for viewing)

### Pattern 5: Reconnecting to Game

1. **Redis**: Check `player:{userId}:session` for currentGameId
2. **Redis**: Read `game:{gameId}:state`
3. Send full game state to client
4. **Redis**: Update player `isConnected` in state
5. **PostgreSQL**: Update `GamePlayer.lastConnectedAt`

### Pattern 6: Viewing Game History

1. **PostgreSQL**: Read from `Game` table with `GamePlayer` join
2. **PostgreSQL**: Read from `GameMove` table ordered by moveNumber
3. Reconstruct game state from moves (or use stateSnapshot)

## Indexing Strategy

### PostgreSQL Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_guest_token ON users(guest_token);

-- Games
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_type ON games(game_type);
CREATE INDEX idx_games_created_at ON games(created_at DESC);

-- GamePlayer
CREATE INDEX idx_game_player_user_id ON game_player(user_id);
CREATE INDEX idx_game_player_game_id ON game_player(game_id);
CREATE UNIQUE INDEX idx_game_player_unique ON game_player(game_id, user_id);

-- GameMove
CREATE INDEX idx_game_move_game_id ON game_move(game_id, move_number);
CREATE INDEX idx_game_move_created_at ON game_move(game_id, created_at);
```

### Redis Optimization

- Use pipelining for batch operations
- Use Lua scripts for atomic multi-key operations
- Monitor key expiration to ensure cleanup

## Data Consistency

### Consistency Guarantees

1. **Strong Consistency**: PostgreSQL (ACID compliant)
2. **Eventual Consistency**: Redis → PostgreSQL sync
3. **Conflict Resolution**: Last-write-wins with Redis locks

### Backup Strategy

- **PostgreSQL**: Daily automated backups (provided by Neon/Kinsta)
- **Redis**: No backups needed (ephemeral data, can reconstruct from PostgreSQL)

### Data Recovery

If Redis fails:
1. All active games can be reconstructed from `Game` and `GameMove` tables
2. Player sessions will require reconnection
3. Players will see "reconnecting" UI, seamlessly resume

## Sample Queries

### Get User's Active Games

```typescript
const activeGames = await prisma.game.findMany({
  where: {
    players: {
      some: { userId: userId }
    },
    status: { in: ['WAITING', 'READY', 'IN_PROGRESS'] }
  },
  include: {
    players: {
      include: { user: true }
    }
  }
});
```

### Get User's Game History

```typescript
const history = await prisma.game.findMany({
  where: {
    players: {
      some: { userId: userId }
    },
    status: 'COMPLETED'
  },
  include: {
    players: {
      include: { user: true }
    }
  },
  orderBy: { completedAt: 'desc' },
  take: 20
});
```

### Get User Statistics

```typescript
const stats = await prisma.userStats.findUnique({
  where: { userId: userId }
});
```

### Get Available Games to Join

```typescript
const availableGames = await prisma.game.findMany({
  where: {
    status: 'WAITING',
    players: {
      some: { isReady: false }
    }
  },
  include: {
    players: {
      include: { user: true }
    }
  }
});
```

## Migration Strategy

### Initial Setup

1. Run Prisma migrations: `npx prisma migrate deploy`
2. Seed database with test data: `npx prisma db seed`

### Schema Updates

1. Update `prisma/schema.prisma`
2. Generate migration: `npx prisma migrate dev --name description`
3. Review SQL in `prisma/migrations/`
4. Deploy: `npx prisma migrate deploy`

### Zero-Downtime Migrations

For breaking changes:
1. Add new columns/tables (backwards compatible)
2. Deploy application code that writes to both old and new schema
3. Migrate data in background
4. Deploy code that reads from new schema
5. Remove old columns/tables

---

This schema is designed to be simple yet flexible, allowing for easy addition of new game types while maintaining data integrity and performance.
