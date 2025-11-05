# Time to Play - API Reference

Base URL: `http://localhost:8888/api`

All endpoints except `/games/types` require authentication via Laravel Sanctum.

---

## Authentication

### Session-Based (SPA)

For Inertia.js applications, Sanctum uses Laravel's session authentication automatically. No additional headers needed for same-domain requests.

### CSRF Protection

Include CSRF token in requests (automatically handled by Inertia.js):
```javascript
// Laravel provides this via Inertia middleware
```

---

## Endpoints

### Game Types

#### Get Available Game Types
```http
GET /api/games/types
```

**Authentication:** Not required

**Response:**
```json
{
  "games": [
    {
      "type": "WAR",
      "name": "War",
      "config": {
        "minPlayers": 2,
        "maxPlayers": 2,
        "description": "A simple two-player card game where the highest card wins",
        "difficulty": "Easy",
        "estimatedDuration": "10-20 minutes",
        "requiresStrategy": false
      }
    },
    {
      "type": "SWOOP",
      "name": "Swoop",
      "config": {
        "minPlayers": 3,
        "maxPlayers": 8,
        "description": "Race to get rid of all your cards with strategic swoops",
        "difficulty": "Medium",
        "estimatedDuration": "15-30 minutes per round",
        "requiresStrategy": true
      }
    },
    {
      "type": "OH_HELL",
      "name": "Oh Hell!",
      "config": {
        "minPlayers": 3,
        "maxPlayers": 5,
        "description": "Strategic trick-taking game with exact bidding",
        "difficulty": "Hard",
        "estimatedDuration": "45-60 minutes",
        "requiresStrategy": true
      }
    }
  ]
}
```

---

### Games

#### List Games
```http
GET /api/games
```

**Query Parameters:**
- `status` (optional): Filter by game status (`WAITING`, `READY`, `IN_PROGRESS`, `COMPLETED`, `ABANDONED`)
- `game_type` (optional): Filter by game type (`WAR`, `SWOOP`, `OH_HELL`)
- `user_id` (optional): Filter games where user is a player
- `page` (optional): Pagination page number

**Response:**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "game_type": "WAR",
      "status": "WAITING",
      "max_players": 2,
      "timer_config": null,
      "current_state": null,
      "winner_id": null,
      "created_at": "2025-11-05T12:00:00.000000Z",
      "updated_at": "2025-11-05T12:00:00.000000Z",
      "game_players": [...],
      "winner": null
    }
  ],
  "per_page": 20,
  "total": 1
}
```

#### Create Game
```http
POST /api/games
```

**Body:**
```json
{
  "game_type": "WAR",
  "max_players": 2,
  "timer_config": {
    "turn_time": 30,
    "total_time": 600
  }
}
```

**Validation:**
- `game_type`: required, one of: `WAR`, `SWOOP`, `OH_HELL`
- `max_players`: required, integer, min: 2, max: 8
- `timer_config` (optional):
  - `turn_time`: integer, min: 10, max: 300 (seconds per turn)
  - `total_time`: integer, min: 60 (total game time limit)

**Response (201):**
```json
{
  "message": "Game created successfully",
  "game": {
    "id": 1,
    "game_type": "WAR",
    "status": "WAITING",
    "max_players": 2,
    "game_players": [
      {
        "id": 1,
        "game_id": 1,
        "user_id": 1,
        "player_index": 0,
        "is_ready": false,
        "is_connected": true,
        "user": {
          "id": 1,
          "display_name": "Player 1"
        }
      }
    ]
  }
}
```

#### Get Game Details
```http
GET /api/games/{id}
```

**Response:**
```json
{
  "game": {
    "id": 1,
    "game_type": "WAR",
    "status": "IN_PROGRESS",
    "max_players": 2,
    "current_state": "{...}", // JSON string
    "game_players": [...],
    "game_moves": [...],
    "winner": null
  }
}
```

#### Get Game State (Player View)
```http
GET /api/games/{id}/state
```

Returns the game state filtered for the current player (hides opponent cards, etc.)

**Response:**
```json
{
  "state": {
    "players": [...],
    "player1Deck": [...],
    "player2Deck": ["hidden", "hidden", ...],
    "cardsInPlay": {...},
    "phase": "FLIP",
    "waitingFor": "BOTH"
  }
}
```

#### Get Game Statistics
```http
GET /api/games/{id}/stats
```

**Response:**
```json
{
  "total_moves": 42,
  "duration": 456, // seconds
  "players": [
    {
      "user_id": 1,
      "name": "Player 1",
      "placement": 1,
      "score": null,
      "moves_made": 21
    },
    {
      "user_id": 2,
      "name": "Player 2",
      "placement": 2,
      "score": null,
      "moves_made": 21
    }
  ]
}
```

#### Start Game
```http
POST /api/games/{id}/start
```

Initializes the game state and begins gameplay.

**Response:**
```json
{
  "message": "Game started",
  "state": {
    "players": [...],
    "player1Deck": [...],
    "player2Deck": [...],
    "phase": "FLIP",
    "waitingFor": "BOTH"
  }
}
```

**Error (400):**
```json
{
  "message": "Game is not ready to start"
}
```

#### Abandon Game
```http
DELETE /api/games/{id}
```

Only allowed if game hasn't started (`status === 'WAITING'`).

**Response:**
```json
{
  "message": "Game abandoned"
}
```

---

### Player Actions

#### Join Game
```http
POST /api/games/{gameId}/join
```

**Response:**
```json
{
  "message": "Joined game successfully",
  "game_player": {
    "id": 2,
    "game_id": 1,
    "user_id": 2,
    "player_index": 1,
    "is_ready": false,
    "is_connected": true,
    "game": {...},
    "user": {...}
  }
}
```

**Error (400):**
```json
{
  "message": "Game is full"
}
```

#### Leave Game
```http
POST /api/games/{gameId}/leave
```

**Response:**
```json
{
  "message": "Left game successfully"
}
```

#### Mark Ready/Not Ready
```http
POST /api/games/{gameId}/ready
```

**Body:**
```json
{
  "ready": true  // or false
}
```

**Response:**
```json
{
  "message": "Marked as ready"
}
```

**Note:** When all players are ready, the game automatically starts.

#### Update Connection Status
```http
POST /api/games/{gameId}/connect
```

**Body:**
```json
{
  "connected": true  // or false
}
```

**Response:**
```json
{
  "message": "Marked as connected"
}
```

---

### Gameplay

#### Make a Move
```http
POST /api/games/{gameId}/move
```

**Body (varies by game):**

**War:**
```json
{
  "move": {
    "action": "flip"
  }
}
```

**Swoop:**
```json
{
  "move": {
    "action": "PLAY",
    "cards": [
      {
        "suit": "hearts",
        "rank": "7",
        "value": 7,
        "imageUrl": "/images/cards/7_of_hearts.svg"
      }
    ],
    "fromHand": true,
    "fromFaceUp": [0, 1],
    "fromMystery": 0
  }
}
```

**Oh Hell:**
```json
{
  "move": {
    "action": "BID",
    "bid": 3
  }
}
```

or

```json
{
  "move": {
    "action": "PLAY_CARD",
    "card": {
      "suit": "hearts",
      "rank": "A",
      "value": 14,
      "imageUrl": "/images/cards/A_of_hearts.svg"
    }
  }
}
```

**Response:**
```json
{
  "message": "Move made successfully",
  "state": {
    // Updated game state
  }
}
```

**Error (400):**
```json
{
  "message": "Not your turn",
  "error": "Not your turn"
}
```

---

## WebSocket Events

Connect to Laravel Reverb for real-time updates:

**Connection:**
```javascript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});
```

### Presence Channel (Player Tracking)

**Subscribe:**
```javascript
Echo.join(`game.${gameId}`)
    .here((users) => {
        // Users currently in the game
    })
    .joining((user) => {
        // User joined
    })
    .leaving((user) => {
        // User left
    })
    .listen('.player.joined', (e) => {
        // PlayerJoinedGame event
    })
    .listen('.player.left', (e) => {
        // PlayerLeftGame event
    });
```

### Private Channel (Game State)

**Subscribe:**
```javascript
Echo.private(`game.${gameId}.private`)
    .listen('.game.state.updated', (e) => {
        // GameStateUpdated event
        console.log('New state:', e.gameState);
    })
    .listen('.game.move.made', (e) => {
        // MoveMade event
        console.log('Move by player', e.playerIndex);
        console.log('New state:', e.newGameState);
    });
```

### Event Payloads

**game.state.updated:**
```json
{
  "gameId": 1,
  "gameState": {...},
  "playerIndex": null,
  "timestamp": "2025-11-05T12:00:00.000000Z"
}
```

**game.move.made:**
```json
{
  "gameId": 1,
  "playerIndex": 0,
  "move": {...},
  "newGameState": {...},
  "timestamp": "2025-11-05T12:00:00.000000Z"
}
```

**player.joined:**
```json
{
  "gameId": 1,
  "userId": 2,
  "userName": "Player 2",
  "avatarUrl": "/avatars/player2.png",
  "timestamp": "2025-11-05T12:00:00.000000Z"
}
```

**player.left:**
```json
{
  "gameId": 1,
  "userId": 2,
  "userName": "Player 2",
  "timestamp": "2025-11-05T12:00:00.000000Z"
}
```

---

## Error Responses

**400 Bad Request:**
```json
{
  "message": "Validation error or business logic error"
}
```

**404 Not Found:**
```json
{
  "message": "No query results for model [App\\Models\\Game] 999"
}
```

**422 Unprocessable Entity (Validation):**
```json
{
  "message": "The game type field is required.",
  "errors": {
    "game_type": [
      "The game type field is required."
    ]
  }
}
```

---

## Game State Structures

### War
```typescript
{
  players: Player[],
  player1Deck: Card[],
  player2Deck: Card[],
  cardsInPlay: {
    player1: Card[],
    player2: Card[]
  },
  phase: 'FLIP' | 'WAR' | 'GAME_OVER',
  waitingFor: 'PLAYER_1' | 'PLAYER_2' | 'BOTH' | 'NONE',
  turnCount: number,
  warDepth: number,
  lastAction: {...}
}
```

### Swoop
```typescript
{
  players: Player[],
  playerCount: number,
  playerHands: Card[][],
  faceUpCards: Card[][],
  mysteryCards: Card[][],
  playPile: Card[],
  removedCards: Card[],
  currentPlayerIndex: number,
  phase: 'PLAYING' | 'ROUND_OVER' | 'GAME_OVER',
  round: number,
  scores: number[],
  lastAction: {...},
  recentSwoop: boolean
}
```

### Oh Hell
```typescript
{
  players: Player[],
  playerCount: number,
  maxCards: number,
  scoringVariant: 'standard' | 'partial',
  currentRound: number,
  totalRounds: number,
  cardsThisRound: number,
  isAscending: boolean,
  trumpSuit: string | null,
  trumpCard: Card | null,
  dealerIndex: number,
  playerHands: Card[][],
  phase: 'BIDDING' | 'PLAYING' | 'ROUND_OVER' | 'GAME_OVER',
  bids: (number | null)[],
  currentBidder: number | null,
  currentTrick: {...},
  tricksWon: number[],
  completedTricks: any[],
  scores: number[],
  roundScores: number[],
  lastAction: {...}
}
```

---

## Rate Limiting

Standard Laravel rate limiting applies:
- **API routes:** 60 requests per minute per user
- **Broadcast auth:** Unlimited

---

## Development URLs

- **API Base:** `http://localhost:8888/api`
- **WebSocket:** `ws://localhost:8080`
- **Frontend:** `http://localhost:5173` (Vite dev server)

---

**Last Updated:** November 5, 2025
