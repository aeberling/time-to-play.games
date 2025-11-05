# Time to Play - Laravel + Inertia + React Migration Plan

**Version:** 1.0
**Date:** November 4, 2025
**Status:** Ready for Implementation

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Complete Implementation Checklist](#complete-implementation-checklist)
5. [Detailed Implementation Guide](#detailed-implementation-guide)
6. [Testing Checklist](#testing-checklist)
7. [Deployment Checklist](#deployment-checklist)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## Executive Summary

This document provides a complete, step-by-step migration plan to rebuild **Time to Play** from Next.js + Socket.io to **Laravel 11 + Inertia.js + React + PostgreSQL + Laravel Reverb**. The plan emphasizes a **modular game engine architecture** that makes adding new games trivial.

### Key Goals
- ✅ Maintain all existing features (3 games: War, Swoop, Oh Hell!)
- ✅ Implement modular game engine interface
- ✅ Simplify architecture using Laravel's ecosystem
- ✅ Deploy to Kinsta using Nixpacks
- ✅ Use Laravel Herd for local development

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend Framework** | Laravel 11 | PHP framework |
| **Frontend Framework** | React 18 + TypeScript | UI library |
| **SPA Bridge** | Inertia.js v1.0+ | Laravel ↔ React |
| **Build Tool** | Vite 5 | Module bundler |
| **Styling** | TailwindCSS 3.4 + shadcn/ui | Utility-first CSS |
| **State Management** | Zustand | Client-side state |
| **Real-time** | Laravel Reverb | Official WebSocket |
| **Database** | PostgreSQL 16 | Primary database |
| **ORM** | Eloquent | Laravel's ORM |
| **Cache/Session** | Redis 7 | Sessions + game state |
| **Queue** | Redis | Background jobs |
| **Authentication** | Laravel Sanctum | SPA authentication |
| **Dev Environment** | Laravel Herd | Native PHP (Mac) |
| **Testing (PHP)** | Pest | PHP testing |
| **Testing (JS)** | Vitest | React testing |
| **Deployment** | Kinsta (Nixpacks) | Docker container |

---

## Architecture Overview

### Modular Game Engine Pattern

```
┌──────────────────────────────────────────────┐
│         Laravel Application Core             │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────┐    │
│  │    Game Engine Registry            │    │
│  │    (Singleton Service)             │    │
│  └────────────┬───────────────────────┘    │
│               │                              │
│  ┌────────────▼───────────────────────┐    │
│  │    GameEngineInterface             │    │
│  │    • validateMove()                │    │
│  │    • applyMove()                   │    │
│  │    • checkGameOver()               │    │
│  │    • initializeGame()              │    │
│  │    • getPlayerView()               │    │
│  └───┬──────────┬──────────┬─────────┘    │
│      │          │          │                │
│  ┌───▼────┐┌───▼────┐┌───▼────┐          │
│  │  War   ││ Swoop  ││Oh Hell │           │
│  │ Engine ││ Engine ││ Engine │           │
│  └────────┘└────────┘└────────┘           │
│                                              │
└──────────────────────────────────────────────┘
```

### Key Benefit
**Adding a new game requires:**
1. Create one file: `app/Games/Engines/NewGameEngine.php`
2. Implement the interface (5 required methods)
3. Register in `GameServiceProvider` (1 line)
4. Done! ✅

---

## Complete Implementation Checklist

### 📁 Phase 1: Project Setup (Week 1-2)

#### Week 1: Initial Setup
- [ ] **1.1** Create new project folder: `time-to-play-laravel`
- [ ] **1.2** Install Laravel 11: `composer create-project laravel/laravel time-to-play-laravel`
- [ ] **1.3** Install Laravel Herd (if not installed)
- [ ] **1.4** Add site to Herd: `time-to-play-laravel.test`
- [ ] **1.5** Install Inertia.js server-side: `composer require inertiajs/inertia-laravel`
- [ ] **1.6** Install Breeze with React: `composer require laravel/breeze --dev` then `php artisan breeze:install react`
- [ ] **1.7** Install Laravel Sanctum: `composer require laravel/sanctum`
- [ ] **1.8** Install Laravel Reverb: `composer require laravel/reverb`
- [ ] **1.9** Install Pest: `composer require pestphp/pest --dev --with-all-dependencies`
- [ ] **1.10** Initialize Pest: `php artisan pest:install`
- [ ] **1.11** Install Node dependencies: `npm install`
- [ ] **1.12** Install additional packages:
  ```bash
  npm install zustand framer-motion lucide-react zod
  npm install -D @types/node
  ```

#### Week 1: Database Setup
- [ ] **1.13** Configure PostgreSQL in `.env`:
  ```
  DB_CONNECTION=pgsql
  DB_HOST=127.0.0.1
  DB_PORT=5432
  DB_DATABASE=timetoplay
  DB_USERNAME=[provided_by_user]
  DB_PASSWORD=[provided_by_user]
  ```
- [ ] **1.14** Create PostgreSQL database: `createdb timetoplay`
- [ ] **1.15** Test database connection: `php artisan migrate`
- [ ] **1.16** Configure Redis in `.env`:
  ```
  REDIS_CLIENT=phpredis
  REDIS_HOST=127.0.0.1
  REDIS_PORT=6379
  CACHE_DRIVER=redis
  SESSION_DRIVER=redis
  QUEUE_CONNECTION=redis
  ```
- [ ] **1.17** Test Redis connection: `php artisan tinker` then `Redis::ping()`

#### Week 1: TailwindCSS & shadcn/ui
- [ ] **1.18** Verify Tailwind is configured (installed with Breeze)
- [ ] **1.19** Initialize shadcn/ui for React:
  ```bash
  npx shadcn-ui@latest init
  ```
- [ ] **1.20** Install shadcn/ui components:
  ```bash
  npx shadcn-ui@latest add button
  npx shadcn-ui@latest add card
  npx shadcn-ui@latest add dialog
  npx shadcn-ui@latest add input
  npx shadcn-ui@latest add label
  npx shadcn-ui@latest add toast
  ```

#### Week 2: Project Structure Setup
- [ ] **1.21** Create directory structure:
  ```bash
  mkdir -p app/Games/{Contracts,Engines,ValueObjects}
  mkdir -p app/Services
  mkdir -p app/Events
  mkdir -p app/Policies
  mkdir -p resources/js/{Components/{ui,layout,game,lobby,profile},Hooks,Layouts,Pages/{Auth,Game},Stores,Types,Utils}
  ```

#### Week 2: Configuration Files
- [ ] **1.22** Create `config/games.php`:
  ```php
  <?php
  return [
      'types' => [
          'WAR' => [
              'name' => 'War',
              'min_players' => 2,
              'max_players' => 2,
              'description' => 'Classic War card game',
          ],
          'SWOOP' => [
              'name' => 'Swoop',
              'min_players' => 3,
              'max_players' => 8,
              'description' => 'Fast-paced shedding game',
          ],
          'OH_HELL' => [
              'name' => 'Oh Hell!',
              'min_players' => 3,
              'max_players' => 5,
              'description' => 'Strategic trick-taking game',
          ],
      ],
      'timer_presets' => [
          'BLITZ' => ['name' => 'Blitz', 'time' => 180],
          'RAPID' => ['name' => 'Rapid', 'time' => 300],
          'STANDARD' => ['name' => 'Standard', 'time' => 600],
          'CASUAL' => ['name' => 'Casual', 'time' => 900],
          'UNTIMED' => ['name' => 'Untimed', 'time' => null],
      ],
      'themes' => [
          'ocean-breeze' => ['name' => 'Ocean Breeze', 'primary' => '#0891b2'],
          'sunset-glow' => ['name' => 'Sunset Glow', 'primary' => '#f97316'],
          'forest-calm' => ['name' => 'Forest Calm', 'primary' => '#16a34a'],
          'purple-dream' => ['name' => 'Purple Dream', 'primary' => '#9333ea'],
          'neon-nights' => ['name' => 'Neon Nights', 'primary' => '#06b6d4'],
      ],
  ];
  ```

- [ ] **1.23** Configure Reverb in `.env`:
  ```
  BROADCAST_DRIVER=reverb
  REVERB_APP_ID=local-app-id
  REVERB_APP_KEY=local-app-key
  REVERB_APP_SECRET=local-app-secret
  REVERB_HOST=127.0.0.1
  REVERB_PORT=8080
  REVERB_SCHEME=http
  ```

- [ ] **1.24** Publish Reverb config: `php artisan reverb:install`

- [ ] **1.25** Update `vite.config.js`:
  ```javascript
  import { defineConfig } from 'vite';
  import laravel from 'laravel-vite-plugin';
  import react from '@vitejs/plugin-react';
  import path from 'path';

  export default defineConfig({
      plugins: [
          laravel({
              input: ['resources/css/app.css', 'resources/js/app.tsx'],
              refresh: true,
          }),
          react(),
      ],
      resolve: {
          alias: {
              '@': path.resolve(__dirname, './resources/js'),
          },
      },
  });
  ```

- [ ] **1.26** Create TypeScript config `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true,
      "baseUrl": ".",
      "paths": {
        "@/*": ["./resources/js/*"]
      }
    },
    "include": ["resources/js/**/*"],
    "references": [{ "path": "./tsconfig.node.json" }]
  }
  ```

- [ ] **1.27** Test dev server: `npm run dev`
- [ ] **1.28** Test Laravel server: `php artisan serve` (or use Herd)
- [ ] **1.29** Verify Inertia is working: visit `http://time-to-play-laravel.test`

---

### 🗄️ Phase 2: Database Schema (Week 3)

#### Database Migrations
- [ ] **2.1** Create Users migration (modify default):
  ```bash
  php artisan make:migration modify_users_table
  ```
  Add fields: `display_name`, `avatar_url`, `is_guest`, `guest_token`, `theme_id`, `last_seen_at`

- [ ] **2.2** Create UserStats migration:
  ```bash
  php artisan make:migration create_user_stats_table
  ```

- [ ] **2.3** Create Games migration:
  ```bash
  php artisan make:migration create_games_table
  ```

- [ ] **2.4** Create GamePlayers pivot migration:
  ```bash
  php artisan make:migration create_game_players_table
  ```

- [ ] **2.5** Create GameMoves migration:
  ```bash
  php artisan make:migration create_game_moves_table
  ```

- [ ] **2.6** Create ChatMessages migration:
  ```bash
  php artisan make:migration create_chat_messages_table
  ```

#### Migration Files Content

- [ ] **2.7** Implement Users table schema:
  ```php
  Schema::table('users', function (Blueprint $table) {
      $table->string('username')->unique()->nullable();
      $table->string('display_name');
      $table->string('avatar_url')->nullable();
      $table->boolean('is_guest')->default(true);
      $table->string('guest_token')->unique()->nullable();
      $table->string('theme_id')->default('ocean-breeze');
      $table->timestamp('last_seen_at')->nullable();
  });
  ```

- [ ] **2.8** Implement UserStats table schema:
  ```php
  Schema::create('user_stats', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->integer('war_games_played')->default(0);
      $table->integer('war_games_won')->default(0);
      $table->integer('war_games_lost')->default(0);
      $table->float('war_win_rate')->default(0);
      $table->integer('war_elo')->default(1200);
      $table->integer('swoop_games_played')->default(0);
      $table->integer('swoop_games_won')->default(0);
      $table->integer('swoop_games_lost')->default(0);
      $table->integer('swoop_elo')->default(1200);
      $table->integer('oh_hell_games_played')->default(0);
      $table->integer('oh_hell_games_won')->default(0);
      $table->integer('oh_hell_games_lost')->default(0);
      $table->integer('oh_hell_elo')->default(1200);
      $table->integer('total_games_played')->default(0);
      $table->integer('total_games_won')->default(0);
      $table->integer('longest_win_streak')->default(0);
      $table->integer('current_win_streak')->default(0);
      $table->timestamps();
  });
  ```

- [ ] **2.9** Implement Games table schema:
  ```php
  Schema::create('games', function (Blueprint $table) {
      $table->id();
      $table->enum('game_type', ['WAR', 'SWOOP', 'OH_HELL']);
      $table->enum('status', ['WAITING', 'READY', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'])->default('WAITING');
      $table->integer('max_players')->default(2);
      $table->integer('current_turn')->default(0);
      $table->boolean('is_private')->default(false);
      $table->json('timer_config')->nullable();
      $table->json('timer_state')->nullable();
      $table->json('state_snapshot')->nullable();
      $table->foreignId('winner_id')->nullable()->constrained('users');
      $table->timestamp('started_at')->nullable();
      $table->timestamp('completed_at')->nullable();
      $table->timestamps();

      $table->index('status');
      $table->index('game_type');
      $table->index('created_at');
  });
  ```

- [ ] **2.10** Implement GamePlayers pivot table schema:
  ```php
  Schema::create('game_players', function (Blueprint $table) {
      $table->id();
      $table->foreignId('game_id')->constrained()->onDelete('cascade');
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->integer('player_index');
      $table->boolean('is_ready')->default(false);
      $table->boolean('is_connected')->default(false);
      $table->timestamp('last_connected_at')->nullable();
      $table->integer('placement')->nullable();
      $table->integer('score')->nullable();
      $table->timestamps();

      $table->unique(['game_id', 'user_id']);
      $table->unique(['game_id', 'player_index']);
      $table->index('user_id');
  });
  ```

- [ ] **2.11** Implement GameMoves table schema:
  ```php
  Schema::create('game_moves', function (Blueprint $table) {
      $table->id();
      $table->foreignId('game_id')->constrained()->onDelete('cascade');
      $table->foreignId('user_id')->constrained();
      $table->integer('move_number');
      $table->json('move_data');
      $table->timestamps();

      $table->index(['game_id', 'move_number']);
  });
  ```

- [ ] **2.12** Implement ChatMessages table schema:
  ```php
  Schema::create('chat_messages', function (Blueprint $table) {
      $table->id();
      $table->foreignId('game_id')->constrained()->onDelete('cascade');
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->text('message');
      $table->enum('type', ['TEXT', 'EMOJI', 'SYSTEM'])->default('TEXT');
      $table->boolean('is_filtered')->default(false);
      $table->timestamps();

      $table->index(['game_id', 'created_at']);
  });
  ```

- [ ] **2.13** Run migrations: `php artisan migrate`

#### Eloquent Models
- [ ] **2.14** Update User model (`app/Models/User.php`)
- [ ] **2.15** Create UserStats model: `php artisan make:model UserStats`
- [ ] **2.16** Create Game model: `php artisan make:model Game`
- [ ] **2.17** Create GamePlayer model: `php artisan make:model GamePlayer`
- [ ] **2.18** Create GameMove model: `php artisan make:model GameMove`
- [ ] **2.19** Create ChatMessage model: `php artisan make:model ChatMessage`

#### Model Relationships
- [ ] **2.20** Add relationships to User model:
  - `hasOne(UserStats::class)`
  - `belongsToMany(Game::class, 'game_players')`
  - `hasMany(ChatMessage::class)`

- [ ] **2.21** Add relationships to Game model:
  - `belongsToMany(User::class, 'game_players')`
  - `belongsTo(User::class, 'winner_id')`
  - `hasMany(GameMove::class)`
  - `hasMany(ChatMessage::class)`

- [ ] **2.22** Add casts to models (JSON fields, dates, booleans)

#### Factories & Seeders
- [ ] **2.23** Create UserFactory: `php artisan make:factory UserFactory`
- [ ] **2.24** Create GameFactory: `php artisan make:factory GameFactory`
- [ ] **2.25** Create UserStatsFactory: `php artisan make:factory UserStatsFactory`
- [ ] **2.26** Create database seeder for test data
- [ ] **2.27** Test factories: `php artisan tinker` → `User::factory()->count(10)->create()`

---

### 🎮 Phase 3: Modular Game Engine (Week 4-5)

#### Week 4: Core Architecture

- [ ] **3.1** Create GameEngineInterface:
  ```bash
  touch app/Games/Contracts/GameEngineInterface.php
  ```

- [ ] **3.2** Implement GameEngineInterface with methods:
  ```php
  interface GameEngineInterface {
      public function getGameType(): string;
      public function getName(): string;
      public function getConfig(): array;
      public function initializeGame(array $players, array $options = []): array;
      public function validateMove(array $state, array $move, int $playerIndex): ValidationResult;
      public function applyMove(array $state, array $move, int $playerIndex): array;
      public function checkGameOver(array $state): array;
      public function getPlayerView(array $state, int $playerIndex): array;
      public function serializeState(array $state): string;
      public function deserializeState(string $state): array;
  }
  ```

- [ ] **3.3** Create ValidationResult value object:
  ```bash
  touch app/Games/ValueObjects/ValidationResult.php
  ```

- [ ] **3.4** Implement ValidationResult:
  ```php
  class ValidationResult {
      public function __construct(
          private bool $valid,
          private ?string $error = null
      ) {}

      public static function valid(): self
      public static function invalid(string $error): self
      public function isValid(): bool
      public function getError(): ?string
  }
  ```

- [ ] **3.5** Create Card value object:
  ```bash
  touch app/Games/ValueObjects/Card.php
  ```

- [ ] **3.6** Implement Card class with properties: `id`, `suit`, `rank`, `value`, `imageUrl`

- [ ] **3.7** Create Deck value object:
  ```bash
  touch app/Games/ValueObjects/Deck.php
  ```

- [ ] **3.8** Implement Deck class with methods: `standard52()`, `shuffle()`, `deal()`

- [ ] **3.9** Create GameRegistry singleton:
  ```bash
  touch app/Games/GameRegistry.php
  ```

- [ ] **3.10** Implement GameRegistry:
  ```php
  class GameRegistry {
      private Collection $engines;

      public function register(GameEngineInterface $engine): void
      public function get(string $gameType): ?GameEngineInterface
      public function all(): Collection
      public function has(string $gameType): bool
      public function getAvailableGames(): array
  }
  ```

- [ ] **3.11** Create GameServiceProvider:
  ```bash
  php artisan make:provider GameServiceProvider
  ```

- [ ] **3.12** Register GameRegistry as singleton in GameServiceProvider

- [ ] **3.13** Register GameServiceProvider in `config/app.php`

- [ ] **3.14** Create GameService:
  ```bash
  touch app/Services/GameService.php
  ```

- [ ] **3.15** Implement GameService methods:
  - `createGame(string $gameType, User $creator, array $options)`
  - `joinGame(Game $game, User $user)`
  - `makeMove(Game $game, User $user, array $moveData)`
  - `leaveGame(Game $game, User $user)`

- [ ] **3.16** Create GameStateService:
  ```bash
  touch app/Services/GameStateService.php
  ```

- [ ] **3.17** Implement GameStateService (Redis operations):
  - `getState(string $gameId): ?array`
  - `setState(string $gameId, array $state): void`
  - `updateState(string $gameId, callable $callback): array`
  - `deleteState(string $gameId): void`
  - `acquireLock(string $gameId, int $timeout = 5): bool`
  - `releaseLock(string $gameId): void`

#### Week 5: Game Engine Implementations

- [ ] **3.18** Create WarEngine:
  ```bash
  touch app/Games/Engines/WarEngine.php
  ```

- [ ] **3.19** Implement WarEngine:
  - [ ] `initializeGame()` - deal cards evenly
  - [ ] `validateMove()` - check turn, cards available
  - [ ] `applyMove()` - both players flip, compare cards
  - [ ] `checkGameOver()` - check if player has no cards
  - [ ] `getPlayerView()` - hide opponent's cards

- [ ] **3.20** Create SwoopEngine:
  ```bash
  touch app/Games/Engines/SwoopEngine.php
  ```

- [ ] **3.21** Implement SwoopEngine:
  - [ ] `initializeGame()` - deal 19 cards per player (4 mystery, 4 face-up, 11 hand)
  - [ ] `validateMove()` - validate play/pickup/skip actions
  - [ ] `applyMove()` - process card plays, check swoop
  - [ ] `checkSwoop()` - detect 4 equal cards
  - [ ] `checkGameOver()` - check if player has no cards
  - [ ] `calculateScores()` - score remaining cards
  - [ ] `getPlayerView()` - hide opponent hands and mystery cards

- [ ] **3.22** Create OhHellEngine:
  ```bash
  touch app/Games/Engines/OhHellEngine.php
  ```

- [ ] **3.23** Implement OhHellEngine:
  - [ ] `initializeGame()` - set up elevator rounds
  - [ ] `startRound()` - deal cards, determine trump
  - [ ] `validateMove()` - validate bids and card plays
  - [ ] `validateBid()` - enforce dealer restriction
  - [ ] `applyMove()` - process bids or card plays
  - [ ] `determineTrickWinner()` - compare cards with trump
  - [ ] `endRound()` - calculate scores
  - [ ] `advanceToNextRound()` - progress elevator
  - [ ] `checkGameOver()` - check if all rounds complete

- [ ] **3.24** Register all engines in GameServiceProvider:
  ```php
  $registry->register(new WarEngine());
  $registry->register(new SwoopEngine());
  $registry->register(new OhHellEngine());
  ```

- [ ] **3.25** Test game registry: `php artisan tinker`
  ```php
  $registry = app(GameRegistry::class);
  $registry->getAvailableGames();
  ```

#### Game Engine Unit Tests

- [ ] **3.26** Create WarEngineTest:
  ```bash
  php artisan make:test --unit Games/WarEngineTest
  ```

- [ ] **3.27** Write War engine tests:
  - [ ] Test initialization (26 cards per player)
  - [ ] Test move validation
  - [ ] Test card comparison logic
  - [ ] Test war scenario (equal cards)
  - [ ] Test game over detection

- [ ] **3.28** Create SwoopEngineTest:
  ```bash
  php artisan make:test --unit Games/SwoopEngineTest
  ```

- [ ] **3.29** Write Swoop engine tests:
  - [ ] Test initialization (19 cards per player)
  - [ ] Test swoop detection (4 equal cards)
  - [ ] Test special cards (10s and Jokers)
  - [ ] Test mystery card reveal
  - [ ] Test score calculation

- [ ] **3.30** Create OhHellEngineTest:
  ```bash
  php artisan make:test --unit Games/OhHellEngineTest
  ```

- [ ] **3.31** Write Oh Hell engine tests:
  - [ ] Test round progression (elevator)
  - [ ] Test dealer bidding restriction
  - [ ] Test trick winner determination
  - [ ] Test trump mechanics
  - [ ] Test scoring (made bid vs failed)

- [ ] **3.32** Run all tests: `php artisan test`

---

### 🔌 Phase 4: Real-Time System (Week 6)

#### Reverb Setup

- [ ] **4.1** Start Reverb server: `php artisan reverb:start`

- [ ] **4.2** Verify Reverb is running on port 8080

- [ ] **4.3** Install Laravel Echo on frontend:
  ```bash
  npm install laravel-echo pusher-js
  ```

- [ ] **4.4** Configure Echo in `resources/js/bootstrap.ts`:
  ```typescript
  import Echo from 'laravel-echo';
  import Pusher from 'pusher-js';

  window.Pusher = Pusher;

  window.Echo = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY,
      wsHost: import.meta.env.VITE_REVERB_HOST,
      wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
      wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
      forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
      enabledTransports: ['ws', 'wss'],
  });
  ```

#### Broadcasting Events

- [ ] **4.5** Create GameMoveEvent:
  ```bash
  php artisan make:event GameMoveEvent
  ```

- [ ] **4.6** Implement GameMoveEvent (ShouldBroadcast):
  ```php
  class GameMoveEvent implements ShouldBroadcast {
      public function __construct(
          public string $gameId,
          public array $gameState,
          public int $playerIndex,
          public array $move
      ) {}

      public function broadcastOn(): Channel {
          return new Channel('game.' . $this->gameId);
      }

      public function broadcastAs(): string {
          return 'move.made';
      }
  }
  ```

- [ ] **4.7** Create PlayerJoinedEvent:
  ```bash
  php artisan make:event PlayerJoinedEvent
  ```

- [ ] **4.8** Implement PlayerJoinedEvent

- [ ] **4.9** Create PlayerLeftEvent:
  ```bash
  php artisan make:event PlayerLeftEvent
  ```

- [ ] **4.10** Implement PlayerLeftEvent

- [ ] **4.11** Create GameStateUpdatedEvent:
  ```bash
  php artisan make:event GameStateUpdatedEvent
  ```

- [ ] **4.12** Implement GameStateUpdatedEvent

#### Channel Authorization

- [ ] **4.13** Define game channel in `routes/channels.php`:
  ```php
  Broadcast::channel('game.{gameId}', function ($user, $gameId) {
      return GamePlayer::where('game_id', $gameId)
                       ->where('user_id', $user->id)
                       ->exists();
  });
  ```

#### Game Controllers

- [ ] **4.14** Create GameController:
  ```bash
  php artisan make:controller GameController
  ```

- [ ] **4.15** Implement GameController methods:
  - [ ] `index()` - list available games (return Inertia page)
  - [ ] `create()` - create game form (return Inertia page)
  - [ ] `store()` - create new game
  - [ ] `show($id)` - show game page (return Inertia page)
  - [ ] `makeMove($id)` - process move via AJAX

- [ ] **4.16** Create GameLobbyController:
  ```bash
  php artisan make:controller GameLobbyController
  ```

- [ ] **4.17** Implement lobby methods:
  - [ ] `index()` - show lobby with available games
  - [ ] `join($gameId)` - join a game

#### Move Processing Pipeline

- [ ] **4.18** Implement move processing in GameService:
  ```php
  public function makeMove(Game $game, User $user, array $moveData) {
      // 1. Acquire lock
      if (!$this->stateService->acquireLock($game->id)) {
          throw new Exception('Game locked');
      }

      try {
          // 2. Get current state
          $state = $this->stateService->getState($game->id);

          // 3. Get game engine
          $engine = $this->registry->get($game->game_type);

          // 4. Validate move
          $playerIndex = $this->getPlayerIndex($game, $user);
          $validation = $engine->validateMove($state, $moveData, $playerIndex);

          if (!$validation->isValid()) {
              throw new InvalidMoveException($validation->getError());
          }

          // 5. Apply move
          $newState = $engine->applyMove($state, $moveData, $playerIndex);

          // 6. Save to Redis
          $this->stateService->setState($game->id, $newState);

          // 7. Broadcast event
          broadcast(new GameMoveEvent($game->id, $newState, $playerIndex, $moveData));

          // 8. Queue move persistence
          RecordGameMoveJob::dispatch($game->id, $user->id, $moveData);

          // 9. Check game over
          $gameOver = $engine->checkGameOver($newState);
          if ($gameOver['isOver']) {
              FinalizeGameJob::dispatch($game->id);
          }

          return $newState;
      } finally {
          // 10. Release lock
          $this->stateService->releaseLock($game->id);
      }
  }
  ```

#### Background Jobs

- [ ] **4.19** Create RecordGameMoveJob:
  ```bash
  php artisan make:job RecordGameMoveJob
  ```

- [ ] **4.20** Implement RecordGameMoveJob to save move to database

- [ ] **4.21** Create FinalizeGameJob:
  ```bash
  php artisan make:job FinalizeGameJob
  ```

- [ ] **4.22** Implement FinalizeGameJob:
  - Update game status to COMPLETED
  - Set winner
  - Save final state snapshot
  - Update user stats

- [ ] **4.23** Create UpdateUserStatsJob:
  ```bash
  php artisan make:job UpdateUserStatsJob
  ```

- [ ] **4.24** Implement UpdateUserStatsJob

- [ ] **4.25** Test queue worker: `php artisan queue:work`

---

### 🔐 Phase 5: Authentication (Week 2 - Parallel)

#### Sanctum Configuration

- [ ] **5.1** Publish Sanctum config:
  ```bash
  php artisan vendor:publish --provider="Laravel\Sanctum\ServiceProvider"
  ```

- [ ] **5.2** Add Sanctum middleware to `app/Http/Kernel.php`:
  ```php
  'api' => [
      \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
  ],
  ```

- [ ] **5.3** Configure CORS in `config/cors.php`:
  ```php
  'paths' => ['api/*', '/sanctum/csrf-cookie', '/broadcasting/auth'],
  'supports_credentials' => true,
  ```

#### Auth Controllers

- [ ] **5.4** Create GuestController:
  ```bash
  php artisan make:controller Auth/GuestController
  ```

- [ ] **5.5** Implement guest authentication:
  ```php
  public function store(Request $request) {
      $user = User::create([
          'display_name' => 'Guest_' . Str::random(4),
          'is_guest' => true,
          'guest_token' => Str::random(32),
      ]);

      $user->stats()->create();

      auth()->login($user);

      return redirect()->route('lobby');
  }
  ```

- [ ] **5.6** Create LoginController:
  ```bash
  php artisan make:controller Auth/LoginController
  ```

- [ ] **5.7** Implement login logic

- [ ] **5.8** Create RegisterController:
  ```bash
  php artisan make:controller Auth/RegisterController
  ```

- [ ] **5.9** Implement registration logic

- [ ] **5.10** Create LogoutController:
  ```bash
  php artisan make:controller Auth/LogoutController
  ```

- [ ] **5.11** Implement logout

- [ ] **5.12** Implement guest-to-registered conversion:
  ```php
  public function convertGuest(Request $request) {
      $user = auth()->user();

      if (!$user->is_guest) {
          return back()->withErrors(['error' => 'Not a guest account']);
      }

      $user->update([
          'email' => $request->email,
          'password' => Hash::make($request->password),
          'username' => $request->username,
          'is_guest' => false,
          'guest_token' => null,
      ]);

      return redirect()->route('profile');
  }
  ```

#### Auth Routes

- [ ] **5.13** Define auth routes in `routes/web.php`:
  ```php
  Route::post('/auth/guest', [GuestController::class, 'store'])->name('auth.guest');
  Route::post('/auth/login', [LoginController::class, 'store'])->name('auth.login');
  Route::post('/auth/register', [RegisterController::class, 'store'])->name('auth.register');
  Route::post('/auth/logout', [LogoutController::class, 'destroy'])->name('auth.logout');
  Route::post('/auth/convert-guest', [GuestController::class, 'convert'])->name('auth.convert');
  ```

#### Middleware

- [ ] **5.14** Create EnsureUserIsNotGuest middleware:
  ```bash
  php artisan make:middleware EnsureUserIsNotGuest
  ```

- [ ] **5.15** Register middleware in `app/Http/Kernel.php`

#### Scheduled Tasks (Guest Cleanup)

- [ ] **5.16** Create CleanupGuestUsers command:
  ```bash
  php artisan make:command CleanupGuestUsers
  ```

- [ ] **5.17** Implement guest cleanup:
  ```php
  public function handle() {
      $deleted = User::guests()
                     ->where('created_at', '<', now()->subDays(7))
                     ->delete();

      $this->info("Deleted {$deleted} expired guest accounts");
  }
  ```

- [ ] **5.18** Schedule in `app/Console/Kernel.php`:
  ```php
  protected function schedule(Schedule $schedule) {
      $schedule->command('cleanup:guests')->daily();
  }
  ```

- [ ] **5.19** Test command: `php artisan cleanup:guests`

---

### 🎨 Phase 6: Frontend - Core UI (Week 7-8)

#### Week 7: Layouts & Pages

- [ ] **6.1** Create AppLayout:
  ```bash
  touch resources/js/Layouts/AppLayout.tsx
  ```

- [ ] **6.2** Implement AppLayout with Header, Navigation, Footer

- [ ] **6.3** Create AuthLayout:
  ```bash
  touch resources/js/Layouts/AuthLayout.tsx
  ```

- [ ] **6.4** Create GameLayout:
  ```bash
  touch resources/js/Layouts/GameLayout.tsx
  ```

- [ ] **6.5** Create Welcome page:
  ```bash
  touch resources/js/Pages/Welcome.tsx
  ```

- [ ] **6.6** Implement landing page with hero, features, CTA

- [ ] **6.7** Create Login page:
  ```bash
  touch resources/js/Pages/Auth/Login.tsx
  ```

- [ ] **6.8** Implement login form with validation

- [ ] **6.9** Create Register page:
  ```bash
  touch resources/js/Pages/Auth/Register.tsx
  ```

- [ ] **6.10** Implement registration form

- [ ] **6.11** Create Lobby page:
  ```bash
  touch resources/js/Pages/Lobby.tsx
  ```

- [ ] **6.12** Implement lobby with game list and filters

- [ ] **6.13** Create Profile page:
  ```bash
  touch resources/js/Pages/Profile.tsx
  ```

- [ ] **6.14** Implement profile with stats display

- [ ] **6.15** Create History page:
  ```bash
  touch resources/js/Pages/History.tsx
  ```

- [ ] **6.16** Implement game history table

#### Shared Components

- [ ] **6.17** Create Header component:
  ```bash
  touch resources/js/Components/layout/Header.tsx
  ```

- [ ] **6.18** Implement header with navigation, user menu, theme switcher

- [ ] **6.19** Create Footer component:
  ```bash
  touch resources/js/Components/layout/Footer.tsx
  ```

- [ ] **6.20** Create Navigation component:
  ```bash
  touch resources/js/Components/layout/Navigation.tsx
  ```

- [ ] **6.21** Create GameCard component (lobby):
  ```bash
  touch resources/js/Components/lobby/GameCard.tsx
  ```

- [ ] **6.22** Implement GameCard with player info, join button

- [ ] **6.23** Create GameList component:
  ```bash
  touch resources/js/Components/lobby/GameList.tsx
  ```

- [ ] **6.24** Create CreateGameModal:
  ```bash
  touch resources/js/Components/lobby/CreateGameModal.tsx
  ```

- [ ] **6.25** Implement game creation form (game type, timer, private)

#### Custom Hooks

- [ ] **6.26** Create useAuth hook:
  ```bash
  touch resources/js/Hooks/useAuth.ts
  ```

- [ ] **6.27** Implement useAuth with login, logout, register functions

- [ ] **6.28** Create useReverb hook:
  ```bash
  touch resources/js/Hooks/useReverb.ts
  ```

- [ ] **6.29** Implement useReverb for subscribing to channels:
  ```typescript
  export function useReverb(channelName: string, eventHandlers: Record<string, Function>) {
      useEffect(() => {
          const channel = window.Echo.channel(channelName);

          Object.entries(eventHandlers).forEach(([event, handler]) => {
              channel.listen(event, handler);
          });

          return () => {
              Object.keys(eventHandlers).forEach(event => {
                  channel.stopListening(event);
              });
              window.Echo.leave(channelName);
          };
      }, [channelName]);
  }
  ```

- [ ] **6.30** Create useToast hook:
  ```bash
  touch resources/js/Hooks/useToast.ts
  ```

#### Zustand Stores

- [ ] **6.31** Create gameStore:
  ```bash
  touch resources/js/Stores/gameStore.ts
  ```

- [ ] **6.32** Implement gameStore:
  ```typescript
  interface GameStore {
      gameState: any | null;
      connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
      setGameState: (state: any) => void;
      updateGameState: (updater: (state: any) => any) => void;
      setConnectionStatus: (status: string) => void;
  }

  export const useGameStore = create<GameStore>((set) => ({
      gameState: null,
      connectionStatus: 'disconnected',
      setGameState: (state) => set({ gameState: state }),
      updateGameState: (updater) => set((prev) => ({
          gameState: updater(prev.gameState)
      })),
      setConnectionStatus: (status) => set({ connectionStatus: status }),
  }));
  ```

- [ ] **6.33** Create uiStore:
  ```bash
  touch resources/js/Stores/uiStore.ts
  ```

- [ ] **6.34** Implement uiStore for modals, loading states

#### Theme System

- [ ] **6.35** Create ThemeContext:
  ```bash
  touch resources/js/Contexts/ThemeContext.tsx
  ```

- [ ] **6.36** Implement theme switching (5 themes from config)

- [ ] **6.37** Create ThemeSwitcher component:
  ```bash
  touch resources/js/Components/ui/ThemeSwitcher.tsx
  ```

- [ ] **6.38** Implement theme switcher dropdown

- [ ] **6.39** Add CSS variables for themes in `app.css`

---

### 🎮 Phase 7: Game UI Components (Week 8-9)

#### Week 8: Generic Game Components

- [ ] **7.1** Create GameBoard wrapper:
  ```bash
  touch resources/js/Components/game/GameBoard.tsx
  ```

- [ ] **7.2** Implement GameBoard to route to specific game:
  ```typescript
  export function GameBoard({ game, playerIndex }: Props) {
      switch (game.game_type) {
          case 'WAR':
              return <WarGameBoard game={game} playerIndex={playerIndex} />;
          case 'SWOOP':
              return <SwoopGameBoard game={game} playerIndex={playerIndex} />;
          case 'OH_HELL':
              return <OhHellGameBoard game={game} playerIndex={playerIndex} />;
          default:
              return <div>Unknown game type</div>;
      }
  }
  ```

- [ ] **7.3** Create Card component:
  ```bash
  touch resources/js/Components/game/Card.tsx
  ```

- [ ] **7.4** Implement Card with flip animation, click handler

- [ ] **7.5** Create PlayerInfo component:
  ```bash
  touch resources/js/Components/game/PlayerInfo.tsx
  ```

- [ ] **7.6** Implement PlayerInfo showing avatar, name, cards, turn indicator

- [ ] **7.7** Create TurnTimer component:
  ```bash
  touch resources/js/Components/game/TurnTimer.tsx
  ```

- [ ] **7.8** Implement countdown timer with warnings

- [ ] **7.9** Create GameChat component:
  ```bash
  touch resources/js/Components/game/GameChat.tsx
  ```

- [ ] **7.10** Implement chat with message list, input, emoji picker

- [ ] **7.11** Create ReconnectionOverlay component:
  ```bash
  touch resources/js/Components/game/ReconnectionOverlay.tsx
  ```

- [ ] **7.12** Implement reconnection UI with loading spinner

#### War Game UI

- [ ] **7.13** Create WarGameBoard:
  ```bash
  mkdir -p resources/js/Components/game/WarGame
  touch resources/js/Components/game/WarGame/WarGameBoard.tsx
  ```

- [ ] **7.14** Implement War game layout:
  - Player decks
  - Current pile
  - Play button
  - Player info panels

- [ ] **7.15** Implement War move handling:
  ```typescript
  function handlePlayCard() {
      router.post(`/games/${gameId}/move`, {
          action: 'PLAY',
      });
  }
  ```

- [ ] **7.16** Listen to Reverb events:
  ```typescript
  useReverb(`game.${gameId}`, {
      'move.made': (data) => {
          setGameState(data.gameState);
      },
  });
  ```

- [ ] **7.17** Add War animations (card flip, pile collection)

#### Swoop Game UI

- [ ] **7.18** Create SwoopGameBoard:
  ```bash
  mkdir -p resources/js/Components/game/SwoopGame
  touch resources/js/Components/game/SwoopGame/SwoopGameBoard.tsx
  ```

- [ ] **7.19** Implement Swoop layout:
  - Other players (top)
  - Central pile
  - Your face-up cards
  - Your hand
  - Mystery cards indicators

- [ ] **7.20** Implement card selection (multi-select):
  ```typescript
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());

  function toggleCard(cardId: string) {
      setSelectedCards(prev => {
          const next = new Set(prev);
          if (next.has(cardId)) {
              next.delete(cardId);
          } else {
              next.add(cardId);
          }
          return next;
      });
  }
  ```

- [ ] **7.21** Implement play/pickup/skip actions

- [ ] **7.22** Add Swoop animation (SWOOP! text explosion)

- [ ] **7.23** Implement mystery card reveal animation

#### Oh Hell Game UI

- [ ] **7.24** Create OhHellGameBoard:
  ```bash
  mkdir -p resources/js/Components/game/OhHellGame
  touch resources/js/Components/game/OhHellGame/OhHellGameBoard.tsx
  ```

- [ ] **7.25** Create BiddingPanel:
  ```bash
  touch resources/js/Components/game/OhHellGame/BiddingPanel.tsx
  ```

- [ ] **7.26** Implement bidding interface:
  - Show your hand
  - Display current bids
  - Bid number buttons (0-N)
  - Highlight invalid bids (dealer restriction)

- [ ] **7.27** Implement Oh Hell game layout:
  - Round info (round number, trump suit)
  - Other players with bid/tricks info
  - Current trick in center
  - Your hand
  - Bid/tricks tracker

- [ ] **7.28** Implement card play with suit following validation

- [ ] **7.29** Implement trick collection animation

- [ ] **7.30** Create round-over modal with scores

#### Game Page

- [ ] **7.31** Create dynamic game page:
  ```bash
  touch resources/js/Pages/Game/Show.tsx
  ```

- [ ] **7.32** Implement game page:
  ```typescript
  export default function GameShow({ game, playerIndex }: Props) {
      return (
          <GameLayout>
              <GameBoard game={game} playerIndex={playerIndex} />
              <GameChat gameId={game.id} />
          </GameLayout>
      );
  }
  ```

- [ ] **7.33** Add route in `routes/web.php`:
  ```php
  Route::get('/games/{game}', [GameController::class, 'show'])->name('games.show');
  ```

---

### ✨ Phase 8: Polish & Features (Week 10-11)

#### Week 10: Enhanced Features

- [ ] **8.1** Create HowToPlay modal for each game

- [ ] **8.2** Implement sound effects (optional):
  - Card flip sound
  - Move made sound
  - Game over sound
  - Chat message sound

- [ ] **8.3** Create OfflineIndicator component:
  ```bash
  touch resources/js/Components/ui/OfflineIndicator.tsx
  ```

- [ ] **8.4** Implement offline detection with `navigator.onLine`

- [ ] **8.5** Add loading states to all async operations

- [ ] **8.6** Create LoadingSpinner component:
  ```bash
  touch resources/js/Components/ui/LoadingSpinner.tsx
  ```

- [ ] **8.7** Create ErrorBoundary component:
  ```bash
  touch resources/js/Components/ErrorBoundary.tsx
  ```

- [ ] **8.8** Wrap app in ErrorBoundary in `app.tsx`

- [ ] **8.9** Add Framer Motion animations:
  - Page transitions
  - Card animations
  - Modal animations
  - List item animations

- [ ] **8.10** Implement responsive design (mobile breakpoints):
  - Mobile: 640px
  - Tablet: 768px
  - Desktop: 1024px

- [ ] **8.11** Test all pages on mobile viewport

- [ ] **8.12** Optimize images (use WebP format)

- [ ] **8.13** Add meta tags for SEO

#### Policies & Authorization

- [ ] **8.14** Create GamePolicy:
  ```bash
  php artisan make:policy GamePolicy --model=Game
  ```

- [ ] **8.15** Implement policy methods:
  - `view(User $user, Game $game)` - can view game
  - `join(User $user, Game $game)` - can join game
  - `makeMove(User $user, Game $game)` - can make move
  - `leave(User $user, Game $game)` - can leave game

- [ ] **8.16** Register policy in `AuthServiceProvider`

- [ ] **8.17** Apply policies in controllers:
  ```php
  $this->authorize('makeMove', $game);
  ```

#### Error Handling

- [ ] **8.18** Create custom exception handlers

- [ ] **8.19** Create user-friendly error pages:
  - 404 Not Found
  - 403 Forbidden
  - 500 Server Error

- [ ] **8.20** Implement global error handling in Inertia

---

### 🧪 Phase 9: Testing (Week 11)

#### Unit Tests

- [ ] **9.1** Test all game engines (already done in Phase 3)

- [ ] **9.2** Test GameService:
  ```bash
  php artisan make:test --unit Services/GameServiceTest
  ```

- [ ] **9.3** Test GameStateService:
  ```bash
  php artisan make:test --unit Services/GameStateServiceTest
  ```

- [ ] **9.4** Run unit tests: `php artisan test --testsuite=Unit`

#### Feature Tests

- [ ] **9.5** Create auth feature tests:
  ```bash
  php artisan make:test Auth/GuestAuthTest
  php artisan make:test Auth/LoginTest
  php artisan make:test Auth/RegistrationTest
  ```

- [ ] **9.6** Test guest authentication flow

- [ ] **9.7** Test user login/logout

- [ ] **9.8** Test guest-to-registered conversion

- [ ] **9.9** Create game feature tests:
  ```bash
  php artisan make:test Game/CreateGameTest
  php artisan make:test Game/JoinGameTest
  php artisan make:test Game/GameFlowTest
  ```

- [ ] **9.10** Test game creation

- [ ] **9.11** Test joining games

- [ ] **9.12** Test making moves

- [ ] **9.13** Test game completion

- [ ] **9.14** Run feature tests: `php artisan test --testsuite=Feature`

#### Browser Tests (Laravel Dusk)

- [ ] **9.15** Install Dusk:
  ```bash
  composer require --dev laravel/dusk
  php artisan dusk:install
  ```

- [ ] **9.16** Create end-to-end test:
  ```bash
  php artisan dusk:make CompleteGameFlowTest
  ```

- [ ] **9.17** Test complete game flow:
  - Guest login
  - Create game
  - Join game (second browser)
  - Play moves
  - Complete game
  - View stats

- [ ] **9.18** Run Dusk tests: `php artisan dusk`

#### Frontend Tests

- [ ] **9.19** Configure Vitest in `vite.config.js`

- [ ] **9.20** Create component tests for:
  - Card component
  - GameBoard component
  - GameCard component
  - ThemeSwitcher component

- [ ] **9.21** Run frontend tests: `npm run test`

#### Performance Testing

- [ ] **9.22** Install Laravel Debugbar (dev only):
  ```bash
  composer require barryvdh/laravel-debugbar --dev
  ```

- [ ] **9.23** Profile database queries (N+1 checks)

- [ ] **9.24** Test Redis performance (game state operations)

- [ ] **9.25** Test WebSocket connection handling (multiple clients)

- [ ] **9.26** Run Lighthouse audit on frontend

---

### 🚀 Phase 10: Deployment (Week 12)

#### Pre-Deployment Checklist

- [ ] **10.1** Set `APP_ENV=production` in `.env`

- [ ] **10.2** Set `APP_DEBUG=false` in `.env`

- [ ] **10.3** Generate production app key: `php artisan key:generate`

- [ ] **10.4** Run optimizations:
  ```bash
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  npm run build
  ```

- [ ] **10.5** Test production build locally

#### Kinsta Setup

- [ ] **10.6** Create Kinsta application

- [ ] **10.7** Configure Nixpacks build settings

- [ ] **10.8** Create `nixpacks.toml`:
  ```toml
  [phases.setup]
  nixPkgs = ['php82', 'nodejs_20', 'postgresql', 'redis']

  [phases.install]
  cmds = [
      'composer install --no-dev --optimize-autoloader',
      'npm ci --production',
  ]

  [phases.build]
  cmds = [
      'npm run build',
      'php artisan config:cache',
      'php artisan route:cache',
      'php artisan view:cache',
  ]

  [start]
  cmd = 'php artisan serve --host=0.0.0.0 --port=$PORT'
  ```

- [ ] **10.9** Create PostgreSQL database on Kinsta

- [ ] **10.10** Create Redis instance on Kinsta

- [ ] **10.11** Configure environment variables on Kinsta:
  - `APP_KEY`
  - `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
  - `REDIS_HOST`, `REDIS_PASSWORD`
  - `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET`
  - All Vite variables

#### Reverb Deployment

- [ ] **10.12** Configure Reverb for production in `.env`:
  ```
  REVERB_HOST=your-domain.com
  REVERB_PORT=443
  REVERB_SCHEME=https
  ```

- [ ] **10.13** Create Procfile for process management:
  ```
  web: php artisan serve --host=0.0.0.0 --port=$PORT
  reverb: php artisan reverb:start --host=0.0.0.0 --port=8080
  queue: php artisan queue:work redis --sleep=3 --tries=3
  ```

- [ ] **10.14** Configure Kinsta to run all processes

#### Database Migration

- [ ] **10.15** Run migrations on production: `php artisan migrate --force`

- [ ] **10.16** Seed database if needed: `php artisan db:seed`

#### Queue Workers

- [ ] **10.17** Configure queue worker as background process

- [ ] **10.18** Test queue is processing jobs

#### Scheduled Tasks

- [ ] **10.19** Configure cron on Kinsta to run Laravel scheduler:
  ```
  * * * * * php /app/artisan schedule:run >> /dev/null 2>&1
  ```

- [ ] **10.20** Verify scheduled tasks are running

#### Domain & SSL

- [ ] **10.21** Point domain to Kinsta

- [ ] **10.22** Configure SSL certificate

- [ ] **10.23** Force HTTPS in production

#### Monitoring

- [ ] **10.24** Install Laravel Telescope (optional):
  ```bash
  composer require laravel/telescope
  php artisan telescope:install
  php artisan migrate
  ```

- [ ] **10.25** Restrict Telescope access in production

- [ ] **10.26** Set up Sentry for error tracking (optional):
  ```bash
  composer require sentry/sentry-laravel
  ```

- [ ] **10.27** Configure Sentry DSN in `.env`

#### Final Checks

- [ ] **10.28** Test guest authentication on production

- [ ] **10.29** Test user registration on production

- [ ] **10.30** Create test game on production

- [ ] **10.31** Test WebSocket connections on production

- [ ] **10.32** Test making moves on production

- [ ] **10.33** Test reconnection on production

- [ ] **10.34** Test all 3 games on production

- [ ] **10.35** Verify database is persisting data

- [ ] **10.36** Verify Redis is caching correctly

- [ ] **10.37** Check application logs for errors

- [ ] **10.38** Run load test (optional - use Laravel Octane + k6)

- [ ] **10.39** 🚀 **LAUNCH!**

---

## Troubleshooting Guide

### Issue: Migrations Fail

**Solution:**
```bash
# Reset database
php artisan migrate:fresh

# Check database connection
php artisan tinker
DB::connection()->getPdo();
```

### Issue: Redis Connection Failed

**Solution:**
```bash
# Test Redis
redis-cli ping

# Check .env configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### Issue: Reverb Not Broadcasting

**Solution:**
```bash
# Start Reverb
php artisan reverb:start

# Check Reverb logs
tail -f storage/logs/reverb.log

# Verify Echo configuration in bootstrap.ts
```

### Issue: Inertia Not Loading

**Solution:**
```bash
# Clear cache
php artisan cache:clear
php artisan view:clear
php artisan config:clear

# Rebuild assets
npm run build
```

### Issue: Game State Not Persisting

**Solution:**
```bash
# Check Redis
php artisan tinker
Redis::get('game:1:state');

# Check queue is running
php artisan queue:work
```

### Issue: WebSocket Connection Refused

**Solution:**
- Verify Reverb is running
- Check firewall rules (port 8080)
- Verify VITE variables are set correctly
- Check browser console for errors

### Issue: Tests Failing

**Solution:**
```bash
# Run specific test
php artisan test --filter=WarEngineTest

# Check test database configuration
# Use separate .env.testing file

# Clear test cache
php artisan config:clear --env=testing
```

---

## Session Continuity Guide

If our session is interrupted, use this checklist to resume:

1. **Find last completed item** - Search for the last checked `[x]` item
2. **Verify context** - Run tests or check implementation of last completed phase
3. **Resume from next unchecked item** - Continue with next `[ ]` item
4. **Reference detailed guide** - Scroll to the appropriate phase section for implementation details

**Quick Status Check Commands:**
```bash
# Check migrations
php artisan migrate:status

# Check installed packages
composer show | grep laravel
npm list --depth=0

# Check running processes
ps aux | grep artisan
ps aux | grep reverb

# Check git status
git log --oneline -10
```

---

## Appendix: Quick Reference Commands

### Development
```bash
# Start servers
php artisan serve                  # Laravel
php artisan reverb:start          # WebSocket
php artisan queue:work            # Queue worker
npm run dev                       # Vite

# Clear caches
php artisan optimize:clear
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Database
php artisan migrate
php artisan migrate:fresh --seed
php artisan db:seed

# Testing
php artisan test
php artisan test --filter=GameTest
php artisan dusk
npm run test
```

### Production
```bash
# Optimize
php artisan optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
npm run build

# Database
php artisan migrate --force

# Queue
php artisan queue:restart
```

---

## Final Notes

This migration plan provides a complete, step-by-step guide to rebuild Time to Play using Laravel + Inertia + React. The modular game engine architecture ensures that adding new games in the future requires minimal effort.

**Key Success Factors:**
1. ✅ Follow checklist sequentially
2. ✅ Test after each phase
3. ✅ Keep game engines modular
4. ✅ Write tests early
5. ✅ Use Reverb for real-time
6. ✅ Deploy early and often

**Estimated Timeline:** 12 weeks (3 months)

**Good luck, and let's build something amazing!** 🚀🎮
