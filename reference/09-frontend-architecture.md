# Frontend Architecture & UI/UX Design

## Overview

The Time to Play frontend is built with Next.js 14, prioritizing beautiful design, smooth animations, and excellent user experience. This document covers the complete frontend architecture, component structure, and design system.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives)
- **Animations**: Framer Motion
- **State Management**: Zustand + React Context
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Real-time**: Socket.io Client

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth-related routes
│   │   ├── login/
│   │   └── register/
│   ├── (game)/                  # Game routes
│   │   └── game/[gameId]/
│   │       └── page.tsx
│   ├── play/                    # Game lobby
│   │   └── page.tsx
│   ├── profile/                 # User profile
│   │   └── page.tsx
│   ├── history/                 # Game history
│   │   └── page.tsx
│   ├── api/                     # API routes
│   │   ├── auth/
│   │   ├── games/
│   │   └── users/
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css
│
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layout/                  # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── Navigation.tsx
│   ├── game/                    # Game components
│   │   ├── GameBoard.tsx
│   │   ├── WarGameBoard.tsx
│   │   ├── Card.tsx
│   │   ├── PlayerInfo.tsx
│   │   └── GameOverModal.tsx
│   ├── lobby/                   # Lobby components
│   │   ├── GameList.tsx
│   │   ├── GameCard.tsx
│   │   └── CreateGameModal.tsx
│   └── profile/                 # Profile components
│       ├── UserStats.tsx
│       ├── GameHistory.tsx
│       └── AvatarUpload.tsx
│
├── contexts/                     # React contexts
│   ├── AuthContext.tsx
│   ├── SocketContext.tsx
│   └── ThemeContext.tsx
│
├── stores/                       # Zustand stores
│   ├── gameStore.ts
│   ├── uiStore.ts
│   └── notificationStore.ts
│
├── lib/                         # Utilities
│   ├── games/                   # Game engines
│   ├── db/                      # Database client
│   ├── redis/                   # Redis client
│   ├── auth/                    # Auth utilities
│   ├── socket/                  # Socket utilities
│   └── utils.ts                 # Helper functions
│
├── hooks/                       # Custom hooks
│   ├── useAuth.ts
│   ├── useSocket.ts
│   ├── useGame.ts
│   └── useMediaQuery.ts
│
└── types/                       # TypeScript types
    ├── game.types.ts
    ├── user.types.ts
    └── api.types.ts
```

## Design System

### Color Palette

The platform features **5 vibrant, user-selectable themes**. Users can choose their preferred theme from the settings page. See **[14-theming-color-system.md](./14-theming-color-system.md)** for complete details.

**Available Themes:**
1. **Ocean Breeze** (Default) - Fresh, calming, professional
2. **Sunset Glow** - Warm, energetic, bold
3. **Forest Calm** - Natural, relaxing, earthy
4. **Purple Dream** - Creative, magical, vibrant
5. **Neon Nights** - Electric, modern, exciting

Colors are implemented using CSS variables for instant theme switching:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Use CSS variables (set by ThemeProvider)
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          // ... all shades
          500: 'var(--color-primary-500)',  // Main
          // ... all shades
          900: 'var(--color-primary-900)'
        },
        accent: {
          // Similar structure
        },
        table: {
          light: 'var(--color-table-light)',
          DEFAULT: 'var(--color-table-main)',
          dark: 'var(--color-table-dark)'
        }
      }
    }
  }
};
```

### Typography

```typescript
// Font configuration
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap'
});

// Usage:
// - Inter: Body text, UI elements
// - Poppins: Headings, game titles
```

### Component Patterns

#### Button Variants

```typescript
// components/ui/button.tsx (using shadcn/ui)
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600",
        destructive: "bg-error text-white hover:bg-error/90",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-50",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        link: "text-primary-500 underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
```

## Page Layouts & Routes

### Landing Page (`/`)

**Purpose**: Welcome new users, explain value proposition, encourage signup/guest play

```typescript
// app/page.tsx
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-accent-500">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">
            Time to Play
          </h1>
          <p className="text-2xl mb-8">
            Classic card games with friends, anytime, anywhere
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={handleGuestPlay}>
              Play as Guest
            </Button>
            <Button size="lg" variant="outline">
              Create Account
            </Button>
          </div>
        </div>

        {/* Animated card background */}
        <AnimatedCards />
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Time to Play?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap />}
              title="Instant Play"
              description="No downloads, no waiting. Jump into a game in seconds."
            />
            <FeatureCard
              icon={<Shield />}
              title="Never Lose Progress"
              description="Dropped connection? No problem. Reconnect and continue."
            />
            <FeatureCard
              icon={<Users />}
              title="Play with Anyone"
              description="Invite friends or match with players worldwide."
            />
          </div>
        </div>
      </section>

      {/* Available Games */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Available Games
          </h2>
          <GameShowcase />
        </div>
      </section>
    </div>
  );
}
```

### Game Lobby (`/play`)

**Purpose**: Browse available games, create new games, join existing games

```typescript
// app/play/page.tsx
'use client';

export default function PlayPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [filter, setFilter] = useState<GameType | 'ALL'>('ALL');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Game Lobby</h1>
        <Button onClick={handleCreateGame}>
          <Plus className="mr-2" /> Create Game
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'ALL' ? 'default' : 'outline'}
          onClick={() => setFilter('ALL')}
        >
          All Games
        </Button>
        <Button
          variant={filter === 'WAR' ? 'default' : 'outline'}
          onClick={() => setFilter('WAR')}
        >
          War
        </Button>
        {/* More filters... */}
      </div>

      {/* Game List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map(game => (
          <GameCard
            key={game.id}
            game={game}
            onJoin={() => handleJoinGame(game.id)}
          />
        ))}
      </div>

      {/* Create Game Modal */}
      <CreateGameModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
```

### Game Page (`/game/[gameId]`)

**Purpose**: Active gameplay interface

```typescript
// app/game/[gameId]/page.tsx
'use client';

export default function GamePage({ params }: { params: { gameId: string } }) {
  const { gameId } = params;
  const { user } = useAuth();
  const [gameData, setGameData] = useState<GameData | null>(null);

  useEffect(() => {
    // Fetch game data
    fetchGame(gameId).then(setGameData);
  }, [gameId]);

  if (!gameData) {
    return <LoadingSpinner />;
  }

  // Determine player index
  const playerIndex = gameData.players.findIndex(p => p.userId === user?.id);

  // Render appropriate game board
  switch (gameData.gameType) {
    case 'WAR':
      return <WarGameBoard gameId={gameId} playerIndex={playerIndex} />;
    case 'CHESS':
      return <ChessGameBoard gameId={gameId} playerIndex={playerIndex} />;
    default:
      return <div>Unknown game type</div>;
  }
}
```

### Profile Page (`/profile`)

```typescript
// app/profile/page.tsx
export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="md:col-span-1">
          <Card className="p-6">
            <Avatar size="xl" src={user?.avatarUrl} />
            <h2 className="text-2xl font-bold mt-4">{user?.displayName}</h2>
            {user?.isGuest && (
              <Badge variant="warning">Guest Account</Badge>
            )}
            <Button className="w-full mt-4" onClick={handleEditProfile}>
              Edit Profile
            </Button>
          </Card>
        </div>

        {/* Stats */}
        <div className="md:col-span-2">
          <UserStats stats={stats} />
        </div>
      </div>

      {/* Game History */}
      <div className="mt-8">
        <h2 className="text-3xl font-bold mb-6">Recent Games</h2>
        <GameHistory userId={user?.id} />
      </div>
    </div>
  );
}
```

## Key UI Components

### GameCard Component

```typescript
// components/lobby/GameCard.tsx
interface GameCardProps {
  game: Game;
  onJoin: () => void;
}

export function GameCard({ game, onJoin }: GameCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{game.gameType}</CardTitle>
            <CardDescription>
              {game.currentPlayers}/{game.maxPlayers} players
            </CardDescription>
          </div>
          <Badge variant={getStatusVariant(game.status)}>
            {game.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Player avatars */}
        <div className="flex -space-x-2 mb-4">
          {game.players.map(player => (
            <Avatar key={player.userId} src={player.avatarUrl} />
          ))}
        </div>

        <div className="text-sm text-gray-500">
          Created {formatRelativeTime(game.createdAt)}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={onJoin}
          disabled={game.currentPlayers >= game.maxPlayers}
        >
          {game.currentPlayers >= game.maxPlayers ? 'Full' : 'Join Game'}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### PlayerInfo Component

```typescript
// components/game/PlayerInfo.tsx
interface PlayerInfoProps {
  player: Player;
  isCurrentTurn: boolean;
  isYou: boolean;
}

export function PlayerInfo({ player, isCurrentTurn, isYou }: PlayerInfoProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
        isCurrentTurn && 'border-primary-500 bg-primary-50',
        !isCurrentTurn && 'border-gray-200'
      )}
    >
      {/* Connection status indicator */}
      <div className="relative">
        <Avatar src={player.avatarUrl} />
        <div
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
            player.isConnected ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      </div>

      <div className="flex-1">
        <div className="font-semibold">
          {player.displayName}
          {isYou && <Badge className="ml-2">You</Badge>}
        </div>
        <div className="text-sm text-gray-500">
          {player.score} cards
        </div>
      </div>

      {isCurrentTurn && (
        <div className="animate-pulse">
          <Badge variant="primary">Turn</Badge>
        </div>
      )}
    </div>
  );
}
```

### ReconnectionOverlay Component

```typescript
// components/game/ReconnectionOverlay.tsx
export function ReconnectionOverlay() {
  const connectionStatus = useGameStore(s => s.connectionStatus);

  return (
    <AnimatePresence>
      {connectionStatus !== 'connected' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-xl p-8 max-w-md shadow-2xl"
          >
            {connectionStatus === 'reconnecting' ? (
              <>
                <div className="flex justify-center mb-4">
                  <Loader2 className="animate-spin h-12 w-12 text-primary-500" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">
                  Reconnecting...
                </h2>
                <p className="text-gray-600 text-center">
                  Getting you back into the game
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <WifiOff className="h-12 w-12 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">
                  Connection Lost
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  Don't worry, your game is saved. Click below to reconnect.
                </p>
                <Button className="w-full" onClick={handleReconnect}>
                  Reconnect Now
                </Button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## Animations

### Page Transitions

```typescript
// components/layout/PageTransition.tsx
'use client';

import { motion } from 'framer-motion';

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

### Card Flip Animation

```typescript
// Animation for flipping cards
const cardFlipVariants = {
  front: {
    rotateY: 0,
    transition: { duration: 0.3 }
  },
  back: {
    rotateY: 180,
    transition: { duration: 0.3 }
  }
};

<motion.div
  variants={cardFlipVariants}
  animate={isFlipped ? 'back' : 'front'}
  style={{ transformStyle: 'preserve-3d' }}
>
  <div className="absolute backface-hidden">
    {/* Card front */}
  </div>
  <div className="absolute backface-hidden rotate-y-180">
    {/* Card back */}
  </div>
</motion.div>
```

## Responsive Design

### Breakpoints

```typescript
// tailwind.config.ts
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px'  // Extra large
}
```

### Mobile-First Approach

```typescript
// All layouts start mobile, scale up
<div className="
  flex flex-col gap-4           // Mobile: stack vertically
  md:flex-row md:gap-6          // Tablet: horizontal layout
  lg:gap-8                      // Desktop: larger gaps
">
```

## Performance Optimizations

### Image Optimization

```typescript
// Always use Next.js Image component
import Image from 'next/image';

<Image
  src="/cards/default/hearts_ace.png"
  alt="Ace of Hearts"
  width={120}
  height={168}
  priority={isVisible} // Prioritize visible cards
  loading={isVisible ? 'eager' : 'lazy'}
/>
```

### Code Splitting

```typescript
// Dynamic imports for heavy components
const GameBoard = dynamic(() => import('@/components/game/GameBoard'), {
  loading: () => <LoadingSpinner />,
  ssr: false // Don't render on server (needs socket connection)
});
```

### Memoization

```typescript
// Memo expensive computations
const sortedGames = useMemo(() => {
  return games.sort((a, b) => b.createdAt - a.createdAt);
}, [games]);

// Memo components that don't need frequent updates
export const PlayerInfo = memo(PlayerInfoComponent);
```

---

This frontend architecture creates a beautiful, performant, and user-friendly gaming platform that works seamlessly across all devices.
