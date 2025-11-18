# Quick Reference Guide

A cheat sheet for developers building Time to Play. Keep this handy while coding!

## 🚀 Setup Commands

```bash
# Initial setup
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# Database commands
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create new migration
npx prisma migrate deploy  # Run migrations (production)
npx prisma db seed        # Seed database

# Development
npm run dev                # Start dev server
npm run build             # Build for production
npm run start             # Start production server
npm run lint              # Run linter
npm run type-check        # TypeScript check
npm test                  # Run tests
```

## 📁 File Locations

```
Where to find/create files:

API Routes:           src/app/api/[endpoint]/route.ts
Pages:                src/app/[page]/page.tsx
Components:           src/components/[category]/[Component].tsx
Game Engines:         src/lib/games/[game]/[Game].ts
Database Schema:      prisma/schema.prisma
Socket Handlers:      src/server/handlers/[handler].ts
Types:                src/types/[domain].types.ts
Hooks:                src/hooks/use[Hook].ts
Stores:               src/stores/[store].ts
```

## 🎮 Game Implementation Checklist

When adding a new game:

- [ ] Create game engine: `src/lib/games/[game]/[Game].ts`
- [ ] Define game state interface: `src/types/game.types.ts`
- [ ] Add game type to database enum
- [ ] Create game board component: `src/components/game/[Game]GameBoard.tsx`
- [ ] Add socket event handlers in `src/server/handlers/game-move.handler.ts`
- [ ] Create game route: `src/app/game/[gameId]/page.tsx`
- [ ] Add to game factory: `src/lib/games/GameFactory.ts`
- [ ] Write unit tests: `__tests__/games/[Game].test.ts`
- [ ] Update game selection UI
- [ ] Add game preview/tutorial

## 🔌 Socket.io Events

### Client → Server

```typescript
// Join game
socket.emit('game:join', { gameId: string })

// Make move
socket.emit('game:move', {
  gameId: string,
  moveData: any
})

// Leave game
socket.emit('game:leave', { gameId: string })

// Mark ready
socket.emit('player:ready', { gameId: string })
```

### Server → Client

```typescript
// Full game state
socket.on('game:state', (state: GameState) => {})

// Move was made
socket.on('game:move_made', (data: {
  userId: string,
  moveData: any,
  newGameState: GameState
}) => {})

// Game ended
socket.on('game:over', (data: {
  winnerId: string,
  reason: string,
  finalState: GameState
}) => {})

// Player joined
socket.on('player:joined', (data: {
  userId: string,
  displayName: string,
  playerIndex: number
}) => {})

// Player left
socket.on('player:left', (data: {
  userId: string,
  playerIndex: number,
  canReconnect: boolean
}) => {})

// Error occurred
socket.on('error', (error: {
  code: string,
  message: string
}) => {})
```

## 🗄️ Database Queries (Prisma)

```typescript
// Find user by ID
await prisma.user.findUnique({
  where: { id: userId }
})

// Get user with stats
await prisma.user.findUnique({
  where: { id: userId },
  include: { stats: true }
})

// Get active games
await prisma.game.findMany({
  where: { status: { in: ['WAITING', 'IN_PROGRESS'] } },
  include: { players: { include: { user: true } } }
})

// Get user's games
await prisma.game.findMany({
  where: {
    players: { some: { userId } }
  },
  orderBy: { createdAt: 'desc' }
})

// Create game
await prisma.game.create({
  data: {
    gameType: 'WAR',
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
})

// Update game
await prisma.game.update({
  where: { id: gameId },
  data: { status: 'IN_PROGRESS' }
})

// Record move
await prisma.gameMove.create({
  data: {
    gameId,
    userId,
    moveNumber,
    moveData: JSON.stringify(moveData)
  }
})
```

## 💾 Redis Commands

```typescript
// Store game state
await redis.setex(
  `game:${gameId}:state`,
  1800, // 30 minutes TTL
  JSON.stringify(gameState)
)

// Get game state
const state = await redis.get(`game:${gameId}:state`)
const gameState = JSON.parse(state)

// Update player session
await redis.setex(
  `player:${userId}:session`,
  86400, // 24 hours
  JSON.stringify(session)
)

// Add to sorted set (lobby list)
await redis.zadd('games:waiting', Date.now(), gameId)

// Remove from sorted set
await redis.zrem('games:waiting', gameId)

// Get games by score range
const games = await redis.zrange('games:waiting', 0, -1)

// Acquire lock
const lock = await redis.set(
  `game:${gameId}:lock`,
  'locked',
  'EX', 5, // 5 seconds
  'NX'    // Only if not exists
)

// Release lock
await redis.del(`game:${gameId}:lock`)

// Increment counter
await redis.incrby('metrics:games_created', 1)

// Set with expiration
await redis.setex('key', 300, 'value') // 5 minutes
```

## 🎨 UI Components (shadcn)

```typescript
// Button
import { Button } from '@/components/ui/button'
<Button variant="default" size="lg" onClick={handleClick}>
  Click Me
</Button>

// Card
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Dialog/Modal
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
    </DialogHeader>
    <div>Modal content</div>
  </DialogContent>
</Dialog>

// Input
import { Input } from '@/components/ui/input'
<Input
  type="text"
  placeholder="Enter text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// Badge
import { Badge } from '@/components/ui/badge'
<Badge variant="success">Active</Badge>

// Avatar
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
<Avatar>
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

## 🎭 Animations (Framer Motion)

```typescript
import { motion, AnimatePresence } from 'framer-motion'

// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  Content
</motion.div>

// Slide up
<motion.div
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Card flip
<motion.div
  animate={{ rotateY: isFlipped ? 180 : 0 }}
  transition={{ duration: 0.3 }}
  style={{ transformStyle: 'preserve-3d' }}
>
  <div className="backface-hidden">Front</div>
  <div className="backface-hidden rotate-y-180">Back</div>
</motion.div>

// Stagger children
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
  initial="hidden"
  animate="show"
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>

// With AnimatePresence (for mount/unmount)
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>
```

## 🔐 Authentication Patterns

```typescript
// Get current user (client)
import { useAuth } from '@/contexts/AuthContext'
const { user, loading } = useAuth()

// Protect route
import { ProtectedRoute } from '@/components/ProtectedRoute'
<ProtectedRoute>
  <ProtectedContent />
</ProtectedRoute>

// Login as guest
const { loginAsGuest } = useAuth()
await loginAsGuest()

// Register/login
const { register, login } = useAuth()
await register(email, password)
await login(email, password)

// Server-side auth
import { verifyAuth } from '@/middleware/auth'
const { authenticated, user } = await verifyAuth(req)
```

## 🎯 State Management (Zustand)

```typescript
// Create store
import { create } from 'zustand'

interface GameStore {
  gameState: GameState | null
  setGameState: (state: GameState) => void
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  setGameState: (state) => set({ gameState: state })
}))

// Use store
import { useGameStore } from '@/stores/gameStore'

function Component() {
  const gameState = useGameStore(s => s.gameState)
  const setGameState = useGameStore(s => s.setGameState)

  // Use state and actions
}
```

## 🧪 Testing Patterns

```typescript
// Unit test example
import { WarGame } from '@/lib/games/war/WarGame'

describe('WarGame', () => {
  test('should initialize with 26 cards per player', () => {
    const game = new WarGame()
    const state = game.getState()

    expect(state.player1Deck.length).toBe(26)
    expect(state.player2Deck.length).toBe(26)
  })

  test('should handle flip move', () => {
    const game = new WarGame()
    const newState = game.applyMove(0, { action: 'flip' })

    expect(newState.cardsInPlay.player1.length).toBe(1)
    expect(newState.player1Deck.length).toBe(25)
  })
})

// API test example
import { POST } from '@/app/api/auth/guest/route'

describe('Guest Auth API', () => {
  test('should create guest account', async () => {
    const response = await POST(new Request('http://localhost/api/auth/guest'))
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.user.isGuest).toBe(true)
    expect(data.token).toBeDefined()
  })
})
```

## 🐛 Debugging Tips

```typescript
// Log game state
console.log('Game State:', JSON.stringify(gameState, null, 2))

// Check Redis
const keys = await redis.keys('game:*')
console.log('Active games:', keys)

// Debug socket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  console.log('User:', socket.data.userId)
})

// Check database
npx prisma studio  // Visual DB browser

// Server logs
docker logs -f [container-name]

// Check health endpoint
curl http://localhost:3000/api/health
```

## 🚨 Common Issues & Solutions

### Database Connection Error
```bash
# Check DATABASE_URL is correct
echo $DATABASE_URL

# Regenerate Prisma client
npx prisma generate

# Reset database (dev only!)
npx prisma migrate reset
```

### Redis Connection Error
```bash
# Check REDIS_URL is correct
echo $REDIS_URL

# Test connection
redis-cli -u $REDIS_URL ping
```

### Socket Connection Failed
- Check CORS settings in socket server
- Verify JWT token is being sent
- Check WebSocket URL (ws:// vs wss://)
- Ensure port is not blocked by firewall

### Build Errors
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

## 📞 Quick Links

- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Socket.io Docs**: https://socket.io/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Framer Motion**: https://www.framer.com/motion

---

Keep this reference handy while building! Happy coding! 🚀
