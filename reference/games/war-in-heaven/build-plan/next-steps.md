# War in Heaven - Next Steps

## Current Status

### ✅ Phase 1: Visual Assets & Components (COMPLETE)

All visual components have been built and are functional:

- **Hex Board**: Fully functional hex grid with flat-top hexagons, deploy zones, and gate hexes
- **Tokens**: Complete token design with faction colors, character icons, and stats
  - Active state: Shows faction color (gold/red) with character icon and attack/defense stats
  - Depleted state: Shows grey with character icon and refresh icon in bottom
  - Tokens on board always show active state
  - Tokens in card panel can be flipped by clicking
- **Cards**: Full card artwork display with token overlays
  - Troop cards: 4 tokens stacked vertically
  - Commander/Ally cards: Single token horizontally positioned
- **UI Components**: PlayerPanel, GameInfo, GameControls, GateControl, Summary Panel
- **Game View**: Complete layout with:
  - Hex board in center
  - Summary panel on right (round tracking, actions remaining, end turn button)
  - Collapsible card panel at bottom with tabs for player/opponent hands

### ✅ Interactive Token System (COMPLETE)

- **Deployment**: Drag tokens from card panel to deploy zones (A1/B1 for angels, A9/B9 for demons)
- **Payment**: Click tokens in card panel to flip between active/depleted
- **Movement**: Click token on board to select, click empty hex to move
- **Visual Feedback**: Deploy zones highlight green when dragging tokens

### 🎮 Demo Route

View the current implementation at: `/dev/war-in-heaven/game-view`

## Next Steps - Phase 2: Game Logic & Rules

The visual foundation is complete. The next phase is to implement the actual game mechanics and rules.

### Priority 1: Core Game Engine

#### 2.1 - Game State Management
- [ ] Create a centralized game state manager (consider using Zustand or Context API)
- [ ] Define complete game state structure:
  ```typescript
  interface GameState {
    players: Player[];
    currentPlayer: PlayerID;
    phase: GamePhase; // 'setup' | 'recharge' | 'action' | 'combat' | 'end'
    round: number;
    actionsRemaining: number;
    board: BoardState;
    // ... etc
  }
  ```
- [ ] Implement state persistence (localStorage for dev, database for production)

#### 2.2 - Movement System
- [ ] Implement movement validation based on card abilities:
  - Standard: 1 space adjacent
  - Uriel/Leviathen: 2 spaces, can move through occupied
  - Camiel/Asmodeus: Straight line movement (cannot cross gates)
  - Jophiel/Belphegor: Special movement effects on opponent troops
- [ ] Visual indication of valid moves when token is selected
- [ ] Update `validMoves` array passed to HexBoard component
- [ ] Implement movement cost (1 action per move)

#### 2.3 - Deployment System
- [ ] Validate deployment rules:
  - Can only deploy to faction-specific deploy zones
  - Troops cost 0 to deploy
  - Allies cost resources (flip tokens equal to cost)
  - Must have enough active tokens to pay cost
- [ ] Update deployment handler to check costs and validate
- [ ] Auto-flip tokens when paying deployment costs
- [ ] Special deployment rules (e.g., Raphael's free troop deployment)

#### 2.4 - Combat System
- [ ] Implement attack declaration phase
- [ ] Combat resolution:
  - Compare attack vs defense values
  - Apply special abilities (Gabriel's +2/+2 to troops, Baal's +2/+2 to Lucifer)
  - Determine combat outcome
  - Remove defeated tokens from board
- [ ] Add "Declare Attack" functionality to GameControls
- [ ] Visual feedback during combat (highlight attacking/defending tokens)

### Priority 2: Turn Management

#### 2.5 - Game Phases
- [ ] Implement phase transitions:
  1. **Recharge Phase**: Ready up to 1 depleted token (Mammon can recharge an extra token)
  2. **Action Phase**: Take up to 3 actions (deploy, move, or use special ability)
  3. **Combat Phase**: Declare and resolve attacks
  4. **End Phase**: Pass turn to opponent
- [ ] Update UI to show current phase
- [ ] Disable/enable actions based on current phase
- [ ] Auto-advance phases when appropriate

#### 2.6 - Turn Controls
- [ ] Implement "End Turn" button functionality:
  - Reset actions to 3
  - Increment round counter
  - Switch current player
  - Trigger recharge phase
- [ ] Add confirmation dialogs for important actions
- [ ] Implement undo/redo for development/testing

### Priority 3: Win Conditions

#### 2.7 - Victory Detection
- [ ] Implement win condition checks:
  - Commander defeated (Michael or Lucifer destroyed)
  - Round 12 ends (most tokens on board wins)
  - Zadkiel: Control all 4 gate hexes
  - Beelzebub: All allies on battlefield
- [ ] Display victory screen when win condition met
- [ ] Track game statistics for victory screen

### Priority 4: Special Abilities

#### 2.8 - Card-Specific Abilities
- [ ] Michael: Once per game, teleport ally/troop adjacent to Michael
- [ ] Uriel/Leviathen: Move 2 spaces, can pass through occupied
- [ ] Camiel/Asmodeus: Move straight line, cannot cross gates
- [ ] Jophiel: Pull opponent troops closer in straight line
- [ ] Belphegor: Push opponent troops away in straight line
- [ ] Zadkiel: Win if control all gates
- [ ] Raphael: Deploy 1 troop for free each round
- [ ] Gabriel: Bolster troops +2/+2
- [ ] Mammon: Recharge extra token each round
- [ ] Baal: Bolster Lucifer +2/+2
- [ ] Beelzebub: Win if all allies on battlefield

### Priority 5: Backend Integration

#### 2.9 - Laravel Backend
- [ ] Create Game model and migration
- [ ] Create GameMove model for move history
- [ ] Create API endpoints:
  - `POST /api/games` - Create new game
  - `GET /api/games/{id}` - Get game state
  - `POST /api/games/{id}/moves` - Submit move
  - `GET /api/games/{id}/moves` - Get move history
- [ ] Implement game state validation on backend
- [ ] Add authentication/authorization (only players can submit moves)

#### 2.10 - Real-time Multiplayer
- [ ] Set up Reverb broadcasting for game moves
- [ ] Listen for opponent moves and update UI
- [ ] Add presence channels (show when opponent is online)
- [ ] Handle disconnections gracefully
- [ ] Add reconnection logic

### Priority 6: Polish & UX

#### 2.11 - Animations & Feedback
- [ ] Smooth token movement animations
- [ ] Combat animations (attack effects, token removal)
- [ ] Phase transition animations
- [ ] Hover effects and highlights
- [ ] Sound effects (optional)

#### 2.12 - Game Setup Flow
- [ ] Create game lobby/matchmaking
- [ ] Faction selection screen
- [ ] Initial token placement (4 militia/fallen angels at start)
- [ ] Tutorial/help system

## File Structure Reference

### Current Key Files

```
/resources/js/Pages/Games/WarInHeaven/
├── GameView.tsx                    # Main game view (start here for Phase 2)
├── GameView.css                    # Styles for game view
├── components/
│   ├── HexBoard/
│   │   ├── HexBoard.tsx           # Board container
│   │   └── HexTile.tsx            # Individual hex rendering with tokens
│   ├── Card/
│   │   └── Card.tsx               # Card display component
│   ├── Token/
│   │   └── Token.tsx              # Standalone token component
│   └── UI/
│       └── UI.tsx                 # PlayerPanel, GameInfo, GameControls, etc.
├── types/
│   └── HexTypes.ts                # Type definitions
└── utils/
    └── hexCalculations.ts         # Hex math utilities

/routes/
└── web.php                        # Contains dev route: /dev/war-in-heaven/game-view
```

### Files to Create for Phase 2

```
/app/Games/Engines/WarInHeaven/
├── GameEngine.php                 # Core game logic
├── MovementValidator.php          # Movement rule validation
├── CombatResolver.php             # Combat resolution
├── WinConditionChecker.php        # Win condition detection
└── CardAbilities/                 # Individual card ability implementations
    ├── Michael.php
    ├── Uriel.php
    └── ... etc

/app/Models/
├── Game.php                       # Game model
└── GameMove.php                   # Move history model

/resources/js/stores/
└── gameStore.ts                   # Zustand store for game state (or use Context)
```

## Implementation Strategy

### Recommended Approach

1. **Start Small**: Implement basic movement validation first (standard 1-space movement)
2. **Test Incrementally**: Add one feature at a time and test thoroughly
3. **Build on Top**: Each feature builds on the previous (movement → combat → abilities)
4. **Keep UI Responsive**: Update visual feedback as logic is added

### Development vs Production

- **Development**: Use local state and localStorage for rapid iteration
- **Production**: Move to backend validation and real-time sync

### Testing Strategy

- Create test scenarios for each card ability
- Test edge cases (board boundaries, occupied spaces, etc.)
- Test win conditions with various board states

## Questions to Consider Before Starting Phase 2

1. **Single Player vs Multiplayer First?**
   - Single player (local state) is faster to develop and test
   - Multiplayer requires backend but is the end goal

2. **AI Opponent?**
   - Do you want a basic AI for single-player mode?
   - Could be simple (random moves) or complex (strategic)

3. **Move Validation Location?**
   - Client-side only (faster, less secure)
   - Server-side validation (slower, more secure, required for multiplayer)
   - Hybrid (client for UX, server for authority)

4. **Game State Persistence?**
   - Where should games be saved? (localStorage, database, both?)
   - How to handle save/load for incomplete games?

## Resources

- **Rules Reference**: `/reference/games/war-in-heaven/rules.md`
- **Board Layout**: `/reference/games/war-in-heaven/board-layout.md`
- **Data Structures**: `/reference/games/war-in-heaven/data-structures.md`
- **Current Build Plan**: `/reference/games/war-in-heaven/build-plan/phase-1-visual-assets.md`

---

**Last Updated**: Based on commit `a9502ae` - All visual components complete and functional
