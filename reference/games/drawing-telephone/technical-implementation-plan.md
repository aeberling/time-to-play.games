# Telestrations Game - Technical Implementation Plan

## Executive Summary

This document outlines the complete technical architecture and implementation details for adding **Telestrations** (Drawing Telephone) to the Time to Play Games platform. Telestrations is a simultaneous party game where players alternate between drawing prompts and guessing drawings as "sketchbooks" rotate around the table.

**Key Differentiators from Existing Games:**
- **Simultaneous Play**: All players draw/guess at the same time (no turn-based waiting)
- **Canvas Drawing**: Requires HTML5 Canvas implementation
- **Image Storage**: Base64-encoded drawings stored in game state
- **Phase-Based Progression**: Game advances when all players complete their current task or timer expires
- **Rich Media Content**: Combines text prompts, drawings, and guesses in a storytelling format

---

## 1. Platform Architecture Overview

### Technology Stack
- **Frontend**: React + TypeScript + Inertia.js
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Backend**: Laravel 11 (PHP 8.x)
- **Database**: PostgreSQL with Eloquent ORM
- **Real-time**: Laravel Echo + Pusher WebSockets
- **Drawing**: HTML5 Canvas API

### Core Architecture Pattern
All games follow a **deterministic game engine** pattern:
1. Game logic is self-contained in a PHP Engine class
2. State is stored as serialized JSON in PostgreSQL
3. All moves are validated before application
4. Real-time updates via WebSocket broadcasts
5. Frontend is a pure view layer (no game logic)

---

## 2. Database Schema

### No New Tables Required
Telestrations uses the existing three-table structure:

#### `games` Table
```sql
- id: bigint (PK)
- game_type: string ('TELESTRATIONS')
- name: string (generated name like "Artistic Octopus")
- status: enum (WAITING → READY → IN_PROGRESS → COMPLETED)
- max_players: integer (4-8 recommended)
- timer_config: json (optional)
  {
    "drawing_time": 60,
    "guessing_time": 30,
    "auto_advance": true
  }
- game_options: json
  {
    "rounds": 3,
    "prompts_source": "random",
    "custom_prompts": [],
    "scoring_enabled": true
  }
- current_state: text (serialized game state JSON)
- winner_id: bigint (nullable)
- created_at: timestamp
- updated_at: timestamp
```

#### `game_players` Table
```sql
- id: bigint (PK)
- game_id: bigint (FK)
- user_id: bigint (FK)
- player_index: integer (0-7, determines sketchbook ownership)
- is_ready: boolean
- is_connected: boolean
- placement: integer (nullable, final ranking)
- score: integer (nullable, cumulative score)
```

#### `game_moves` Table
```sql
- id: bigint (PK)
- game_id: bigint (FK)
- user_id: bigint (FK)
- move_number: integer
- move_data: json
  Examples:
  {
    "action": "SUBMIT_DRAWING",
    "imageData": "data:image/png;base64,iVBORw0KG..."
  }
  {
    "action": "SUBMIT_GUESS",
    "guess": "A cat playing piano"
  }
  {
    "action": "CONTINUE_ROUND",
    "ready": true
  }
- created_at: timestamp
```

---

## 3. Backend Implementation

### 3.1 Game Engine: `TelestrationEngine.php`

**Location:** `/app/Games/Engines/TelestrationEngine.php`

**Implements:** `GameEngineInterface`

#### Required Methods

```php
interface GameEngineInterface {
    getGameType(): string;           // Returns 'TELESTRATIONS'
    getName(): string;                // Returns 'Telestrations'
    getConfig(): array;               // Min/max players, description, etc.
    initializeGame(array $players, array $options = []): array;
    validateMove(array $state, array $move, int $playerIndex): ValidationResult;
    applyMove(array $state, array $move, int $playerIndex): array;
    checkGameOver(array $state): array;
    getPlayerView(array $state, int $playerIndex): array;
    serializeState(array $state): string;
    deserializeState(string $state): array;
}
```

#### State Structure

```php
[
    'players' => [
        ['id' => 1, 'name' => 'Alice', 'avatar_url' => '...'],
        ['id' => 2, 'name' => 'Bob', 'avatar_url' => '...'],
        // ... up to 8 players
    ],
    'playerCount' => 6,

    // Game configuration
    'rounds' => 3,                    // Total rounds to play
    'currentRound' => 1,              // 1-indexed
    'currentTurn' => 1,               // 1-indexed (increments each rotation)
    'maxTurns' => 6,                  // Calculated: playerCount (one full rotation)
    'scoringEnabled' => true,

    // Phase management
    'phase' => 'INITIAL_PROMPT',      // See phase diagram below
    'turnDeadline' => '2025-01-15 10:30:00', // ISO timestamp

    // Sketchbook data structure (see detailed section below)
    'sketchbooks' => [
        0 => [  // Sketchbook owned by player 0
            'ownerId' => 0,
            'currentHolderId' => 0,  // Who currently has this sketchbook
            'pages' => [
                ['type' => 'prompt', 'authorId' => 0, 'text' => 'A dog riding a bicycle'],
                ['type' => 'drawing', 'artistId' => 1, 'imageData' => 'data:image/png;base64,...'],
                // ... more pages added each turn
            ]
        ],
        // ... one sketchbook per player
    ],

    // Tracking completion
    'playersReadyToContinue' => [false, false, true, false, false, false],
    'submittedThisTurn' => [false, false, true, false, false, false],

    // Scoring
    'scores' => [10, 5, 15, 0, 20, 8],

    // History and animations
    'lastAction' => [
        'type' => 'DRAWING_SUBMITTED',
        'playerIndex' => 2,
        'timestamp' => '2025-01-15T10:25:30Z'
    ],
    'playHistory' => [
        [
            'type' => 'GUESS_SUBMITTED',
            'playerIndex' => 3,
            'playerName' => 'Dave',
            'timestamp' => '2025-01-15T10:24:15Z',
            'sketchbookId' => 2
        ],
        // ...
    ],

    // Round results (populated during REVEAL phase)
    'roundResults' => [
        'sketchbookId' => 0,
        'originalPrompt' => 'A dog riding a bicycle',
        'finalGuess' => 'A cat on a motorcycle',
        'progression' => [
            ['type' => 'prompt', 'authorId' => 0, 'text' => 'A dog riding a bicycle'],
            ['type' => 'drawing', 'artistId' => 1, 'imageData' => '...'],
            ['type' => 'guess', 'guesserId' => 2, 'text' => 'A wolf on a bike'],
            ['type' => 'drawing', 'artistId' => 3, 'imageData' => '...'],
            // ...
        ],
        'matches' => [
            ['playerIndex' => 2, 'pointsAwarded' => 5, 'reason' => 'close_guess']
        ]
    ]
]
```

#### Phase Flow Diagram

```
INITIAL_PROMPT (Turn 0)
  ↓ (all players submit initial prompt)
DRAWING (Turn 1, 3, 5, ...)
  ↓ (all players submit drawing)
GUESSING (Turn 2, 4, 6, ...)
  ↓ (all players submit guess)
[Repeat DRAWING ↔ GUESSING until currentTurn === maxTurns]
  ↓
REVEAL (Review all sketchbooks)
  ↓ (all players click "Continue" or host clicks "Next Round")
ROUND_OVER
  ↓ (if currentRound < rounds)
INITIAL_PROMPT (next round)
  ↓ (if currentRound === rounds)
GAME_OVER
```

#### Sketchbook Rotation Logic

**Core Concept:** Each player owns a sketchbook. After each turn, sketchbooks rotate to the next player.

```php
// Example for 6 players after Turn 1:
Sketchbook 0: owned by Player 0, currently held by Player 1
Sketchbook 1: owned by Player 1, currently held by Player 2
Sketchbook 2: owned by Player 2, currently held by Player 3
...

// Rotation formula:
$newHolderId = ($sketchbook['currentHolderId'] + 1) % $playerCount;

// Each player receives the sketchbook from the previous player
// After a full round (playerCount turns), each sketchbook returns to owner
```

#### Move Validation Logic

```php
public function validateMove(array $state, array $move, int $playerIndex): ValidationResult
{
    $action = $move['action'] ?? null;

    // Phase-specific validation
    switch ($action) {
        case 'SUBMIT_PROMPT':
            if ($state['phase'] !== 'INITIAL_PROMPT') {
                return ValidationResult::invalid('Not in prompt phase');
            }
            if (empty($move['prompt']) || strlen($move['prompt']) > 100) {
                return ValidationResult::invalid('Invalid prompt length');
            }
            if ($state['submittedThisTurn'][$playerIndex]) {
                return ValidationResult::invalid('Already submitted');
            }
            break;

        case 'SUBMIT_DRAWING':
            if ($state['phase'] !== 'DRAWING') {
                return ValidationResult::invalid('Not in drawing phase');
            }
            if (empty($move['imageData'])) {
                return ValidationResult::invalid('No image data provided');
            }
            // Validate base64 format
            if (!preg_match('/^data:image\/(png|jpeg);base64,/', $move['imageData'])) {
                return ValidationResult::invalid('Invalid image format');
            }
            if ($state['submittedThisTurn'][$playerIndex]) {
                return ValidationResult::invalid('Already submitted');
            }
            break;

        case 'SUBMIT_GUESS':
            if ($state['phase'] !== 'GUESSING') {
                return ValidationResult::invalid('Not in guessing phase');
            }
            if (empty($move['guess']) || strlen($move['guess']) > 100) {
                return ValidationResult::invalid('Invalid guess length');
            }
            if ($state['submittedThisTurn'][$playerIndex]) {
                return ValidationResult::invalid('Already submitted');
            }
            break;

        case 'CONTINUE_ROUND':
            if ($state['phase'] !== 'ROUND_OVER') {
                return ValidationResult::invalid('Round not over');
            }
            break;

        default:
            return ValidationResult::invalid('Unknown action');
    }

    return ValidationResult::valid();
}
```

#### Move Application Logic

```php
public function applyMove(array $state, array $move, int $playerIndex): array
{
    $action = $move['action'];

    switch ($action) {
        case 'SUBMIT_PROMPT':
            // Add prompt to player's own sketchbook
            $state['sketchbooks'][$playerIndex]['pages'][] = [
                'type' => 'prompt',
                'authorId' => $playerIndex,
                'text' => $move['prompt'],
                'timestamp' => now()->toIso8601String()
            ];
            $state['submittedThisTurn'][$playerIndex] = true;
            break;

        case 'SUBMIT_DRAWING':
            // Find which sketchbook this player currently holds
            $sketchbookId = $this->findSketchbookHeldBy($state, $playerIndex);

            $state['sketchbooks'][$sketchbookId]['pages'][] = [
                'type' => 'drawing',
                'artistId' => $playerIndex,
                'imageData' => $move['imageData'],
                'timestamp' => now()->toIso8601String()
            ];
            $state['submittedThisTurn'][$playerIndex] = true;
            break;

        case 'SUBMIT_GUESS':
            $sketchbookId = $this->findSketchbookHeldBy($state, $playerIndex);

            $state['sketchbooks'][$sketchbookId]['pages'][] = [
                'type' => 'guess',
                'guesserId' => $playerIndex,
                'text' => $move['guess'],
                'timestamp' => now()->toIso8601String()
            ];
            $state['submittedThisTurn'][$playerIndex] = true;
            break;

        case 'CONTINUE_ROUND':
            $state['playersReadyToContinue'][$playerIndex] = true;
            break;
    }

    // Check if all players have submitted
    if ($this->allPlayersSubmitted($state)) {
        $state = $this->advancePhase($state);
    }

    // Update play history
    $state['playHistory'][] = [
        'type' => $action,
        'playerIndex' => $playerIndex,
        'playerName' => $state['players'][$playerIndex]['name'],
        'timestamp' => now()->toIso8601String()
    ];

    return $state;
}

private function advancePhase(array $state): array
{
    // Reset submission tracking
    $state['submittedThisTurn'] = array_fill(0, $state['playerCount'], false);

    switch ($state['phase']) {
        case 'INITIAL_PROMPT':
            // First rotation - everyone draws
            $state = $this->rotateSketchbooks($state);
            $state['phase'] = 'DRAWING';
            $state['currentTurn'] = 1;
            break;

        case 'DRAWING':
            $state = $this->rotateSketchbooks($state);
            $state['currentTurn']++;

            // Check if round complete
            if ($state['currentTurn'] > $state['maxTurns']) {
                $state['phase'] = 'REVEAL';
                $state = $this->calculateRoundScores($state);
            } else {
                $state['phase'] = 'GUESSING';
            }
            break;

        case 'GUESSING':
            $state = $this->rotateSketchbooks($state);
            $state['currentTurn']++;

            if ($state['currentTurn'] > $state['maxTurns']) {
                $state['phase'] = 'REVEAL';
                $state = $this->calculateRoundScores($state);
            } else {
                $state['phase'] = 'DRAWING';
            }
            break;

        case 'REVEAL':
            // Move to round over when all ready
            if ($this->allPlayersReady($state)) {
                $state['phase'] = 'ROUND_OVER';
            }
            break;

        case 'ROUND_OVER':
            if ($this->allPlayersReady($state)) {
                if ($state['currentRound'] >= $state['rounds']) {
                    $state['phase'] = 'GAME_OVER';
                } else {
                    // Start next round
                    $state = $this->startNextRound($state);
                }
            }
            break;
    }

    return $state;
}

private function rotateSketchbooks(array $state): array
{
    foreach ($state['sketchbooks'] as $id => &$sketchbook) {
        $sketchbook['currentHolderId'] =
            ($sketchbook['currentHolderId'] + 1) % $state['playerCount'];
    }
    return $state;
}
```

#### Scoring Logic

```php
private function calculateRoundScores(array $state): array
{
    if (!$state['scoringEnabled']) {
        return $state;
    }

    foreach ($state['sketchbooks'] as $sketchbookId => $sketchbook) {
        $pages = $sketchbook['pages'];
        $originalPrompt = $pages[0]['text'] ?? '';
        $finalGuess = end($pages)['text'] ?? '';

        // Award points for exact or close matches
        foreach ($pages as $page) {
            if ($page['type'] === 'guess') {
                $similarity = $this->calculateSimilarity(
                    $originalPrompt,
                    $page['text']
                );

                if ($similarity > 0.9) {
                    // Exact match: 10 points
                    $state['scores'][$page['guesserId']] += 10;
                } elseif ($similarity > 0.7) {
                    // Close match: 5 points
                    $state['scores'][$page['guesserId']] += 5;
                }
            }
        }

        // Bonus points for the original prompt setter if final guess matches
        if ($this->calculateSimilarity($originalPrompt, $finalGuess) > 0.8) {
            $state['scores'][$sketchbookId] += 15; // Owner bonus
        }
    }

    return $state;
}
```

### 3.2 Game Registry Registration

**Location:** `/app/Games/GameRegistry.php`

Add to constructor or registration method:

```php
$this->register(new TelestrationEngine());
```

### 3.3 API Routes

**No new routes required.** Uses existing game API endpoints:

```php
// routes/api.php (already exists)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/games', [GameController::class, 'store']);
    Route::get('/games/{game}', [GameController::class, 'show']);
    Route::get('/games/{game}/state', [GameController::class, 'state']);
    Route::post('/games/{game}/start', [GameController::class, 'start']);
    Route::delete('/games/{game}', [GameController::class, 'destroy']);

    Route::post('/games/{game}/join', [GamePlayerController::class, 'join']);
    Route::post('/games/{game}/leave', [GamePlayerController::class, 'leave']);
    Route::post('/games/{game}/ready', [GamePlayerController::class, 'ready']);
    Route::post('/games/{game}/connect', [GamePlayerController::class, 'connect']);

    Route::post('/games/{game}/move', [GameMoveController::class, 'store']);
});
```

### 3.4 WebSocket Events

**No new events required.** Uses existing Laravel broadcasting:

```php
// Broadcast when move is made
broadcast(new MoveMade($gameId, $playerIndex, $moveData, $newState));

// Broadcast when game state changes
broadcast(new GameStateUpdated($gameId, $newState));

// Broadcast when player joins/leaves
broadcast(new PlayerJoinedGame($gameId, $userId, $userName, $avatarUrl));
broadcast(new PlayerLeftGame($gameId, $userId, $userName));
```

---

## 4. Frontend Implementation

### 4.1 TypeScript Type Definitions

**Location:** `/resources/js/types/index.d.ts`

#### Add to GameType Union

```typescript
export type GameType = 'WAR' | 'SWOOP' | 'OH_HELL' | 'TELESTRATIONS';
```

#### Add TelestrationsGameState

```typescript
export interface TelestrationsPage {
    type: 'prompt' | 'drawing' | 'guess';
    authorId?: number;
    artistId?: number;
    guesserId?: number;
    text?: string;
    imageData?: string;
    timestamp: string;
}

export interface TelestrationsSketchbook {
    ownerId: number;
    currentHolderId: number;
    pages: TelestrationsPage[];
}

export interface TelestrationsGameState {
    players: Player[];
    playerCount: number;

    rounds: number;
    currentRound: number;
    currentTurn: number;
    maxTurns: number;
    scoringEnabled: boolean;

    phase: 'INITIAL_PROMPT' | 'DRAWING' | 'GUESSING' | 'REVEAL' | 'ROUND_OVER' | 'GAME_OVER';
    turnDeadline: string | null;

    sketchbooks: TelestrationsSketchbook[];

    playersReadyToContinue: boolean[];
    submittedThisTurn: boolean[];

    scores: number[];

    lastAction: {
        type: string;
        playerIndex?: number;
        timestamp: string;
    };

    playHistory?: Array<{
        type: string;
        playerIndex: number;
        playerName: string;
        timestamp: string;
        sketchbookId?: number;
    }>;

    roundResults?: {
        sketchbookId: number;
        originalPrompt: string;
        finalGuess: string;
        progression: TelestrationsPage[];
        matches: Array<{
            playerIndex: number;
            pointsAwarded: number;
            reason: string;
        }>;
    }[];
}
```

#### Add to GameState Union

```typescript
export type GameState =
    | WarGameState
    | SwoopGameState
    | OhHellGameState
    | TelestrationsGameState;
```

### 4.2 Main Game Component

**Location:** `/resources/js/Pages/Games/Telestrations.tsx`

#### Component Structure

```typescript
import { Head } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps, TelestrationsGameState } from '@/types/index';
import { useGameStore } from '@/store';

interface TelestrationsProps extends PageProps {
    gameId: number;
}

export default function Telestrations({ auth, gameId }: TelestrationsProps) {
    const {
        gameState,
        currentGame,
        playerIndex,
        isConnected,
        isReady,
        error,
        loading,
        fetchGameState,
        subscribeToGame,
        unsubscribeFromGame,
        toggleReady,
        makeMove,
        cancelGame,
    } = useGameStore();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [currentGuess, setCurrentGuess] = useState('');
    const [revealIndex, setRevealIndex] = useState(0); // For gallery viewing

    const teleState = gameState as TelestrationsGameState | null;

    // Canvas reference for drawing
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Initialize game on mount
    useEffect(() => {
        const loadGame = async () => {
            // Auto-join logic (same as Swoop)
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('join') === 'true') {
                // Join game, then fetch state
            }

            await fetchGameState(gameId, auth.user.id);
            subscribeToGame(gameId);
        };

        loadGame();

        return () => {
            unsubscribeFromGame(gameId);
        };
    }, [gameId, auth.user.id]);

    // ... component implementation (see sections below)
}
```

#### Phase-Specific Rendering

```typescript
const renderGameContent = () => {
    if (!teleState || playerIndex === null) return null;

    switch (teleState.phase) {
        case 'INITIAL_PROMPT':
            return <InitialPromptPhase />;
        case 'DRAWING':
            return <DrawingPhase />;
        case 'GUESSING':
            return <GuessingPhase />;
        case 'REVEAL':
            return <RevealPhase />;
        case 'ROUND_OVER':
            return <RoundOverPhase />;
        case 'GAME_OVER':
            return <GameOverPhase />;
        default:
            return <div>Unknown phase</div>;
    }
};
```

### 4.3 Drawing Canvas Component

**Location:** `/resources/js/Components/DrawingCanvas.tsx`

```typescript
import { useEffect, useRef, useState } from 'react';

interface DrawingCanvasProps {
    onComplete: (imageData: string) => void;
    width?: number;
    height?: number;
}

export default function DrawingCanvas({
    onComplete,
    width = 600,
    height = 400
}: DrawingCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [currentColor, setCurrentColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(2);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas background to white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        setContext(ctx);
    }, [width, height]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!context) return;

        setIsDrawing(true);
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        context.beginPath();
        context.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !context) return;

        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        context.strokeStyle = currentColor;
        context.lineWidth = lineWidth;
        context.lineCap = 'round';
        context.lineJoin = 'round';

        context.lineTo(x, y);
        context.stroke();
    };

    const stopDrawing = () => {
        if (!context) return;
        context.closePath();
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        if (!context) return;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
    };

    const submitDrawing = () => {
        if (!canvasRef.current) return;

        // Convert canvas to base64 PNG
        const imageData = canvasRef.current.toDataURL('image/png');
        onComplete(imageData);
    };

    return (
        <div className="drawing-canvas-container">
            <div className="canvas-tools mb-4 flex gap-4 items-center">
                <div className="color-picker">
                    <label className="mr-2">Color:</label>
                    <input
                        type="color"
                        value={currentColor}
                        onChange={(e) => setCurrentColor(e.target.value)}
                        className="w-12 h-8 cursor-pointer"
                    />
                </div>

                <div className="brush-size">
                    <label className="mr-2">Brush:</label>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        className="w-32"
                    />
                </div>

                <button
                    onClick={clearCanvas}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                >
                    Clear
                </button>
            </div>

            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="border-2 border-gray-300 bg-white cursor-crosshair"
            />

            <button
                onClick={submitDrawing}
                className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
                Submit Drawing
            </button>
        </div>
    );
}
```

**Touch Support Enhancement (Mobile):**

```typescript
// Add touch event handlers
const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvasRef.current?.dispatchEvent(mouseEvent);
};

const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvasRef.current?.dispatchEvent(mouseEvent);
};

// Add to canvas:
<canvas
    // ... existing props
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={stopDrawing}
/>
```

### 4.4 Phase Components

#### Initial Prompt Phase

```typescript
const InitialPromptPhase = () => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = async () => {
        if (prompt.trim().length === 0) return;

        try {
            await makeMove(gameId, {
                action: 'SUBMIT_PROMPT',
                prompt: prompt.trim()
            });
            setPrompt('');
        } catch (err) {
            console.error('Error submitting prompt:', err);
        }
    };

    const hasSubmitted = teleState.submittedThisTurn[playerIndex];

    return (
        <div className="initial-prompt-phase">
            <h2 className="text-2xl font-bold mb-4">
                Choose Your Starting Prompt
            </h2>

            {hasSubmitted ? (
                <div className="text-center">
                    <p className="text-lg">Waiting for other players...</p>
                    <div className="mt-4">
                        {teleState.players.map((player, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span>{player.name}</span>
                                <span>{teleState.submittedThisTurn[idx] ? '✓' : '...'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="max-w-lg mx-auto">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter a prompt to draw (e.g., 'A cat playing piano')"
                        maxLength={100}
                        className="w-full px-4 py-3 border rounded-lg"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={prompt.trim().length === 0}
                        className="mt-4 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700
                                   disabled:bg-gray-400 text-white rounded-lg"
                    >
                        Submit Prompt
                    </button>
                </div>
            )}
        </div>
    );
};
```

#### Drawing Phase

```typescript
const DrawingPhase = () => {
    const hasSubmitted = teleState.submittedThisTurn[playerIndex];

    // Find which sketchbook this player currently holds
    const currentSketchbook = teleState.sketchbooks.find(
        sb => sb.currentHolderId === playerIndex
    );

    // Get the last page (should be a prompt or guess)
    const lastPage = currentSketchbook?.pages[currentSketchbook.pages.length - 1];
    const promptText = lastPage?.text || 'Unknown prompt';

    const handleSubmitDrawing = async (imageData: string) => {
        try {
            await makeMove(gameId, {
                action: 'SUBMIT_DRAWING',
                imageData
            });
        } catch (err) {
            console.error('Error submitting drawing:', err);
        }
    };

    return (
        <div className="drawing-phase">
            <h2 className="text-2xl font-bold mb-2">Draw This:</h2>
            <p className="text-xl mb-6 font-semibold text-blue-600">
                "{promptText}"
            </p>

            {hasSubmitted ? (
                <div className="text-center">
                    <p className="text-lg">Waiting for other players to finish drawing...</p>
                    <ProgressIndicator
                        completed={teleState.submittedThisTurn.filter(Boolean).length}
                        total={teleState.playerCount}
                    />
                </div>
            ) : (
                <DrawingCanvas onComplete={handleSubmitDrawing} />
            )}
        </div>
    );
};
```

#### Guessing Phase

```typescript
const GuessingPhase = () => {
    const [guess, setGuess] = useState('');
    const hasSubmitted = teleState.submittedThisTurn[playerIndex];

    const currentSketchbook = teleState.sketchbooks.find(
        sb => sb.currentHolderId === playerIndex
    );

    const lastPage = currentSketchbook?.pages[currentSketchbook.pages.length - 1];
    const drawingImage = lastPage?.imageData || '';

    const handleSubmitGuess = async () => {
        if (guess.trim().length === 0) return;

        try {
            await makeMove(gameId, {
                action: 'SUBMIT_GUESS',
                guess: guess.trim()
            });
            setGuess('');
        } catch (err) {
            console.error('Error submitting guess:', err);
        }
    };

    return (
        <div className="guessing-phase">
            <h2 className="text-2xl font-bold mb-4">What is this drawing?</h2>

            <div className="mb-6">
                <img
                    src={drawingImage}
                    alt="Drawing to guess"
                    className="max-w-2xl mx-auto border-2 border-gray-300"
                />
            </div>

            {hasSubmitted ? (
                <div className="text-center">
                    <p className="text-lg">Waiting for other players...</p>
                    <ProgressIndicator
                        completed={teleState.submittedThisTurn.filter(Boolean).length}
                        total={teleState.playerCount}
                    />
                </div>
            ) : (
                <div className="max-w-lg mx-auto">
                    <input
                        type="text"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        placeholder="What do you think this is?"
                        maxLength={100}
                        className="w-full px-4 py-3 border rounded-lg"
                    />
                    <button
                        onClick={handleSubmitGuess}
                        disabled={guess.trim().length === 0}
                        className="mt-4 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700
                                   disabled:bg-gray-400 text-white rounded-lg"
                    >
                        Submit Guess
                    </button>
                </div>
            )}
        </div>
    );
};
```

#### Reveal Phase (Gallery View)

```typescript
const RevealPhase = () => {
    const [activeSketchbookId, setActiveSketchbookId] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);

    const currentSketchbook = teleState.sketchbooks[activeSketchbookId];
    const currentPage = currentSketchbook.pages[pageIndex];

    const nextPage = () => {
        if (pageIndex < currentSketchbook.pages.length - 1) {
            setPageIndex(pageIndex + 1);
        } else if (activeSketchbookId < teleState.sketchbooks.length - 1) {
            setActiveSketchbookId(activeSketchbookId + 1);
            setPageIndex(0);
        }
    };

    const prevPage = () => {
        if (pageIndex > 0) {
            setPageIndex(pageIndex - 1);
        } else if (activeSketchbookId > 0) {
            setActiveSketchbookId(activeSketchbookId - 1);
            setPageIndex(teleState.sketchbooks[activeSketchbookId - 1].pages.length - 1);
        }
    };

    return (
        <div className="reveal-phase">
            <h2 className="text-2xl font-bold mb-4">Round Results</h2>

            <div className="sketchbook-navigation mb-4">
                <button onClick={prevPage} disabled={activeSketchbookId === 0 && pageIndex === 0}>
                    Previous
                </button>
                <span>
                    Sketchbook {activeSketchbookId + 1} of {teleState.sketchbooks.length}
                    {' - '}
                    Page {pageIndex + 1} of {currentSketchbook.pages.length}
                </span>
                <button
                    onClick={nextPage}
                    disabled={
                        activeSketchbookId === teleState.sketchbooks.length - 1 &&
                        pageIndex === currentSketchbook.pages.length - 1
                    }
                >
                    Next
                </button>
            </div>

            <div className="page-content">
                {currentPage.type === 'prompt' && (
                    <div className="text-center">
                        <h3 className="text-xl font-semibold">Original Prompt</h3>
                        <p className="text-2xl mt-4">"{currentPage.text}"</p>
                        <p className="text-sm text-gray-600 mt-2">
                            by {teleState.players[currentPage.authorId].name}
                        </p>
                    </div>
                )}

                {currentPage.type === 'drawing' && (
                    <div className="text-center">
                        <h3 className="text-xl font-semibold">Drawing</h3>
                        <img
                            src={currentPage.imageData}
                            alt="Drawing"
                            className="max-w-2xl mx-auto mt-4 border-2 border-gray-300"
                        />
                        <p className="text-sm text-gray-600 mt-2">
                            by {teleState.players[currentPage.artistId].name}
                        </p>
                    </div>
                )}

                {currentPage.type === 'guess' && (
                    <div className="text-center">
                        <h3 className="text-xl font-semibold">Guess</h3>
                        <p className="text-2xl mt-4">"{currentPage.text}"</p>
                        <p className="text-sm text-gray-600 mt-2">
                            by {teleState.players[currentPage.guesserId].name}
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={() => makeMove(gameId, { action: 'CONTINUE_ROUND' })}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                    {teleState.playersReadyToContinue[playerIndex]
                        ? 'Waiting for others...'
                        : 'Continue to Next Round'}
                </button>
            </div>
        </div>
    );
};
```

### 4.5 Sidebar Component

Shows game info and player status (similar to Swoop pattern):

```typescript
const Sidebar = () => {
    return (
        <div className="sidebar bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Game Info</h3>

            <div className="game-info mb-4">
                <p>Round: {teleState.currentRound} / {teleState.rounds}</p>
                <p>Turn: {teleState.currentTurn} / {teleState.maxTurns}</p>
                <p>Phase: {teleState.phase}</p>
            </div>

            <h3 className="text-lg font-bold mb-2">Players</h3>
            <div className="players-list">
                {teleState.players.map((player, idx) => (
                    <div key={idx} className="player-card mb-2 p-2 bg-white rounded">
                        <div className="flex items-center gap-2">
                            {player.avatar && (
                                <img src={player.avatar} alt="" className="w-8 h-8 rounded-full" />
                            )}
                            <span className={idx === playerIndex ? 'font-bold' : ''}>
                                {player.name}
                            </span>
                        </div>
                        {teleState.scoringEnabled && (
                            <p className="text-sm text-gray-600">
                                Score: {teleState.scores[idx]}
                            </p>
                        )}
                        <div className="status-indicators text-xs">
                            {teleState.submittedThisTurn[idx] && (
                                <span className="text-green-600">✓ Submitted</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
```

---

## 5. Prompt Library System

### 5.1 Backend Prompt Storage

**Location:** `/app/Data/TelestrationsPrompts.php`

```php
<?php

namespace App\Data;

class TelestrationsPrompts
{
    public static function getCategories(): array
    {
        return [
            'animals' => 'Animals',
            'objects' => 'Objects',
            'actions' => 'Actions',
            'places' => 'Places',
            'people' => 'People',
            'abstract' => 'Abstract Concepts',
            'pop_culture' => 'Pop Culture',
        ];
    }

    public static function getPrompts(string $category = 'all', string $difficulty = 'all'): array
    {
        $allPrompts = [
            // Easy prompts
            ['text' => 'A dog', 'category' => 'animals', 'difficulty' => 'easy'],
            ['text' => 'A house', 'category' => 'places', 'difficulty' => 'easy'],
            ['text' => 'A car', 'category' => 'objects', 'difficulty' => 'easy'],

            // Medium prompts
            ['text' => 'A cat playing piano', 'category' => 'animals', 'difficulty' => 'medium'],
            ['text' => 'Someone riding a bicycle', 'category' => 'actions', 'difficulty' => 'medium'],
            ['text' => 'A tree house', 'category' => 'places', 'difficulty' => 'medium'],

            // Hard prompts
            ['text' => 'The feeling of nostalgia', 'category' => 'abstract', 'difficulty' => 'hard'],
            ['text' => 'Schrödinger\'s cat', 'category' => 'pop_culture', 'difficulty' => 'hard'],
            ['text' => 'Time travel paradox', 'category' => 'abstract', 'difficulty' => 'hard'],

            // ... add hundreds more
        ];

        return array_filter($allPrompts, function($prompt) use ($category, $difficulty) {
            $categoryMatch = $category === 'all' || $prompt['category'] === $category;
            $difficultyMatch = $difficulty === 'all' || $prompt['difficulty'] === $difficulty;
            return $categoryMatch && $difficultyMatch;
        });
    }

    public static function getRandomPrompts(int $count = 10, array $filters = []): array
    {
        $category = $filters['category'] ?? 'all';
        $difficulty = $filters['difficulty'] ?? 'all';

        $prompts = self::getPrompts($category, $difficulty);
        shuffle($prompts);

        return array_slice($prompts, 0, $count);
    }
}
```

### 5.2 Prompt Selection in Engine

```php
// In TelestrationEngine::initializeGame()

$promptsSource = $options['prompts_source'] ?? 'random';

if ($promptsSource === 'custom' && isset($options['custom_prompts'])) {
    // Use custom prompts provided by host
    $availablePrompts = $options['custom_prompts'];
} else {
    // Use random prompts from library
    $category = $options['prompt_category'] ?? 'all';
    $difficulty = $options['prompt_difficulty'] ?? 'medium';

    $availablePrompts = TelestrationsPrompts::getRandomPrompts(
        $playerCount * $rounds * 2, // Get extra prompts
        ['category' => $category, 'difficulty' => $difficulty]
    );
}

$state['availablePrompts'] = $availablePrompts;
```

---

## 6. Performance Considerations

### 6.1 Image Size Limits

**Problem:** Base64-encoded images can be large (100-500KB per drawing)

**Solutions:**

1. **Canvas Size Limits**
   ```typescript
   // Recommended: 600x400px canvas
   // Max: 800x600px
   ```

2. **Image Compression**
   ```typescript
   const compressImage = (dataUrl: string, maxSize: number = 100000): string => {
       // If image is already small, return as-is
       if (dataUrl.length < maxSize) return dataUrl;

       // Convert to blob, compress
       const img = new Image();
       img.src = dataUrl;

       const canvas = document.createElement('canvas');
       const ctx = canvas.getContext('2d');

       // Reduce dimensions by 50%
       canvas.width = img.width * 0.5;
       canvas.height = img.height * 0.5;

       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

       return canvas.toDataURL('image/jpeg', 0.7); // 70% quality
   };
   ```

3. **Database Considerations**
   - PostgreSQL `text` column can handle up to 1GB
   - Average game state: ~500KB (6 players, 6 turns, compressed images)
   - Well within limits

### 6.2 WebSocket Payload Limits

**Problem:** Pusher has a 10KB message limit

**Solution:** Already handled by platform - broadcasts trigger refetch, not state transmission

```php
// broadcast.php
broadcast(new MoveMade($gameId, $playerIndex, [], []));
// Frontend receives event, calls fetchGameState()
```

### 6.3 Concurrent Move Handling

**Problem:** Multiple players submitting simultaneously

**Solution:** Database row locking in GameService

```php
// GameService::makeMove()
$game = Game::lockForUpdate()->findOrFail($gameId);
// Only one transaction at a time can modify game state
```

---

## 7. Testing Strategy

### 7.1 Backend Unit Tests

**Location:** `/tests/Unit/Games/TelestrationEngineTest.php`

```php
class TelestrationEngineTest extends TestCase
{
    private TelestrationEngine $engine;

    protected function setUp(): void
    {
        parent::setUp();
        $this->engine = new TelestrationEngine();
    }

    public function test_initializes_game_with_correct_structure()
    {
        $players = [
            ['id' => 1, 'name' => 'Alice'],
            ['id' => 2, 'name' => 'Bob'],
            ['id' => 3, 'name' => 'Charlie'],
            ['id' => 4, 'name' => 'Diana'],
        ];

        $state = $this->engine->initializeGame($players, ['rounds' => 2]);

        $this->assertEquals('INITIAL_PROMPT', $state['phase']);
        $this->assertEquals(4, $state['playerCount']);
        $this->assertEquals(2, $state['rounds']);
        $this->assertEquals(1, $state['currentRound']);
        $this->assertCount(4, $state['sketchbooks']);
    }

    public function test_validates_prompt_submission()
    {
        $state = $this->getInitializedState(4);

        // Valid prompt
        $result = $this->engine->validateMove($state, [
            'action' => 'SUBMIT_PROMPT',
            'prompt' => 'A dancing elephant'
        ], 0);

        $this->assertTrue($result->isValid());

        // Invalid: empty prompt
        $result = $this->engine->validateMove($state, [
            'action' => 'SUBMIT_PROMPT',
            'prompt' => ''
        ], 0);

        $this->assertFalse($result->isValid());
    }

    public function test_sketchbook_rotation()
    {
        $state = $this->getInitializedState(4);

        // All players submit prompts
        for ($i = 0; $i < 4; $i++) {
            $state = $this->engine->applyMove($state, [
                'action' => 'SUBMIT_PROMPT',
                'prompt' => "Prompt $i"
            ], $i);
        }

        // Should advance to DRAWING phase and rotate
        $this->assertEquals('DRAWING', $state['phase']);

        // Each player should have next player's sketchbook
        $this->assertEquals(1, $state['sketchbooks'][0]['currentHolderId']);
        $this->assertEquals(2, $state['sketchbooks'][1]['currentHolderId']);
        $this->assertEquals(3, $state['sketchbooks'][2]['currentHolderId']);
        $this->assertEquals(0, $state['sketchbooks'][3]['currentHolderId']);
    }

    // ... more tests
}
```

### 7.2 Integration Tests

**Location:** `/tests/Feature/Games/TelestrationGameFlowTest.php`

```php
class TelestrationGameFlowTest extends TestCase
{
    public function test_complete_round_flow()
    {
        $users = User::factory()->count(4)->create();

        // Create game
        $game = Game::create([
            'game_type' => 'TELESTRATIONS',
            'status' => 'WAITING',
            'max_players' => 4,
            'game_options' => ['rounds' => 1]
        ]);

        // Add players
        foreach ($users as $index => $user) {
            GamePlayer::create([
                'game_id' => $game->id,
                'user_id' => $user->id,
                'player_index' => $index,
                'is_ready' => true,
            ]);
        }

        // Start game
        $gameService = app(GameService::class);
        $gameService->startGame($game->id);

        $game->refresh();
        $this->assertEquals('IN_PROGRESS', $game->status);

        // Submit prompts
        foreach ($users as $index => $user) {
            $response = $this->actingAs($user)->postJson(
                "/api/games/{$game->id}/move",
                ['move' => ['action' => 'SUBMIT_PROMPT', 'prompt' => "Prompt $index"]]
            );
            $response->assertStatus(200);
        }

        // Verify phase advanced to DRAWING
        $game->refresh();
        $state = json_decode($game->current_state, true);
        $this->assertEquals('DRAWING', $state['phase']);

        // Submit drawings (mock image data)
        foreach ($users as $user) {
            $response = $this->actingAs($user)->postJson(
                "/api/games/{$game->id}/move",
                ['move' => [
                    'action' => 'SUBMIT_DRAWING',
                    'imageData' => 'data:image/png;base64,iVBORw0KGgoAAAANS...'
                ]]
            );
            $response->assertStatus(200);
        }

        // Continue through all turns...
    }
}
```

### 7.3 Frontend Component Tests

**Location:** `/resources/js/Pages/Games/__tests__/Telestrations.test.tsx`

Use React Testing Library + Vitest (or Jest):

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import DrawingCanvas from '@/Components/DrawingCanvas';

describe('DrawingCanvas', () => {
    it('renders canvas element', () => {
        const onComplete = vi.fn();
        render(<DrawingCanvas onComplete={onComplete} />);

        const canvas = screen.getByRole('img'); // Canvas has implicit role
        expect(canvas).toBeInTheDocument();
    });

    it('calls onComplete with image data when submitted', () => {
        const onComplete = vi.fn();
        render(<DrawingCanvas onComplete={onComplete} />);

        const submitButton = screen.getByText('Submit Drawing');
        fireEvent.click(submitButton);

        expect(onComplete).toHaveBeenCalledWith(
            expect.stringContaining('data:image/png;base64')
        );
    });
});
```

---

## 8. Deployment Checklist

### 8.1 Pre-Deployment

- [ ] Run full test suite: `php artisan test`
- [ ] Build frontend assets: `npm run build`
- [ ] Clear caches: `php artisan cache:clear`
- [ ] Verify migrations (none needed for Telestrations)
- [ ] Test WebSocket connectivity in staging

### 8.2 Production Deploy

- [ ] Deploy backend code via CI/CD
- [ ] Deploy frontend assets to CDN
- [ ] Verify Echo server is running
- [ ] Smoke test: Create game, join, play through one round
- [ ] Monitor error logs for first 24 hours

### 8.3 Monitoring

**Key Metrics:**
- Average game state size (should be < 500KB)
- Move validation failure rate
- WebSocket connection stability
- Page load time for canvas-heavy pages

**Logging:**
```php
// Add to TelestrationEngine
\Log::info('Telestrations game initialized', [
    'player_count' => $playerCount,
    'rounds' => $rounds,
    'state_size' => strlen(json_encode($state))
]);
```

---

## 9. Future Enhancements

### Phase 2 Features (Post-MVP)

1. **Prompt Voting System**
   - Players vote on favorite prompts before starting
   - Community-contributed prompts

2. **Advanced Drawing Tools**
   - Eraser tool
   - Fill bucket
   - Undo/redo
   - Shape tools (circle, rectangle)

3. **Replay System**
   - Save completed games
   - Animated playback of drawing process
   - Share sketchbooks on social media

4. **Accessibility Features**
   - Text-to-speech for prompts
   - High contrast mode
   - Keyboard shortcuts for canvas

5. **Mobile App**
   - Native iOS/Android apps
   - Better touch drawing experience
   - Push notifications for turn reminders

6. **Spectator Mode**
   - Allow non-players to watch games
   - Live updates during reveal phase

---

## 10. Architecture Diagrams

### Game Flow Sequence

```
┌─────────┐         ┌─────────┐         ┌──────────┐         ┌─────────┐
│ Player  │         │ Frontend│         │  Laravel │         │ Database│
│         │         │  (React)│         │  Backend │         │         │
└────┬────┘         └────┬────┘         └────┬─────┘         └────┬────┘
     │                   │                    │                    │
     │  1. Submit Drawing│                    │                    │
     ├──────────────────>│                    │                    │
     │                   │ 2. POST /api/games/{id}/move           │
     │                   ├───────────────────>│                    │
     │                   │                    │ 3. Lock row        │
     │                   │                    ├───────────────────>│
     │                   │                    │ 4. validateMove()  │
     │                   │                    │ 5. applyMove()     │
     │                   │                    │ 6. Save state      │
     │                   │                    ├───────────────────>│
     │                   │                    │                    │
     │                   │                    │ 7. Broadcast event │
     │                   │ <───────────────── │                    │
     │                   │ 8. WebSocket: MoveMade                 │
     │                   │                    │                    │
     │                   │ 9. fetchGameState()│                    │
     │                   ├───────────────────>│                    │
     │                   │                    │ 10. Load state     │
     │                   │                    ├───────────────────>│
     │                   │ 11. Return state   │                    │
     │                   │ <──────────────────│                    │
     │ 12. UI Update     │                    │                    │
     │ <─────────────────┤                    │                    │
     │                   │                    │                    │
```

### Sketchbook Data Structure

```
Game State
├── sketchbooks: [
│   ├── Sketchbook 0 (owned by Player 0)
│   │   ├── ownerId: 0
│   │   ├── currentHolderId: 2  (after 2 rotations)
│   │   └── pages: [
│   │       ├── Page 0: {type: 'prompt', authorId: 0, text: 'A dog'}
│   │       ├── Page 1: {type: 'drawing', artistId: 1, imageData: '...'}
│   │       └── Page 2: {type: 'guess', guesserId: 2, text: 'A wolf'}
│   │       ]
│   │
│   ├── Sketchbook 1 (owned by Player 1)
│   │   ├── ownerId: 1
│   │   ├── currentHolderId: 3
│   │   └── pages: [...]
│   │
│   └── ...
│   ]
```

---

## 11. Code Style Guidelines

### Follow Existing Platform Patterns

1. **PHP (Backend)**
   - PSR-12 coding standard
   - Type hints for all method parameters and return types
   - Comprehensive PHPDoc blocks
   - Descriptive variable names (`$sketchbookId`, not `$sid`)

2. **TypeScript (Frontend)**
   - Strict mode enabled
   - Explicit types (avoid `any`)
   - Functional components with hooks
   - Props interfaces defined per component

3. **Database**
   - Snake_case for column names
   - Use Eloquent relationships
   - No raw SQL unless absolutely necessary

4. **Testing**
   - AAA pattern (Arrange, Act, Assert)
   - Descriptive test names: `test_validates_prompt_submission_with_empty_text()`
   - One assertion per logical concept

---

## 12. Security Considerations

### Input Validation

1. **Prompt Text**
   ```php
   // Max length: 100 characters
   // Strip HTML tags
   // No profanity filter (rely on moderation)
   ```

2. **Image Data**
   ```php
   // Validate base64 format
   // Check MIME type (PNG or JPEG only)
   // Size limit: 500KB per image
   ```

3. **Player Authorization**
   ```php
   // Verify player is in game before accepting moves
   // Prevent spectators from submitting
   ```

### XSS Prevention

- All user text sanitized before display
- Use React's built-in escaping for `{variable}`
- Images as `<img src={data} />` (React handles safely)

### Rate Limiting

```php
// routes/api.php
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    // 60 requests per minute per user
});
```

---

## 13. Accessibility (WCAG 2.1 AA)

### Canvas Accessibility

```typescript
<canvas
    ref={canvasRef}
    role="img"
    aria-label="Drawing canvas"
    // Add keyboard controls
    tabIndex={0}
/>
```

### Color Contrast

- Use Tailwind's default palette (AA compliant)
- Text on backgrounds: minimum 4.5:1 ratio

### Screen Reader Support

```typescript
<div role="status" aria-live="polite">
    {hasSubmitted ? 'Drawing submitted. Waiting for others.' : 'Draw your response'}
</div>
```

---

## 14. Conclusion

This technical plan provides a comprehensive blueprint for implementing Telestrations on the Time to Play Games platform. The implementation leverages existing architecture patterns, requires no database migrations, and integrates seamlessly with the established game engine framework.

**Key Success Factors:**
1. Follow existing patterns (Swoop, Oh Hell) for consistency
2. Implement robust validation at every step
3. Optimize image handling for performance
4. Ensure mobile-friendly canvas drawing
5. Comprehensive testing before deployment

**Estimated Development Time:**
- Backend Engine: 2-3 days
- Frontend Components: 3-4 days
- Drawing Canvas: 1-2 days
- Testing & Bug Fixes: 2-3 days
- **Total: ~10-14 days** (single developer)

With this plan, Telestrations will become a flagship party game on the platform, offering unique creative gameplay that distinguishes it from the card-based games.
