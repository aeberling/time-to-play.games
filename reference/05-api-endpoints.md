# API Endpoints Specification

## Overview

The Time to Play platform uses a RESTful API for HTTP requests and WebSocket events for real-time game communication. All HTTP endpoints are implemented as Next.js API routes.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://time-to-play.games/api`

## Authentication

All authenticated endpoints require a JWT token sent via HTTP-only cookie or Authorization header.

```
Cookie: auth_token=<jwt_token>
// OR
Authorization: Bearer <jwt_token>
```

## HTTP API Endpoints

### Authentication

#### Create Guest Account

```
POST /api/auth/guest
```

Creates a temporary guest account for immediate play.

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "clx1234567890",
    "displayName": "Guest_1234",
    "isGuest": true,
    "guestToken": "guest_abc123xyz"
  },
  "token": "jwt_token_here"
}
```

**Status Codes**:
- `201`: Guest account created
- `500`: Server error

---

#### Register Account

```
POST /api/auth/register
```

Converts a guest account to a registered account or creates a new registered account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "coolplayer" // optional
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "username": "coolplayer",
    "displayName": "coolplayer",
    "isGuest": false
  },
  "token": "jwt_token_here"
}
```

**Status Codes**:
- `201`: Account created
- `400`: Validation error (email taken, weak password)
- `500`: Server error

---

#### Login

```
POST /api/auth/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "username": "coolplayer",
    "displayName": "coolplayer"
  },
  "token": "jwt_token_here"
}
```

**Status Codes**:
- `200`: Login successful
- `401`: Invalid credentials
- `500`: Server error

---

#### Logout

```
POST /api/auth/logout
```

**Request Body**: None

**Response**:
```json
{
  "success": true
}
```

**Status Codes**:
- `200`: Logout successful

---

#### Get Current User

```
GET /api/auth/me
```

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "username": "coolplayer",
    "displayName": "coolplayer",
    "isGuest": false,
    "avatarUrl": null,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Status Codes**:
- `200`: Success
- `401`: Not authenticated
- `500`: Server error

---

### Games

#### Create New Game

```
POST /api/games
```

**Authentication**: Required

**Request Body**:
```json
{
  "gameType": "WAR",
  "maxPlayers": 2
}
```

**Response**:
```json
{
  "success": true,
  "game": {
    "id": "game_abc123",
    "gameType": "WAR",
    "status": "WAITING",
    "maxPlayers": 2,
    "createdAt": "2024-01-15T10:30:00Z",
    "players": [
      {
        "userId": "clx1234567890",
        "displayName": "coolplayer",
        "playerIndex": 0,
        "isReady": true
      }
    ]
  }
}
```

**Status Codes**:
- `201`: Game created
- `400`: Invalid game type
- `401`: Not authenticated
- `500`: Server error

---

#### Get Available Games

```
GET /api/games/available
```

**Authentication**: Required

**Query Parameters**:
- `gameType`: Filter by game type (optional)
- `limit`: Number of results (default: 20)

**Response**:
```json
{
  "success": true,
  "games": [
    {
      "id": "game_abc123",
      "gameType": "WAR",
      "status": "WAITING",
      "maxPlayers": 2,
      "currentPlayers": 1,
      "createdAt": "2024-01-15T10:30:00Z",
      "players": [
        {
          "displayName": "coolplayer",
          "avatarUrl": null
        }
      ]
    }
  ]
}
```

**Status Codes**:
- `200`: Success
- `401`: Not authenticated
- `500`: Server error

---

#### Get Game Details

```
GET /api/games/[gameId]
```

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "game": {
    "id": "game_abc123",
    "gameType": "WAR",
    "status": "IN_PROGRESS",
    "maxPlayers": 2,
    "createdAt": "2024-01-15T10:30:00Z",
    "startedAt": "2024-01-15T10:32:00Z",
    "players": [
      {
        "userId": "clx1234567890",
        "displayName": "coolplayer",
        "playerIndex": 0,
        "isReady": true,
        "isConnected": true
      },
      {
        "userId": "clx9876543210",
        "displayName": "opponent",
        "playerIndex": 1,
        "isReady": true,
        "isConnected": true
      }
    ]
  }
}
```

**Status Codes**:
- `200`: Success
- `401`: Not authenticated
- `403`: Not authorized to view this game
- `404`: Game not found
- `500`: Server error

---

#### Join Game

```
POST /api/games/[gameId]/join
```

**Authentication**: Required

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "game": {
    "id": "game_abc123",
    "status": "READY",
    "players": [
      {
        "userId": "clx1234567890",
        "displayName": "coolplayer",
        "playerIndex": 0
      },
      {
        "userId": "clx9876543210",
        "displayName": "You",
        "playerIndex": 1
      }
    ]
  }
}
```

**Status Codes**:
- `200`: Joined successfully
- `400`: Game is full
- `401`: Not authenticated
- `404`: Game not found
- `500`: Server error

---

#### Leave Game

```
POST /api/games/[gameId]/leave
```

**Authentication**: Required

**Request Body**: None

**Response**:
```json
{
  "success": true
}
```

**Status Codes**:
- `200`: Left successfully
- `401`: Not authenticated
- `404`: Game not found or not in game
- `500`: Server error

---

### User Profile & Stats

#### Get User Profile

```
GET /api/users/[userId]
```

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "clx1234567890",
    "username": "coolplayer",
    "displayName": "coolplayer",
    "avatarUrl": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "stats": {
      "totalGamesPlayed": 42,
      "totalGamesWon": 25,
      "overallWinRate": 59.5,
      "longestWinStreak": 7,
      "gameStats": {
        "WAR": {
          "gamesPlayed": 30,
          "gamesWon": 18,
          "winRate": 60.0,
          "elo": 1350
        }
      }
    }
  }
}
```

**Status Codes**:
- `200`: Success
- `401`: Not authenticated
- `404`: User not found
- `500`: Server error

---

#### Update User Profile

```
PATCH /api/users/me
```

**Authentication**: Required

**Request Body**:
```json
{
  "displayName": "NewName",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "clx1234567890",
    "displayName": "NewName",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

**Status Codes**:
- `200`: Updated successfully
- `400`: Validation error
- `401`: Not authenticated
- `500`: Server error

---

#### Get Game History

```
GET /api/users/me/history
```

**Authentication**: Required

**Query Parameters**:
- `gameType`: Filter by game type (optional)
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

**Response**:
```json
{
  "success": true,
  "games": [
    {
      "id": "game_abc123",
      "gameType": "WAR",
      "status": "COMPLETED",
      "startedAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T10:45:00Z",
      "players": [
        {
          "displayName": "coolplayer",
          "placement": 1,
          "score": 52
        },
        {
          "displayName": "opponent",
          "placement": 2,
          "score": 0
        }
      ],
      "myPlacement": 1,
      "myScore": 52
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

**Status Codes**:
- `200`: Success
- `401`: Not authenticated
- `500`: Server error

---

### Game Assets

#### Upload Card Set

```
POST /api/assets/cards
```

**Authentication**: Required

**Request**: Multipart form data with card images

**Response**:
```json
{
  "success": true,
  "cardSet": {
    "id": "cardset_abc123",
    "name": "Custom Cards",
    "cards": {
      "back": "https://cdn.time-to-play.games/cards/custom/back.png",
      "clubs_ace": "https://cdn.time-to-play.games/cards/custom/clubs_ace.png"
      // ... more cards
    }
  }
}
```

**Status Codes**:
- `201`: Upload successful
- `400`: Invalid file format
- `401`: Not authenticated
- `413`: File too large
- `500`: Server error

---

#### Get Available Card Sets

```
GET /api/assets/cards
```

**Authentication**: Optional

**Response**:
```json
{
  "success": true,
  "cardSets": [
    {
      "id": "default",
      "name": "Default Cards",
      "previewUrl": "https://cdn.time-to-play.games/cards/default/preview.png"
    },
    {
      "id": "cardset_abc123",
      "name": "Custom Cards",
      "previewUrl": "https://cdn.time-to-play.games/cards/custom/preview.png",
      "uploadedBy": "coolplayer"
    }
  ]
}
```

**Status Codes**:
- `200`: Success
- `500`: Server error

---

## WebSocket Events

### Client → Server Events

#### game:join

Join a game room and receive current state.

**Payload**:
```json
{
  "gameId": "game_abc123"
}
```

**Server Response**: `game:state` event

---

#### game:move

Submit a move in the current game.

**Payload**:
```json
{
  "gameId": "game_abc123",
  "moveData": {
    // Game-specific move data
    // For War: { action: "flip" }
    // For Chess: { from: "e2", to: "e4" }
  }
}
```

**Server Response**: `game:move_made` event (broadcast to all players)

---

#### game:leave

Leave the current game.

**Payload**:
```json
{
  "gameId": "game_abc123"
}
```

**Server Response**: `player:left` event (broadcast to other players)

---

#### player:ready

Mark player as ready to start.

**Payload**:
```json
{
  "gameId": "game_abc123"
}
```

**Server Response**: `player:ready` event (broadcast to all players)

---

### Server → Client Events

#### game:state

Full game state sent when joining or reconnecting.

**Payload**:
```json
{
  "gameId": "game_abc123",
  "gameType": "WAR",
  "status": "IN_PROGRESS",
  "currentTurn": 0,
  "players": [
    {
      "userId": "clx1234567890",
      "displayName": "coolplayer",
      "playerIndex": 0,
      "isConnected": true,
      "isReady": true
    },
    {
      "userId": "clx9876543210",
      "displayName": "opponent",
      "playerIndex": 1,
      "isConnected": true,
      "isReady": true
    }
  ],
  "gameState": {
    // Game-specific state (see game implementation docs)
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "lastMoveAt": "2024-01-15T10:35:00Z",
  "moveCount": 15
}
```

---

#### game:move_made

Broadcast when any player makes a move.

**Payload**:
```json
{
  "userId": "clx1234567890",
  "moveData": {
    // Game-specific move data
  },
  "newGameState": {
    // Updated game state
  },
  "timestamp": "2024-01-15T10:35:00Z"
}
```

---

#### game:over

Sent when game ends.

**Payload**:
```json
{
  "winnerId": "clx1234567890",
  "reason": "all_cards_won",
  "finalState": {
    // Final game state
  },
  "stats": {
    "duration": 900, // seconds
    "totalMoves": 156,
    "players": [
      {
        "userId": "clx1234567890",
        "placement": 1,
        "score": 52
      },
      {
        "userId": "clx9876543210",
        "placement": 2,
        "score": 0
      }
    ]
  }
}
```

---

#### player:joined

Broadcast when a player joins the game.

**Payload**:
```json
{
  "userId": "clx9876543210",
  "displayName": "opponent",
  "playerIndex": 1
}
```

---

#### player:left

Broadcast when a player disconnects.

**Payload**:
```json
{
  "userId": "clx9876543210",
  "displayName": "opponent",
  "playerIndex": 1,
  "canReconnect": true
}
```

---

#### player:ready

Broadcast when a player marks themselves as ready.

**Payload**:
```json
{
  "userId": "clx1234567890",
  "playerIndex": 0
}
```

---

#### error

Sent when an error occurs.

**Payload**:
```json
{
  "code": "INVALID_MOVE",
  "message": "It's not your turn",
  "details": {
    "currentTurn": 1,
    "yourTurn": 0
  }
}
```

**Error Codes**:
- `NOT_AUTHENTICATED`: Missing or invalid token
- `NOT_AUTHORIZED`: Not part of this game
- `GAME_NOT_FOUND`: Game doesn't exist
- `INVALID_MOVE`: Move validation failed
- `NOT_YOUR_TURN`: Player attempted move out of turn
- `GAME_FULL`: Attempted to join full game
- `RATE_LIMIT`: Too many requests

---

## Error Response Format

All HTTP errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is already in use",
    "details": {
      "field": "email"
    }
  }
}
```

## Rate Limiting

- **HTTP API**: 100 requests per minute per IP
- **WebSocket**: 10 actions per 10 seconds per connection
- **File Uploads**: 5 uploads per hour per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

## CORS Policy

- Allowed origins: `https://time-to-play.games`, `http://localhost:3000`
- Allowed methods: `GET, POST, PATCH, DELETE`
- Credentials: Allowed

---

This API provides a complete interface for all client interactions with the Time to Play platform.
