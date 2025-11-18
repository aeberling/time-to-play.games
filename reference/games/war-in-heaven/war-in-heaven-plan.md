# War in Heaven - Implementation Plan

## Game Overview

**War in Heaven** is a medium-complexity, asymmetrical strategy game for 2 players set on a hex-based game board. Players control opposing factions, each with unique pieces and cards that define piece attributes and abilities.

### Key Features
- **2 Players**: Asymmetrical gameplay with distinct factions
- **Hex-Based Board**: Strategic positioning on hexagonal grid
- **Game Pieces**: Multiple unit types per faction
- **Card System**: Cards correspond to pieces, defining attributes and abilities
- **Tactical Combat**: Piece interactions and strategic movement
- **Victory Conditions**: Multiple paths to victory

---

## Game Components

### Factions
1. **Faction 1** (Name TBD - e.g., "Angels", "Heavenly Host")
   - Unique piece types
   - Distinct card abilities
   - Faction-specific strengths

2. **Faction 2** (Name TBD - e.g., "Demons", "Infernal Legion")
   - Unique piece types
   - Distinct card abilities
   - Faction-specific strengths

### Game Pieces
Each faction has multiple piece types with different:
- Movement patterns on hex grid
- Attack/defense values
- Special abilities
- Card associations

### Cards
- **Piece Cards**: Define attributes for each piece type
- **Action Cards**: Special abilities and tactics
- **Event Cards**: Game-changing effects
- Card attributes include:
  - Attack value
  - Defense value
  - Movement range
  - Special abilities
  - Resource cost (if applicable)

### Hex Board
- Configurable board size (default: recommend 11x11 or 13x13 hex grid)
- Special terrain types (optional):
  - Normal terrain
  - Defensive positions
  - Objective points
  - Impassable terrain

---

## Architecture Overview

Following the **Complex Game Architecture** pattern outlined in `/reference/archive/COMPLEX_GAME_ARCHITECTURE.md`.

### Backend Architecture (Laravel/PHP)

```
app/Games/Engines/WarInHeaven/
├── WarInHeavenEngine.php              # Main engine implementing GameEngineInterface
├── Components/                         # Modular game logic
│   ├── HexBoard.php                   # Hex grid management and state
│   ├── PieceManager.php               # Piece tracking, movement, capture
│   ├── CardManager.php                # Card deck, hand, and play management
│   ├── MoveValidator.php              # Validate piece movements and actions
│   ├── CombatResolver.php             # Combat calculation and resolution
│   └── WinConditionChecker.php        # Victory condition evaluation
├── ValueObjects/                       # Type-safe data structures
│   ├── HexPosition.php                # Axial or cube hex coordinates
│   ├── GamePiece.php                  # Piece representation
│   ├── PieceCard.php                  # Card representation
│   ├── Faction.php                    # Faction enum/class
│   ├── CombatResult.php               # Combat outcome
│   └── MoveResult.php                 # Move validation result
├── Data/                              # Game content (JSON files)
│   ├── cards/
│   │   ├── faction1_cards.json        # Faction 1 card definitions
│   │   └── faction2_cards.json        # Faction 2 card definitions
│   ├── pieces.json                    # Piece type definitions
│   └── board_layouts.json             # Pre-configured board layouts
└── Config/
    └── war_in_heaven_config.php       # Game settings and constants
```

### Frontend Architecture (React/TypeScript)

```
resources/js/Pages/Games/WarInHeaven/
├── index.tsx                          # Entry point with lazy loading
├── WarInHeavenGame.tsx               # Main game container/orchestrator
│
├── components/                        # Game-specific UI components
│   ├── HexBoard/
│   │   ├── HexBoard.tsx              # Hex grid rendering
│   │   ├── HexTile.tsx               # Individual hex tile component
│   │   ├── Piece.tsx                 # Game piece rendering
│   │   ├── HexGrid.tsx               # Grid layout system
│   │   └── index.ts                  # Barrel export
│   │
│   ├── CardDisplay/
│   │   ├── CardHand.tsx              # Player's card hand
│   │   ├── Card.tsx                  # Individual card component
│   │   ├── CardDetail.tsx            # Card zoom/detail view
│   │   ├── DeckIndicator.tsx         # Deck/discard pile display
│   │   └── index.ts
│   │
│   ├── FactionPanel/
│   │   ├── FactionPanel.tsx          # Faction-specific UI panel
│   │   ├── FactionInfo.tsx           # Faction abilities/info
│   │   ├── ResourceDisplay.tsx       # Resources/VP tracker
│   │   └── index.ts
│   │
│   ├── GameInfo/
│   │   ├── GameInfo.tsx              # Game state display
│   │   ├── PlayerPanel.tsx           # Player info panel
│   │   ├── TurnIndicator.tsx         # Current turn display
│   │   └── index.ts
│   │
│   ├── CombatDisplay/
│   │   ├── CombatModal.tsx           # Combat resolution UI
│   │   ├── CombatAnimation.tsx       # Combat animations
│   │   └── index.ts
│   │
│   └── GameControls/
│       ├── ActionButtons.tsx         # Player action buttons
│       ├── EndTurnButton.tsx         # End turn control
│       └── index.ts
│
├── hooks/                             # Game-specific React hooks
│   ├── useWarInHeavenGame.ts         # Main game logic hook
│   ├── useHexBoardInteraction.ts     # Hex grid interaction (click, hover)
│   ├── useCardPlay.ts                # Card playing logic
│   ├── usePieceMovement.ts           # Piece movement handling
│   ├── useCombatResolution.ts        # Combat handling
│   └── useGameState.ts               # Game state management
│
├── utils/                             # Utility functions
│   ├── hexCalculations.ts            # Hex grid math (distance, neighbors, etc.)
│   ├── combatHelpers.ts              # Combat calculation helpers
│   ├── pieceHelpers.ts               # Piece-related utilities
│   ├── cardHelpers.ts                # Card-related utilities
│   └── constants.ts                  # Game constants
│
├── types/                             # TypeScript type definitions
│   ├── WarInHeavenTypes.ts           # Main game types
│   ├── HexTypes.ts                   # Hex grid types
│   ├── PieceTypes.ts                 # Piece types
│   └── CardTypes.ts                  # Card types
│
└── assets/                            # Game assets
    ├── cards/                         # Card images
    │   ├── faction1/
    │   │   ├── card1.png
    │   │   ├── card2.png
    │   │   └── ...
    │   └── faction2/
    │       ├── card1.png
    │       ├── card2.png
    │       └── ...
    │
    ├── pieces/                        # Game piece images/SVGs
    │   ├── faction1/
    │   │   ├── piece1.svg
    │   │   ├── piece2.svg
    │   │   └── ...
    │   └── faction2/
    │       ├── piece1.svg
    │       ├── piece2.svg
    │       └── ...
    │
    ├── board/                         # Board assets
    │   ├── hex_tile.svg              # Basic hex tile
    │   ├── hex_tile_highlight.svg    # Highlighted hex
    │   ├── hex_tile_selected.svg     # Selected hex
    │   └── board_background.svg      # Background texture
    │
    ├── sounds/                        # Sound effects
    │   ├── move.mp3                  # Piece movement
    │   ├── combat.mp3                # Combat sound
    │   ├── card_play.mp3             # Card played
    │   ├── card_draw.mp3             # Card drawn
    │   ├── victory.mp3               # Victory sound
    │   └── defeat.mp3                # Defeat sound
    │
    └── styles/
        └── war-in-heaven.module.css  # Game-specific styles
```

### Public Assets

```
public/assets/games/war-in-heaven/
├── cards/                             # Copied during build
│   ├── faction1/
│   └── faction2/
├── pieces/
│   ├── faction1/
│   └── faction2/
├── board/
└── ui/                                # UI elements
    ├── card-back.svg
    └── hex-overlay.svg
```

---

## Game State Structure

### Backend State (Redis/Database)

```php
[
    'gameId' => 'wih_123456',
    'gameType' => 'WAR_IN_HEAVEN',
    'status' => 'IN_PROGRESS', // WAITING, READY, IN_PROGRESS, COMPLETED, ABANDONED

    // Players
    'players' => [
        [
            'userId' => 'user1',
            'faction' => 'FACTION1',
            'playerIndex' => 0,
            'isConnected' => true,
        ],
        [
            'userId' => 'user2',
            'faction' => 'FACTION2',
            'playerIndex' => 1,
            'isConnected' => true,
        ]
    ],

    // Game flow
    'currentTurn' => 0, // Player index
    'turnPhase' => 'MOVEMENT', // DRAW, MOVEMENT, COMBAT, END
    'round' => 1,

    // Board state
    'board' => [
        'layout' => 'standard_11x11',
        'hexes' => [
            'q:0,r:0' => [
                'terrain' => 'normal',
                'piece' => null,
            ],
            'q:0,r:1' => [
                'terrain' => 'defensive',
                'piece' => [
                    'id' => 'piece_1',
                    'type' => 'warrior',
                    'faction' => 'FACTION1',
                    'health' => 5,
                    'hasMoved' => false,
                ],
            ],
            // ... more hexes
        ],
    ],

    // Card state
    'cards' => [
        'faction1' => [
            'deck' => ['card_1', 'card_2', '...'],
            'hand' => ['card_3', 'card_4'],
            'discard' => ['card_5'],
            'inPlay' => ['card_6'],
        ],
        'faction2' => [
            'deck' => ['card_7', 'card_8', '...'],
            'hand' => ['card_9', 'card_10'],
            'discard' => [],
            'inPlay' => ['card_11'],
        ],
    ],

    // Game resources
    'resources' => [
        'faction1' => [
            'victoryPoints' => 0,
            'specialResource' => 3,
        ],
        'faction2' => [
            'victoryPoints' => 0,
            'specialResource' => 3,
        ],
    ],

    // Move history
    'moveHistory' => [
        [
            'turn' => 1,
            'player' => 0,
            'action' => 'MOVE_PIECE',
            'data' => [
                'pieceId' => 'piece_1',
                'from' => 'q:0,r:0',
                'to' => 'q:0,r:1',
            ],
        ],
        // ... more moves
    ],

    // Victory conditions
    'victoryCondition' => null, // 'ELIMINATION', 'POINTS', 'OBJECTIVE'
    'winner' => null,
]
```

---

## Implementation Checklist

### Phase 1: Backend Foundation

#### Engine Setup
- [ ] Create `app/Games/Engines/WarInHeaven/` directory structure
- [ ] Implement `WarInHeavenEngine.php` with `GameEngineInterface`
  - [ ] `getGameType(): string`
  - [ ] `initializeGame(array $players, array $options): array`
  - [ ] `validateMove(array $state, array $move, int $playerIndex): ValidationResult`
  - [ ] `applyMove(array $state, array $move, int $playerIndex): array`
  - [ ] `checkGameOver(array $state): ?array`
  - [ ] `getValidMoves(array $state, int $playerIndex): array`

#### Value Objects
- [ ] Create `ValueObjects/HexPosition.php`
  - [ ] Axial coordinate system (q, r)
  - [ ] Conversion methods (axial ↔ cube ↔ offset)
  - [ ] Validation
- [ ] Create `ValueObjects/GamePiece.php`
  - [ ] Piece ID, type, faction
  - [ ] Health, attack, defense
  - [ ] Movement range
  - [ ] Special abilities
- [ ] Create `ValueObjects/PieceCard.php`
  - [ ] Card ID, name, type
  - [ ] Attributes (attack, defense, etc.)
  - [ ] Abilities/effects
  - [ ] Resource cost
- [ ] Create `ValueObjects/Faction.php`
  - [ ] Faction enum (FACTION1, FACTION2)
- [ ] Create `ValueObjects/CombatResult.php`
- [ ] Create `ValueObjects/MoveResult.php`

#### Components
- [ ] Create `Components/HexBoard.php`
  - [ ] Initialize hex grid
  - [ ] Get hex at position
  - [ ] Get neighbors of hex
  - [ ] Place/remove pieces
  - [ ] Validate hex coordinates
- [ ] Create `Components/PieceManager.php`
  - [ ] Track all pieces on board
  - [ ] Move piece (with validation)
  - [ ] Remove piece (capture)
  - [ ] Get pieces for faction
  - [ ] Get piece at position
- [ ] Create `Components/CardManager.php`
  - [ ] Initialize decks
  - [ ] Draw cards
  - [ ] Play cards
  - [ ] Discard cards
  - [ ] Shuffle deck
- [ ] Create `Components/MoveValidator.php`
  - [ ] Validate piece movement
  - [ ] Check movement range
  - [ ] Check path obstacles
  - [ ] Validate card plays
- [ ] Create `Components/CombatResolver.php`
  - [ ] Calculate combat outcome
  - [ ] Apply damage
  - [ ] Handle piece elimination
  - [ ] Apply card effects
- [ ] Create `Components/WinConditionChecker.php`
  - [ ] Check elimination victory
  - [ ] Check point victory
  - [ ] Check objective victory
  - [ ] Determine winner

#### Configuration & Data
- [ ] Create `Config/war_in_heaven_config.php`
  - [ ] Board size
  - [ ] Starting resources
  - [ ] Victory condition thresholds
  - [ ] Turn time limits
- [ ] Create `Data/pieces.json`
  - [ ] Define all piece types for both factions
  - [ ] Piece attributes and abilities
- [ ] Create `Data/cards/faction1_cards.json`
- [ ] Create `Data/cards/faction2_cards.json`
- [ ] Create `Data/board_layouts.json`
  - [ ] Standard layout
  - [ ] Alternative layouts

#### Testing
- [ ] Write unit tests for `HexPosition` calculations
- [ ] Write unit tests for `HexBoard` operations
- [ ] Write unit tests for `PieceManager`
- [ ] Write unit tests for `MoveValidator`
- [ ] Write unit tests for `CombatResolver`
- [ ] Write integration tests for `WarInHeavenEngine`

#### Registration
- [ ] Register `WarInHeavenEngine` in `GameRegistry`
- [ ] Add database migration for War in Heaven game type
- [ ] Add route for War in Heaven game

---

### Phase 2: Frontend Foundation

#### Project Setup
- [ ] Create `resources/js/Pages/Games/WarInHeaven/` directory
- [ ] Create `index.tsx` with lazy loading
- [ ] Create `WarInHeavenGame.tsx` main component
- [ ] Set up Vite code splitting for War in Heaven

#### TypeScript Types
- [ ] Create `types/WarInHeavenTypes.ts`
  - [ ] GameState interface
  - [ ] Player interface
  - [ ] Move interface
- [ ] Create `types/HexTypes.ts`
  - [ ] HexPosition interface
  - [ ] HexTile interface
  - [ ] HexDirection enum
- [ ] Create `types/PieceTypes.ts`
  - [ ] Piece interface
  - [ ] PieceType enum
- [ ] Create `types/CardTypes.ts`
  - [ ] Card interface
  - [ ] CardType enum

#### Utilities
- [ ] Create `utils/hexCalculations.ts`
  - [ ] Hex distance calculation
  - [ ] Get hex neighbors
  - [ ] Hex to pixel conversion
  - [ ] Pixel to hex conversion
  - [ ] Line drawing (for range/movement)
  - [ ] Field of view
- [ ] Create `utils/combatHelpers.ts`
- [ ] Create `utils/pieceHelpers.ts`
- [ ] Create `utils/cardHelpers.ts`
- [ ] Create `utils/constants.ts`

#### Core Hooks
- [ ] Create `hooks/useWarInHeavenGame.ts`
  - [ ] Connect to game state
  - [ ] Subscribe to game events
  - [ ] Handle game updates
- [ ] Create `hooks/useGameState.ts`
  - [ ] Manage local game state
  - [ ] Optimistic updates
- [ ] Create `hooks/useHexBoardInteraction.ts`
  - [ ] Handle hex clicks
  - [ ] Handle piece selection
  - [ ] Show valid moves
- [ ] Create `hooks/usePieceMovement.ts`
  - [ ] Handle piece drag/drop
  - [ ] Validate moves client-side
  - [ ] Submit moves to server
- [ ] Create `hooks/useCardPlay.ts`
  - [ ] Handle card selection
  - [ ] Play cards
  - [ ] Card targeting
- [ ] Create `hooks/useCombatResolution.ts`
  - [ ] Display combat UI
  - [ ] Animate combat

---

### Phase 3: UI Components

#### Hex Board Components
- [ ] Create `components/HexBoard/HexBoard.tsx`
  - [ ] Render hex grid
  - [ ] Handle board interactions
  - [ ] Responsive sizing
- [ ] Create `components/HexBoard/HexTile.tsx`
  - [ ] Render individual hex
  - [ ] Show terrain type
  - [ ] Highlight states (hover, selected, valid move)
- [ ] Create `components/HexBoard/Piece.tsx`
  - [ ] Render piece on hex
  - [ ] Show piece state (health, status)
  - [ ] Animate piece movement
- [ ] Create `components/HexBoard/HexGrid.tsx`
  - [ ] Calculate hex positions
  - [ ] Layout management

#### Card Components
- [ ] Create `components/CardDisplay/CardHand.tsx`
  - [ ] Display player's hand
  - [ ] Fan out cards
  - [ ] Card selection
- [ ] Create `components/CardDisplay/Card.tsx`
  - [ ] Render card with attributes
  - [ ] Show card art
  - [ ] Hover effects
- [ ] Create `components/CardDisplay/CardDetail.tsx`
  - [ ] Enlarged card view
  - [ ] Show full text
- [ ] Create `components/CardDisplay/DeckIndicator.tsx`
  - [ ] Show deck size
  - [ ] Show discard pile

#### Game Info Components
- [ ] Create `components/GameInfo/GameInfo.tsx`
  - [ ] Overall game state
  - [ ] Turn indicator
  - [ ] Timer
- [ ] Create `components/GameInfo/PlayerPanel.tsx`
  - [ ] Player info
  - [ ] Resources
  - [ ] Victory points
- [ ] Create `components/GameInfo/TurnIndicator.tsx`

#### Faction Components
- [ ] Create `components/FactionPanel/FactionPanel.tsx`
  - [ ] Faction-specific UI
  - [ ] Faction abilities
- [ ] Create `components/FactionPanel/FactionInfo.tsx`
- [ ] Create `components/FactionPanel/ResourceDisplay.tsx`

#### Combat Components
- [ ] Create `components/CombatDisplay/CombatModal.tsx`
  - [ ] Show combat participants
  - [ ] Display combat calculation
  - [ ] Show result
- [ ] Create `components/CombatDisplay/CombatAnimation.tsx`
  - [ ] Animate combat sequence

#### Control Components
- [ ] Create `components/GameControls/ActionButtons.tsx`
- [ ] Create `components/GameControls/EndTurnButton.tsx`

---

### Phase 4: Assets

#### Card Assets
- [ ] Create card template/frame design
- [ ] Design faction 1 cards
  - [ ] Card 1
  - [ ] Card 2
  - [ ] ... (define quantity needed)
- [ ] Design faction 2 cards
  - [ ] Card 1
  - [ ] Card 2
  - [ ] ... (define quantity needed)
- [ ] Create card back design

#### Piece Assets
- [ ] Design faction 1 pieces
  - [ ] Piece type 1
  - [ ] Piece type 2
  - [ ] ... (define types needed)
- [ ] Design faction 2 pieces
  - [ ] Piece type 1
  - [ ] Piece type 2
  - [ ] ... (define types needed)

#### Board Assets
- [ ] Create hex tile SVG (multiple terrain types if needed)
- [ ] Create hex highlight/selection overlays
- [ ] Create board background
- [ ] Create hex coordinate labels (for debugging)

#### Sound Effects
- [ ] Add/find piece movement sound
- [ ] Add/find combat sound
- [ ] Add/find card play sound
- [ ] Add/find card draw sound
- [ ] Add/find victory/defeat sounds

#### Styles
- [ ] Create `war-in-heaven.module.css`
  - [ ] Hex grid layout
  - [ ] Card styles
  - [ ] Faction color themes
  - [ ] Animations

---

### Phase 5: Integration & Testing

#### Backend Integration
- [ ] Test full game flow (init → play → end)
- [ ] Test reconnection scenarios
- [ ] Test edge cases
- [ ] Performance testing

#### Frontend Integration
- [ ] Connect all components
- [ ] Test user interactions
- [ ] Mobile responsiveness
- [ ] Accessibility testing
- [ ] Cross-browser testing

#### End-to-End Testing
- [ ] Full game playthrough
- [ ] Multiplayer testing
- [ ] Network interruption testing
- [ ] Error handling

#### Polish
- [ ] Smooth animations
- [ ] Loading states
- [ ] Error messages
- [ ] Tutorial/help system
- [ ] Sound effects integration

---

## Asset Requirements

### Card Design Specifications
- **Format**: PNG or SVG
- **Size**: 300x420px (card portrait) or similar aspect ratio
- **Elements**:
  - Card name
  - Faction symbol/color
  - Artwork/illustration
  - Attribute values (attack, defense, etc.)
  - Ability text
  - Resource cost (if applicable)

### Piece Design Specifications
- **Format**: SVG (preferred for scalability)
- **Size**: Design at 100x100px, will scale
- **Style**: Clear silhouettes for visibility on hex grid
- **Variations**:
  - Base piece design
  - Damaged/wounded state (optional)
  - Highlighted/selected state

### Hex Tile Specifications
- **Format**: SVG
- **Shape**: Flat-top or pointy-top hexagon (decide on one)
- **Size**: Design at standard size, will scale to board
- **Variants**:
  - Normal terrain
  - Special terrain types (if any)
  - Highlighted/selected
  - Valid move indicator

---

## Development Phases & Timeline

### Phase 1: Foundation (Week 1-2)
- Set up folder structure
- Create value objects and base classes
- Implement hex grid mathematics
- Create basic game engine

### Phase 2: Game Logic (Week 3-4)
- Implement piece movement
- Implement card system
- Implement combat system
- Victory conditions

### Phase 3: Basic UI (Week 5-6)
- Render hex board
- Render pieces
- Basic card display
- Interaction handling

### Phase 4: Polish & Assets (Week 7-8)
- Create/integrate final assets
- Animations
- Sound effects
- UI polish

### Phase 5: Testing & Balance (Week 9-10)
- Playtesting
- Balance adjustments
- Bug fixes
- Performance optimization

---

## Game Rules (To Be Defined)

*This section will be expanded with specific game rules, including:*

### Setup
- Board configuration
- Starting pieces placement
- Starting cards/deck
- Starting resources

### Turn Structure
1. **Draw Phase**: Draw cards
2. **Movement Phase**: Move pieces
3. **Combat Phase**: Resolve combat
4. **End Phase**: Cleanup, check victory

### Movement Rules
- Movement range based on piece type
- Terrain effects
- Stacking rules

### Combat Rules
- Attack/defense calculation
- Card effects on combat
- Piece elimination

### Card Rules
- When cards can be played
- Card targeting
- Card effects

### Victory Conditions
- Primary victory condition
- Alternative victory conditions
- Tie-breakers

---

## Notes & Considerations

### Hex Grid System
- **Recommendation**: Use **axial coordinates** (q, r) for hex positions
- Library suggestion: Consider using existing hex grid library like `honeycomb-grid` for TypeScript
- Provide conversion utilities for different coordinate systems

### Asymmetry Balance
- Ensure factions are balanced despite asymmetry
- Playtest extensively
- Consider allowing players to choose factions or random assignment

### Scalability
- Design data structure to easily add:
  - New piece types
  - New card types
  - New factions (future expansion)
  - New board layouts

### Performance
- Optimize hex grid rendering (use canvas or SVG efficiently)
- Lazy load card images
- Minimize game state updates

### Accessibility
- Colorblind-friendly faction colors
- Clear piece differentiation beyond color
- Keyboard navigation support
- Screen reader support

---

## References & Resources

### Hex Grid Resources
- [Red Blob Games - Hexagonal Grids](https://www.redblobgames.com/grids/hexagons/)
- [Honeycomb Grid Library](https://github.com/flauwekeul/honeycomb)

### Design Inspiration
- Study asymmetrical games: Twilight Struggle, Root, Cosmic Encounter
- Study hex-based games: Battle for Wesnoth, Neuroshima Hex

### Architecture Reference
- `/reference/archive/COMPLEX_GAME_ARCHITECTURE.md`
- Existing game implementations: `/app/Games/Engines/SwoopEngine.php`, `/app/Games/Engines/OhHellEngine.php`

---

## Next Steps

1. **Define Game Rules**: Finalize complete rule set
2. **Design Factions**: Create faction identities and asymmetries
3. **Create Piece Types**: Define all piece types and their attributes
4. **Design Card Set**: Create initial card set for both factions
5. **Start Implementation**: Begin with Phase 1 backend foundation

---

*This plan is a living document. Update as the game design evolves and implementation progresses.*
