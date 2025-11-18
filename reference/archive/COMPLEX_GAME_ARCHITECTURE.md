# Complex Board Game Architecture Plan

## Overview
This document outlines a modular, extensible architecture for implementing complex board games (e.g., Chess, Lords of Waterdeep, Settlers of Catan) in the time-to-play.games platform. The current simple games (Swoop, Oh Hell!) have all logic in single TSX files, which won't scale for games with multiple components, visual assets, and complex rules.

---

## Current Architecture Analysis

### Backend (Laravel/PHP)
```
app/Games/
├── Contracts/
│   └── GameEngineInterface.php       # Interface all games must implement
├── Engines/
│   ├── SwoopEngine.php               # Single-file game engine
│   ├── OhHellEngine.php              # Single-file game engine
│   └── WarEngine.php                 # Single-file game engine
├── ValueObjects/
│   ├── Card.php                      # Shared card value object
│   ├── Deck.php                      # Shared deck value object
│   └── ValidationResult.php          # Shared validation result
└── GameRegistry.php                  # Singleton registry for all games
```

**Strengths:**
- Clean interface contract (GameEngineInterface)
- Centralized registry pattern
- Shared value objects for common game elements
- State serialization/deserialization built-in

**Limitations for Complex Games:**
- Single-file engines become unwieldy (1000+ lines for complex games)
- No organization for game-specific assets
- Limited modularity for complex rule sets

### Frontend (React/TypeScript)
```
resources/js/Pages/Games/
├── Swoop.tsx                         # ~1200 lines - all logic in one file
├── OhHell.tsx                        # ~720 lines - all logic in one file
└── Lobby.tsx                         # Game selection
```

**Limitations:**
- All UI, game logic, and rendering in single file
- No asset organization
- No component reusability
- Hard to test individual features

---

## Proposed Architecture for Complex Games

### 1. Backend Structure (Laravel/PHP)

#### Folder Organization
```
app/Games/
├── Contracts/
│   ├── GameEngineInterface.php           # Core interface (unchanged)
│   └── GameComponentInterface.php        # NEW: For modular game components
│
├── ValueObjects/                          # Shared across all games
│   ├── Card.php
│   ├── Deck.php
│   ├── ValidationResult.php
│   └── Position.php                      # NEW: For grid-based games
│
├── Engines/
│   ├── SwoopEngine.php                   # Simple games stay as-is
│   ├── OhHellEngine.php
│   │
│   ├── Chess/                            # NEW: Complex game folder structure
│   │   ├── ChessEngine.php               # Main engine (implements GameEngineInterface)
│   │   ├── Components/                   # Modular game components
│   │   │   ├── Board.php                 # Chess board representation
│   │   │   ├── Pieces/
│   │   │   │   ├── Piece.php             # Abstract piece class
│   │   │   │   ├── Pawn.php              # Pawn-specific movement/rules
│   │   │   │   ├── Knight.php
│   │   │   │   ├── Bishop.php
│   │   │   │   ├── Rook.php
│   │   │   │   ├── Queen.php
│   │   │   │   └── King.php
│   │   │   ├── MoveValidator.php         # Move validation logic
│   │   │   ├── CheckDetector.php         # Check/checkmate detection
│   │   │   └── CastlingRules.php         # Special move rules
│   │   ├── ValueObjects/                 # Chess-specific value objects
│   │   │   ├── ChessMove.php
│   │   │   ├── ChessPosition.php
│   │   │   └── ChessColor.php
│   │   └── Config/
│   │       └── chess_config.php          # Game configuration
│   │
│   └── LordsOfWaterdeep/                 # NEW: Another complex game example
│       ├── LordsOfWaterdeepEngine.php    # Main engine
│       ├── Components/
│       │   ├── Board.php                 # Game board
│       │   ├── BuildingManager.php       # Building placement/ownership
│       │   ├── QuestManager.php          # Quest card management
│       │   ├── AgentManager.php          # Worker placement logic
│       │   ├── ResourceManager.php       # Resource tracking
│       │   └── LordCardManager.php       # Secret lord cards
│       ├── ValueObjects/
│       │   ├── Building.php
│       │   ├── Quest.php
│       │   ├── Agent.php
│       │   ├── Resource.php
│       │   └── LordCard.php
│       ├── Data/                         # Game data files
│       │   ├── quests.json               # Quest card definitions
│       │   ├── buildings.json            # Building definitions
│       │   ├── lords.json                # Lord card definitions
│       │   └── intrigue_cards.json       # Intrigue card definitions
│       └── Config/
│           └── lords_of_waterdeep_config.php
│
└── GameRegistry.php                      # Unchanged
```

#### Key Backend Principles

1. **Main Engine as Orchestrator**
   - `ChessEngine.php` implements `GameEngineInterface`
   - Delegates to specialized components
   - Coordinates state management
   - Handles serialization/deserialization

2. **Component-Based Architecture**
   - Each component handles a specific game aspect
   - Components are testable in isolation
   - Components can be reused across similar games

3. **Data-Driven Configuration**
   - JSON files for game content (quests, cards, buildings)
   - Separates game data from game logic
   - Easy to balance/modify without code changes

4. **Value Objects for Type Safety**
   - Game-specific value objects (ChessMove, Building, Quest)
   - Immutable where possible
   - Self-validating

#### Example: ChessEngine.php Structure
```php
<?php

namespace App\Games\Engines\Chess;

use App\Games\Contracts\GameEngineInterface;
use App\Games\Engines\Chess\Components\Board;
use App\Games\Engines\Chess\Components\MoveValidator;
use App\Games\Engines\Chess\Components\CheckDetector;
use App\Games\ValueObjects\ValidationResult;

class ChessEngine implements GameEngineInterface
{
    private Board $board;
    private MoveValidator $moveValidator;
    private CheckDetector $checkDetector;

    public function __construct()
    {
        $this->board = new Board();
        $this->moveValidator = new MoveValidator($this->board);
        $this->checkDetector = new CheckDetector($this->board);
    }

    public function getGameType(): string
    {
        return 'CHESS';
    }

    public function initializeGame(array $players, array $options = []): array
    {
        return [
            'board' => $this->board->getInitialState(),
            'currentPlayer' => 0, // White
            'moveHistory' => [],
            'capturedPieces' => ['white' => [], 'black' => []],
            'castlingRights' => [
                'white' => ['kingside' => true, 'queenside' => true],
                'black' => ['kingside' => true, 'queenside' => true]
            ],
            'enPassantTarget' => null,
            'halfMoveClock' => 0, // For 50-move rule
            'fullMoveNumber' => 1,
        ];
    }

    public function validateMove(array $state, array $move, int $playerIndex): ValidationResult
    {
        return $this->moveValidator->validate($state, $move, $playerIndex);
    }

    public function applyMove(array $state, array $move, int $playerIndex): array
    {
        $newState = $this->board->applyMove($state, $move);
        $newState = $this->checkDetector->updateCheckStatus($newState);
        return $newState;
    }

    // ... other interface methods
}
```

---

### 2. Frontend Structure (React/TypeScript)

#### Folder Organization
```
resources/js/Pages/Games/
├── Swoop.tsx                             # Simple games stay as-is
├── OhHell.tsx
├── Lobby.tsx
│
├── Chess/                                # NEW: Complex game folder
│   ├── index.tsx                         # Main game component (router entry)
│   ├── ChessGame.tsx                     # Game container/orchestrator
│   │
│   ├── components/                       # Game-specific UI components
│   │   ├── ChessBoard/
│   │   │   ├── ChessBoard.tsx            # Board rendering
│   │   │   ├── Square.tsx                # Individual square
│   │   │   ├── Piece.tsx                 # Piece rendering
│   │   │   └── index.ts                  # Barrel export
│   │   ├── MoveHistory/
│   │   │   ├── MoveHistory.tsx           # Move list display
│   │   │   ├── MoveNotation.tsx          # Chess notation formatter
│   │   │   └── index.ts
│   │   ├── CapturedPieces/
│   │   │   ├── CapturedPieces.tsx        # Captured pieces display
│   │   │   └── index.ts
│   │   ├── GameInfo/
│   │   │   ├── GameInfo.tsx              # Timer, player info
│   │   │   ├── PlayerPanel.tsx
│   │   │   └── index.ts
│   │   └── PromotionDialog/
│   │       ├── PromotionDialog.tsx       # Pawn promotion UI
│   │       └── index.ts
│   │
│   ├── hooks/                            # Game-specific hooks
│   │   ├── useChessGame.ts               # Main game logic hook
│   │   ├── useBoardInteraction.ts        # Drag/drop, click handling
│   │   ├── useMoveValidation.ts          # Client-side move validation
│   │   └── useChessNotation.ts           # Chess notation utilities
│   │
│   ├── utils/                            # Chess utility functions
│   │   ├── moveCalculation.ts            # Legal move calculation
│   │   ├── notation.ts                   # Algebraic notation
│   │   ├── boardHelpers.ts               # Position conversion, etc.
│   │   └── constants.ts                  # Chess constants
│   │
│   ├── types/                            # TypeScript types
│   │   ├── ChessTypes.ts                 # Chess-specific types
│   │   └── index.ts
│   │
│   └── assets/                           # Game assets
│       ├── pieces/                       # Piece SVGs
│       │   ├── white/
│       │   │   ├── king.svg
│       │   │   ├── queen.svg
│       │   │   ├── rook.svg
│       │   │   ├── bishop.svg
│       │   │   ├── knight.svg
│       │   │   └── pawn.svg
│       │   └── black/
│       │       └── [same as white]
│       ├── sounds/                       # Sound effects
│       │   ├── move.mp3
│       │   ├── capture.mp3
│       │   ├── check.mp3
│       │   └── castle.mp3
│       └── styles/
│           └── chess.module.css          # Chess-specific styles
│
└── LordsOfWaterdeep/                     # Another complex game example
    ├── index.tsx
    ├── LordsOfWaterdeepGame.tsx
    ├── components/
    │   ├── GameBoard/
    │   │   ├── GameBoard.tsx             # Main board
    │   │   ├── Building.tsx              # Building component
    │   │   ├── BuildingSpace.tsx         # Building placement area
    │   │   └── index.ts
    │   ├── PlayerArea/
    │   │   ├── PlayerArea.tsx            # Player's personal area
    │   │   ├── AgentPool.tsx             # Available agents
    │   │   ├── ResourcePool.tsx          # Player resources
    │   │   ├── CompletedQuests.tsx       # Completed quest display
    │   │   └── index.ts
    │   ├── QuestArea/
    │   │   ├── QuestArea.tsx             # Quest display area
    │   │   ├── QuestCard.tsx             # Individual quest card
    │   │   ├── QuestTrack.tsx            # Quest card supply
    │   │   └── index.ts
    │   ├── BuildingCards/
    │   │   ├── BuildingCard.tsx          # Building card display
    │   │   └── index.ts
    │   └── IntrigueCards/
    │       ├── IntrigueCard.tsx
    │       └── index.ts
    │
    ├── hooks/
    │   ├── useLordsGame.ts               # Main game hook
    │   ├── useAgentPlacement.ts          # Worker placement logic
    │   ├── useQuestCompletion.ts         # Quest completion logic
    │   ├── useResourceManagement.ts      # Resource tracking
    │   └── useBuildingPurchase.ts        # Building purchase logic
    │
    ├── utils/
    │   ├── questHelpers.ts               # Quest-related utilities
    │   ├── resourceCalculation.ts        # Resource calculations
    │   ├── scoringHelpers.ts             # Victory point calculation
    │   └── constants.ts                  # Game constants
    │
    ├── types/
    │   └── LordsTypes.ts
    │
    └── assets/
        ├── images/
        │   ├── board/
        │   │   └── waterdeep_board.svg   # Main board image
        │   ├── buildings/                # Building card images
        │   ├── quests/                   # Quest card images
        │   ├── lords/                    # Lord card images
        │   └── resources/                # Resource token images
        │       ├── gold.svg
        │       ├── fighter.svg
        │       ├── cleric.svg
        │       ├── rogue.svg
        │       └── wizard.svg
        ├── sounds/
        │   ├── agent_place.mp3
        │   ├── quest_complete.mp3
        │   ├── building_purchase.mp3
        │   └── resource_gain.mp3
        └── styles/
            └── lords.module.css
```

#### Key Frontend Principles

1. **Component Composition**
   - Main game component orchestrates child components
   - Each component has single responsibility
   - Reusable components exported via index.ts

2. **Custom Hooks for Logic**
   - Separate UI from game logic
   - Hooks handle state management, API calls, validation
   - Testable in isolation

3. **Type Safety**
   - Game-specific TypeScript types
   - Strict typing for game state, moves, components
   - Catch errors at compile time

4. **Asset Organization**
   - All game assets in dedicated folders
   - Easy to swap themes/styles
   - Lazy loading for large assets

5. **Performance Optimization**
   - Code splitting per game
   - Lazy load game components
   - Memoization for expensive renders

#### Example: Chess Component Structure

**index.tsx** (Route entry point)
```typescript
import { lazy } from 'react';

// Lazy load the game for code splitting
export const ChessGame = lazy(() => import('./ChessGame'));
```

**ChessGame.tsx** (Main container)
```typescript
import { Head } from '@inertiajs/react';
import { useChessGame } from './hooks/useChessGame';
import { ChessBoard } from './components/ChessBoard';
import { MoveHistory } from './components/MoveHistory';
import { CapturedPieces } from './components/CapturedPieces';
import { GameInfo } from './components/GameInfo';
import { PromotionDialog } from './components/PromotionDialog';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps } from '@/types';

interface ChessProps extends PageProps {
    gameId: number;
}

export default function ChessGame({ auth, gameId }: ChessProps) {
    const {
        gameState,
        selectedSquare,
        legalMoves,
        isMyTurn,
        showPromotion,
        handleSquareClick,
        handlePromotion,
        handleResign,
    } = useChessGame(gameId);

    return (
        <AuthenticatedLayout>
            <Head title="Chess" />

            <div className="chess-game-container">
                <div className="main-board-area">
                    <GameInfo
                        players={gameState.players}
                        currentPlayer={gameState.currentPlayer}
                        timer={gameState.timer}
                    />

                    <ChessBoard
                        board={gameState.board}
                        selectedSquare={selectedSquare}
                        legalMoves={legalMoves}
                        onSquareClick={handleSquareClick}
                        isMyTurn={isMyTurn}
                    />
                </div>

                <aside className="game-sidebar">
                    <CapturedPieces
                        white={gameState.capturedPieces.white}
                        black={gameState.capturedPieces.black}
                    />

                    <MoveHistory
                        moves={gameState.moveHistory}
                        currentMove={gameState.currentMove}
                    />
                </aside>

                {showPromotion && (
                    <PromotionDialog
                        onSelect={handlePromotion}
                        color={gameState.currentPlayer === 0 ? 'white' : 'black'}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
```

**useChessGame.ts** (Main game hook)
```typescript
import { useState, useEffect } from 'react';
import { useGameStore } from '@/store';
import type { ChessGameState, ChessMove } from '../types';

export function useChessGame(gameId: number) {
    const {
        gameState,
        fetchGameState,
        subscribeToGame,
        unsubscribeFromGame,
        makeMove,
    } = useGameStore();

    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    const [legalMoves, setLegalMoves] = useState<string[]>([]);
    const [showPromotion, setShowPromotion] = useState(false);

    const chessState = gameState as ChessGameState | null;

    useEffect(() => {
        fetchGameState(gameId);
        subscribeToGame(gameId);
        return () => unsubscribeFromGame(gameId);
    }, [gameId]);

    const handleSquareClick = (square: string) => {
        // Game logic here
    };

    const handlePromotion = (pieceType: string) => {
        // Promotion logic here
    };

    return {
        gameState: chessState,
        selectedSquare,
        legalMoves,
        isMyTurn: chessState?.currentPlayer === chessState?.playerIndex,
        showPromotion,
        handleSquareClick,
        handlePromotion,
    };
}
```

---

## 3. Shared Infrastructure

### Asset Management
```
public/assets/games/                     # NEW: Public game assets
├── chess/
│   ├── pieces/                          # Copied from resources during build
│   └── sounds/
├── lords-of-waterdeep/
│   ├── board/
│   ├── cards/
│   └── tokens/
└── shared/                              # Shared across games
    └── ui/
        ├── card-back.svg
        └── loading.svg
```

### Build Configuration (Vite)
```javascript
// vite.config.js
export default {
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Split each game into its own chunk
                    'chess': ['./resources/js/Pages/Games/Chess/index.tsx'],
                    'lords-of-waterdeep': ['./resources/js/Pages/Games/LordsOfWaterdeep/index.tsx'],
                    'swoop': ['./resources/js/Pages/Games/Swoop.tsx'],
                }
            }
        }
    }
}
```

### Routing
```php
// routes/web.php
Route::get('/games/chess/{gameId}', function ($gameId) {
    return Inertia::render('Games/Chess/index', [
        'gameId' => $gameId,
    ]);
})->middleware('auth');

Route::get('/games/lords-of-waterdeep/{gameId}', function ($gameId) {
    return Inertia::render('Games/LordsOfWaterdeep/index', [
        'gameId' => $gameId,
    ]);
})->middleware('auth');
```

---

## 4. Testing Strategy

### Backend Tests
```
tests/Unit/Games/
├── Chess/
│   ├── ChessEngineTest.php
│   ├── Components/
│   │   ├── BoardTest.php
│   │   ├── Pieces/
│   │   │   ├── PawnTest.php
│   │   │   ├── KnightTest.php
│   │   │   └── ...
│   │   ├── MoveValidatorTest.php
│   │   └── CheckDetectorTest.php
│   └── ValueObjects/
│       └── ChessMoveTest.php
│
└── LordsOfWaterdeep/
    └── ...
```

### Frontend Tests
```
resources/js/__tests__/Games/
├── Chess/
│   ├── ChessGame.test.tsx
│   ├── components/
│   │   ├── ChessBoard.test.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useChessGame.test.ts
│   │   └── ...
│   └── utils/
│       ├── moveCalculation.test.ts
│       └── ...
│
└── LordsOfWaterdeep/
    └── ...
```

---

## 5. Migration Strategy

### Phase 1: Infrastructure Setup
1. Create folder structure for one complex game (e.g., Chess)
2. Set up build configuration for code splitting
3. Create base components and hooks
4. Implement asset loading system

### Phase 2: Backend Implementation
1. Create `Chess/` folder in `app/Games/Engines/`
2. Implement `ChessEngine.php` (basic structure)
3. Create component classes (Board, Pieces, etc.)
4. Implement value objects
5. Write unit tests

### Phase 3: Frontend Implementation
1. Create `Chess/` folder in `resources/js/Pages/Games/`
2. Build UI components
3. Implement custom hooks
4. Add assets (pieces, sounds)
5. Write component tests

### Phase 4: Integration
1. Update GameRegistry
2. Add routes
3. Update Lobby to show new game
4. End-to-end testing
5. Performance optimization

### Phase 5: Documentation & Templates
1. Document architecture patterns
2. Create game template/boilerplate
3. Write developer guide for adding new games
4. Create asset guidelines

---

## 6. Example Implementation Checklist (Chess)

### Backend Checklist
- [ ] Create `app/Games/Engines/Chess/` directory
- [ ] Implement `ChessEngine.php` with GameEngineInterface
- [ ] Create `Board.php` component
- [ ] Implement all piece classes (Pawn, Knight, Bishop, Rook, Queen, King)
- [ ] Create `MoveValidator.php` component
- [ ] Create `CheckDetector.php` component
- [ ] Implement chess-specific value objects
- [ ] Add chess configuration file
- [ ] Write unit tests for all components
- [ ] Register Chess engine in GameRegistry

### Frontend Checklist
- [ ] Create `resources/js/Pages/Games/Chess/` directory
- [ ] Create `index.tsx` entry point with lazy loading
- [ ] Implement `ChessGame.tsx` main component
- [ ] Build `ChessBoard` component with 8x8 grid
- [ ] Create `Square` component
- [ ] Create `Piece` component
- [ ] Implement `MoveHistory` component
- [ ] Implement `CapturedPieces` component
- [ ] Implement `GameInfo` component
- [ ] Implement `PromotionDialog` component
- [ ] Create `useChessGame` hook
- [ ] Create `useBoardInteraction` hook
- [ ] Implement chess utility functions
- [ ] Add TypeScript types
- [ ] Add piece SVG assets
- [ ] Add sound effects
- [ ] Add CSS styles
- [ ] Write component tests
- [ ] Add route in `routes/web.php`
- [ ] Update Lobby to include Chess

---

## 7. Benefits of This Architecture

### Maintainability
- **Separation of Concerns**: UI, logic, and data are cleanly separated
- **Single Responsibility**: Each file/component has one clear purpose
- **Easy to Navigate**: Consistent structure across all complex games

### Scalability
- **Code Splitting**: Games load independently, reducing bundle size
- **Reusability**: Components can be shared across similar games
- **Modular**: Add new features without touching existing code

### Developer Experience
- **Type Safety**: TypeScript catches errors at compile time
- **Testing**: Each component/hook/utility is independently testable
- **Documentation**: Structure is self-documenting

### Performance
- **Lazy Loading**: Games load only when needed
- **Asset Optimization**: Images/sounds loaded on demand
- **Memoization**: Expensive calculations cached appropriately

### Flexibility
- **Themeable**: Easy to swap assets/styles
- **Configurable**: Game behavior controlled by config files
- **Extensible**: New game modes/variants easy to add

---

## 8. File Naming Conventions

### Backend (PHP)
- **Engine Files**: `{GameName}Engine.php` (PascalCase)
- **Component Files**: `{ComponentName}.php` (PascalCase)
- **Value Objects**: `{ObjectName}.php` (PascalCase)
- **Config Files**: `{game_name}_config.php` (snake_case)
- **Data Files**: `{data_type}.json` (snake_case)

### Frontend (TypeScript/React)
- **Component Files**: `{ComponentName}.tsx` (PascalCase)
- **Hook Files**: `use{HookName}.ts` (camelCase with 'use' prefix)
- **Utility Files**: `{utilityName}.ts` (camelCase)
- **Type Files**: `{TypeName}Types.ts` (PascalCase with 'Types' suffix)
- **Style Files**: `{componentName}.module.css` (camelCase)
- **Asset Files**: `{asset_name}.{ext}` (snake_case)

---

## 9. Common Patterns for Complex Games

### Pattern 1: Grid-Based Board Games (Chess, Checkers, Go)
```
Components/
├── Board.php                 # Grid representation and state
├── MoveValidator.php         # Legal move checking
├── PieceManager.php          # Piece tracking and capture
└── WinConditionChecker.php   # Game over detection
```

### Pattern 2: Worker Placement Games (Lords of Waterdeep, Agricola)
```
Components/
├── Board.php                 # Main board state
├── AgentManager.php          # Worker placement logic
├── ResourceManager.php       # Resource tracking
├── ActionResolver.php        # Resolve worker placement actions
└── ScoringEngine.php         # Victory point calculation
```

### Pattern 3: Card-Driven Games (Dominion, 7 Wonders)
```
Components/
├── DeckManager.php           # Card deck management
├── HandManager.php           # Player hand management
├── CardEffectResolver.php    # Card ability resolution
└── MarketManager.php         # Card market/supply
```

### Pattern 4: Territory Control Games (Risk, Catan)
```
Components/
├── MapManager.php            # Territory/hex grid management
├── ResourceManager.php       # Resource generation
├── BuildingManager.php       # Settlement/building placement
└── CombatResolver.php        # Combat mechanics (if applicable)
```

---

## 10. Recommended Next Steps

1. **Choose a Complex Game**: Start with Chess or a similar grid-based game as it has well-defined rules and less asset complexity

2. **Build Infrastructure**: Create the folder structure and base components before implementing game logic

3. **Implement Incrementally**:
   - Start with basic board rendering
   - Add piece placement
   - Implement move validation
   - Add special rules (castling, en passant)
   - Add UI polish (animations, sounds)

4. **Test Continuously**: Write tests as you build, not after

5. **Document as You Go**: Update this guide with patterns and gotchas you discover

6. **Create Templates**: Once first game is complete, create boilerplate for future games

---

## Conclusion

This architecture provides a robust, scalable foundation for implementing complex board games while maintaining code quality, testability, and developer experience. The modular structure allows games to grow in complexity without becoming unmaintainable, and the consistent patterns make it easy for new developers to contribute.

The key is **progressive complexity**: simple games like Swoop can remain as single files, while complex games benefit from the full modular architecture. This flexibility ensures the codebase can accommodate any game type from simple card games to intricate strategy games.
