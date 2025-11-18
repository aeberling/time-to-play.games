# Technical Architecture

## Overview

Time to Play uses a modern, cloud-native architecture optimized for real-time turn-based gaming. The system is designed to be simple, scalable, and maintainable while providing excellent user experience.

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + Zustand for complex state
- **Real-time**: Socket.io-client
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation

**Why Next.js?**
- Server-side rendering for SEO and performance
- API routes for backend logic
- Built-in optimization (images, fonts, code splitting)
- Excellent developer experience
- Easy deployment to Kinsta

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js (via Next.js API routes + standalone WebSocket server)
- **Language**: TypeScript
- **WebSocket**: Socket.io
- **Validation**: Zod
- **Authentication**: JWT + HTTP-only cookies

**Architecture Pattern**: Hybrid
- Next.js handles HTTP requests, rendering, and simple API endpoints
- Standalone Node.js + Socket.io server handles real-time game logic
- Both services share TypeScript types and business logic

### Database & Cache
- **Primary Database**: PostgreSQL 15+ (via Neon or Supabase)
- **Cache/Active Games**: Redis 7+ (via Upstash or Redis Cloud)
- **ORM**: Prisma
- **Migrations**: Prisma Migrate

**Data Flow**:
1. Active games live in Redis (fast access, automatic expiration)
2. Every significant game event writes to PostgreSQL
3. Game completion triggers final state save to PostgreSQL
4. Historical data queries hit PostgreSQL only

### Infrastructure
- **Hosting**: Kinsta Application Hosting
- **Database**: Managed PostgreSQL (Neon or Kinsta's managed DB)
- **Redis**: Upstash (serverless Redis)
- **File Storage**: Kinsta's storage or S3 for custom card graphics
- **CDN**: Cloudflare (via Kinsta)
- **Monitoring**: Sentry + built-in Kinsta monitoring

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │   Next.js UI   │  │  Socket.io Client│  │   Service   │ │
│  │   (React)      │◄─┤  (WebSocket)     │  │   Worker    │ │
│  └────────┬───────┘  └────────┬─────────┘  └─────────────┘ │
└───────────┼──────────────────┼─────────────────────────────┘
            │                  │
            │ HTTPS            │ WSS
            │                  │
┌───────────▼──────────────────▼─────────────────────────────┐
│                      Kinsta / CDN                            │
└───────────┬──────────────────┬─────────────────────────────┘
            │                  │
    ┌───────▼────────┐  ┌──────▼────────────┐
    │  Next.js App   │  │  WebSocket Server │
    │  (SSR + API)   │  │   (Socket.io)     │
    │                │  │                   │
    │  - Page Routes │  │  - Game Rooms     │
    │  - API Routes  │  │  - Turn Logic     │
    │  - Auth        │  │  - State Sync     │
    └───────┬────────┘  └──────┬────────────┘
            │                  │
            │                  │
    ┌───────▼──────────────────▼────────┐
    │      Shared Business Logic        │
    │   - Game Rules                    │
    │   - Validation                    │
    │   - Types (TypeScript)            │
    └───────┬───────────────────────────┘
            │
    ┌───────┴────────┬────────────┐
    │                │            │
┌───▼──────┐  ┌─────▼─────┐  ┌──▼──────┐
│PostgreSQL│  │   Redis   │  │   S3    │
│          │  │           │  │(Kinsta) │
│- Users   │  │- Active   │  │         │
│- Games   │  │  Games    │  │- Card   │
│- Stats   │  │- Sessions │  │  Sets   │
│- History │  │- Cache    │  │- Assets │
└──────────┘  └───────────┘  └─────────┘
```

## Core Services Architecture

### 1. Next.js Application (Frontend + API)

**Responsibilities**:
- Render game UI (SSR and client-side)
- Handle HTTP requests (page loads, API calls)
- User authentication (JWT generation/validation)
- Serve static assets
- SEO optimization

**Key Routes**:
```
/                          → Landing page
/play                      → Game lobby
/game/[gameId]            → Active game view
/profile                   → User profile
/history                   → Game history
/api/auth/*               → Authentication endpoints
/api/user/*               → User management
/api/games/*              → Game CRUD operations
```

### 2. WebSocket Server (Real-time Game Logic)

**Responsibilities**:
- Maintain persistent connections with players
- Process game moves in real-time
- Synchronize game state across clients
- Handle player connections/disconnections
- Manage game rooms

**Socket Events**:
```typescript
// Client → Server
'game:join'         → Join a game room
'game:move'         → Submit a move
'game:reconnect'    → Reconnect to existing game
'player:ready'      → Mark player as ready

// Server → Client
'game:state'        → Full game state update
'game:move_made'    → Another player made a move
'game:over'         → Game ended
'player:joined'     → New player joined
'player:left'       → Player disconnected
'error'             → Error message
```

### 3. Game Engine (Shared Library)

**Responsibilities**:
- Game rule enforcement
- Move validation
- State transitions
- Win condition checking
- Turn management

**Structure**:
```
/lib/games/
  /core/
    Game.interface.ts       → Base game interface
    GameState.interface.ts  → State structure
    Player.interface.ts     → Player structure

  /war/
    WarGame.ts             → War game implementation
    WarState.ts            → War-specific state
    WarRules.ts            → War game rules

  /future-games/
    ChessGame.ts
    HeartsGame.ts
```

## Data Flow

### Starting a Game

1. Player clicks "Start New Game" in UI
2. Next.js API route `POST /api/games` creates game record in PostgreSQL
3. Server initializes game state in Redis with 30min TTL
4. Server returns game ID to client
5. Client navigates to `/game/[gameId]`
6. Client establishes WebSocket connection
7. Socket server loads game state from Redis
8. Client receives `game:state` event with full state

### Making a Move

1. Player makes move in UI (e.g., clicks card)
2. Client validates move locally (instant feedback)
3. Client emits `game:move` to WebSocket server
4. Server validates move against game rules
5. Server updates game state in Redis
6. Server broadcasts `game:move_made` to all players
7. Server saves move to PostgreSQL (async)
8. Clients update their local state

### Handling Disconnection

1. Socket.io detects connection loss
2. Server marks player as "disconnected" in Redis (keeps state)
3. Server broadcasts `player:left` to remaining players
4. Game state remains active in Redis (30min TTL)
5. When player returns:
   - Loads game page → authenticates via JWT
   - Establishes new WebSocket connection
   - Emits `game:reconnect` with game ID
   - Server validates player ID + game ID
   - Server sends full `game:state` to reconnected player
   - Server broadcasts `player:joined` to others

## Security Considerations

### Authentication
- Guest tokens: Short-lived JWT (7 days), stored in HTTP-only cookie
- Registered users: Refresh token pattern (access token 15min, refresh 30 days)
- WebSocket authentication: Validate JWT on connection handshake

### Authorization
- Players can only make moves in games they're part of
- All moves validated server-side (never trust client)
- Rate limiting: 10 moves per 10 seconds per player

### Data Protection
- All connections over HTTPS/WSS
- Sensitive data encrypted at rest (PostgreSQL)
- No PII in Redis (only game IDs and player IDs)
- CORS restricted to time-to-play.games domain

## Performance Optimizations

### Caching Strategy
- Static assets: CDN cache (Cloudflare)
- Game state: Redis (sub-millisecond access)
- User profiles: Redis cache (5min TTL)
- Historical games: PostgreSQL with indexes

### Connection Management
- Socket.io connection pooling
- Redis connection pooling (max 10 connections)
- PostgreSQL connection pooling (via Prisma)

### Code Splitting
- Next.js automatic code splitting
- Dynamic imports for game components
- Lazy loading for non-critical features

## Scalability Plan

### Current (10-100 users)
- Single Next.js instance
- Single WebSocket server
- Single Redis instance
- Managed PostgreSQL

### Future (100-1000 users)
- Multiple Next.js instances (horizontal scaling)
- Multiple WebSocket servers with Redis Pub/Sub
- Redis cluster
- PostgreSQL read replicas

### Monitoring & Observability
- Application logs: Kinsta logs + Sentry
- Performance metrics: Web Vitals
- Real-time monitoring: Socket.io admin UI
- Database metrics: Prisma insights
- Error tracking: Sentry
- Uptime monitoring: UptimeRobot

## Development Workflow

### Local Development
```bash
npm run dev          # Starts Next.js + WebSocket server
npm run db:studio    # Opens Prisma Studio
npm run test         # Runs test suite
```

### CI/CD Pipeline
1. Push to GitHub
2. GitHub Actions runs:
   - TypeScript type checking
   - ESLint
   - Unit tests
   - Integration tests
3. On merge to main:
   - Build production bundle
   - Deploy to Kinsta via Git push
   - Run database migrations
   - Health check

## File Structure

```
time-to-play.games/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   ├── game/[gameId]/
│   │   ├── play/
│   │   └── api/
│   ├── components/             # React components
│   │   ├── ui/                # shadcn components
│   │   ├── game/              # Game-specific components
│   │   └── layout/            # Layout components
│   ├── lib/                    # Shared utilities
│   │   ├── games/             # Game engine
│   │   ├── db/                # Database client
│   │   ├── redis/             # Redis client
│   │   └── auth/              # Auth utilities
│   ├── server/                 # WebSocket server
│   │   ├── socket.ts          # Socket.io setup
│   │   ├── game-room.ts       # Game room logic
│   │   └── handlers/          # Socket event handlers
│   └── types/                  # TypeScript types
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration files
├── public/                     # Static assets
│   └── cards/                 # Card graphics
├── tests/                      # Test files
└── reference/                  # Documentation
```

---

This architecture provides a solid foundation that's simple enough for rapid development but robust enough to scale as the platform grows.
