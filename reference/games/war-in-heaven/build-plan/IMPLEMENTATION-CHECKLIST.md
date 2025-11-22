# War in Heaven - Online Multiplayer Implementation Checklist

## Overview
Converting War in Heaven from hot-seat local play to online multiplayer by implementing a full server-authoritative backend game engine.

**Estimated Total Time:** 16-24 hours
**Priority:** High - User explicitly requested full backend implementation

---

## Phase 1: Backend Core Components ✅ (COMPLETED)

### 1.1 HexBoard Component ✅
**File:** `/app/Games/Engines/WarInHeaven/Components/HexBoard.php`

**Status:** ✅ COMPLETE

**Implemented:**
- [x] Standard board layout initialization with correct coordinates (A1-E6)
- [x] Board structure: 9 rows, varying widths (2-5 hexes)
- [x] Hex types: standard, deploy (angels/demons), gate (4 hexes)
- [x] `getAdjacentHexes()` - Returns neighbors for any coordinate
- [x] `getDistance()` - BFS pathfinding between hexes
- [x] `areAdjacent()` - Check if two hexes are neighbors
- [x] `getHexesInRange()` - Get all hexes within N moves of center

**Board Layout:**
```
Row 1 (Angel Deploy):  A1, B1
Row 2:                 A2, B2, C2
Row 3:                 A3, B3, C3, D3
Row 4:                 A4, B4, C4, D4, E4
Row 5 (Gates):         A5, B5, C5, D5
Row 6:                 A6, B6, C6, D6, E6
Row 7:                 A7, B7, C7, D7
Row 8:                 A8, B8, C8
Row 9 (Demon Deploy):  A9, B9
```

---

## Phase 2: Backend Game Data ⚠️ (IN PROGRESS)

### 2.1 CardManager Component ⚠️
**File:** `/app/Games/Engines/WarInHeaven/Components/CardManager.php`

**Status:** ⚠️ NOT STARTED (NEXT TASK)

**Requirements:**
- [ ] Define all Angel cards (16 total)
- [ ] Define all Demon cards (16 total)
- [ ] Implement `initializeDecks()` - Create starting decks for both factions
- [ ] Implement `drawCards()` - Draw cards from deck to hand
- [ ] Implement `playCard()` - Deploy card from hand
- [ ] Implement `discardCard()` - Remove card from hand
- [ ] Track card state: deck, hand, deployed, discarded

**Angel Cards to Implement:**
1. **Michael** (Commander)
   - Cost: 0, Attack: 5, Defense: 6, Tokens: 1
   - Special: Once per game, teleport ally/troop to adjacent hex

2. **Heaven's Militia** (Troop)
   - Cost: 0, Attack: 1, Defense: 1, Tokens: 4
   - Special: Start with 4 troops on battlefield

3. **Uriel** (Ally)
   - Cost: 1, Attack: 3, Defense: 2, Tokens: 1
   - Special: Moves 2 spaces in any direction, can move through occupied

4. **Gabriel** (Ally)
   - Cost: 1, Attack: 2, Defense: 3, Tokens: 1
   - Special: +1 Attack when engaged in combat

5. **Raphael** (Ally)
   - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
   - Special: Once per turn, deploy from hand for free to adjacent hex to any ally

6. **Camiel** (Ally)
   - Cost: 1, Attack: 2, Defense: 3, Tokens: 1
   - Special: Can move in straight line any number of spaces (no obstacles)

7. **Jophiel** (Ally)
   - Cost: 1, Attack: 3, Defense: 2, Tokens: 1
   - Special: Can push or pull adjacent enemy token 1 space

8. **Raziel** (Ally)
   - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
   - Special: (Define based on game rules)

9. **Sariel** (Ally)
   - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
   - Special: (Define based on game rules)

10. **Remiel** (Ally)
    - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
    - Special: (Define based on game rules)

11. **Ariel** (Ally)
    - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
    - Special: (Define based on game rules)

12. **Haniel** (Ally)
    - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
    - Special: (Define based on game rules)

13. **Azrael** (Ally)
    - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
    - Special: (Define based on game rules)

14. **Metatron** (Ally)
    - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
    - Special: (Define based on game rules)

15. **Sandalphon** (Ally)
    - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
    - Special: (Define based on game rules)

16. **Cassiel** (Ally)
    - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
    - Special: (Define based on game rules)

**Demon Cards to Implement:**
1. **Lucifer** (Commander)
   - Cost: 0, Attack: 5, Defense: 6, Tokens: 1
   - Special: Once per game, teleport ally/troop to adjacent hex

2. **Legion** (Troop)
   - Cost: 0, Attack: 1, Defense: 1, Tokens: 4
   - Special: Start with 4 troops on battlefield

3. **Leviathen** (Ally)
   - Cost: 1, Attack: 3, Defense: 2, Tokens: 1
   - Special: Moves 2 spaces in any direction, can move through occupied

4. **Baal** (Ally)
   - Cost: 1, Attack: 2, Defense: 3, Tokens: 1
   - Special: +1 Attack when engaged in combat

5. **Mammon** (Ally)
   - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
   - Special: +1 Recharge per turn (base 1, becomes 2)

6. **Asmodeus** (Ally)
   - Cost: 1, Attack: 2, Defense: 3, Tokens: 1
   - Special: Can move in straight line any number of spaces (no obstacles)

7. **Belphegor** (Ally)
   - Cost: 1, Attack: 3, Defense: 2, Tokens: 1
   - Special: Can push or pull adjacent enemy token 1 space

8. **Beelzebub** (Ally)
   - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
   - Special: (Define based on game rules)

9. **Azazel** (Ally)
   - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
   - Special: (Define based on game rules)

10. **Abaddon** (Ally)
    - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
    - Special: (Define based on game rules)

11. **Belial** (Ally)
    - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
    - Special: (Define based on game rules)

12. **Lilith** (Ally)
    - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
    - Special: (Define based on game rules)

13. **Moloch** (Ally)
    - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
    - Special: (Define based on game rules)

14. **Astaroth** (Ally)
    - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
    - Special: (Define based on game rules)

15. **Mephistopheles** (Ally)
    - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
    - Special: (Define based on game rules)

16. **Sammael** (Ally)
    - Cost: 1, Attack: 2, Defense: 2, Tokens: 1
    - Special: (Define based on game rules)

**Card State Structure:**
```php
[
    'angels' => [
        'deck' => [...], // Cards not yet drawn
        'hand' => [...], // Cards in player's hand
        'deployed' => [...], // Cards on battlefield
        'discarded' => [...], // Used/destroyed cards
    ],
    'demons' => [
        'deck' => [...],
        'hand' => [...],
        'deployed' => [...],
        'discarded' => [...],
    ],
]
```

**Reference Files:**
- `/resources/js/Pages/Games/WarInHeaven/GameView.tsx` (lines 59-485) - Full card definitions
- `/reference/games/war-in-heaven/card-images/` - Card image assets

---

### 2.2 PieceManager Component ⚠️
**File:** `/app/Games/Engines/WarInHeaven/Components/PieceManager.php`

**Status:** ⚠️ NOT STARTED

**Requirements:**
- [ ] `movePiece()` - Move token from one hex to another
- [ ] `deployToken()` - Place new token on board from hand
- [ ] `removePiece()` - Remove token from board (eliminated)
- [ ] `getTokenAt()` - Get token data at specific hex
- [ ] `getAllTokens()` - Get all tokens for a faction
- [ ] Validate piece placement rules
- [ ] Track token active/depleted state

**Token Data Structure:**
```php
[
    'id' => 'angel_michael_token_0',
    'cardId' => 'angel_michael',
    'name' => 'Michael',
    'faction' => 'angels',
    'subtype' => 'commander', // commander, ally, troop
    'attack' => 5,
    'defense' => 6,
    'isActive' => true, // Active or depleted
    'position' => 'B5', // Current hex coordinate
]
```

---

## Phase 3: Backend Game Logic ⚠️ (NOT STARTED)

### 3.1 MoveValidator Component ⚠️
**File:** `/app/Games/Engines/WarInHeaven/Components/MoveValidator.php`

**Status:** ⚠️ NOT STARTED

**Requirements:**
- [ ] `validatePieceMovement()` - Validate token movement
  - [ ] Standard movement: 1 space to adjacent hex
  - [ ] Uriel/Leviathen: 2 spaces in any direction, through occupied
  - [ ] Camiel/Asmodeus: Straight line, any distance, no obstacles
  - [ ] Jophiel/Belphegor: Push/pull mechanics
  - [ ] Check if destination hex is valid
  - [ ] Check if token is active (not depleted)
  - [ ] Check if path is clear (for standard movement)

- [ ] `validateCardPlay()` - Validate card deployment
  - [ ] Check if player has card in hand
  - [ ] Check if player has resources (cost)
  - [ ] Check if deployment hex is valid (deploy zone or Raphael special)
  - [ ] Check if hex is unoccupied

- [ ] `validateAttack()` - Validate attack action
  - [ ] Check if attacker exists and is active
  - [ ] Check if target exists
  - [ ] Check if attacker and target are adjacent
  - [ ] Check if attacker is enemy faction

- [ ] `getAllValidPieceMovements()` - Get all valid moves for current player
- [ ] `getAllValidCardPlays()` - Get all valid card deployments
- [ ] `getAllValidAttacks()` - Get all valid attack actions

**Movement Rules:**
1. **Standard Movement:** 1 space to adjacent hex (most pieces)
2. **Uriel/Leviathen:** Can move 2 spaces, can move through occupied hexes
3. **Camiel/Asmodeus:** Can move in straight line any distance, cannot move through obstacles
4. **Jophiel/Belphegor:** Standard 1 space + special push/pull ability

**Deployment Rules:**
1. Deploy to own deployment zone (A1/B1 for angels, A9/B9 for demons)
2. Raphael special: Can deploy adjacent to any ally once per turn
3. Must have card in hand
4. Must pay resource cost
5. Hex must be unoccupied

---

### 3.2 CombatResolver Component ⚠️
**File:** `/app/Games/Engines/WarInHeaven/Components/CombatResolver.php`

**Status:** ⚠️ NOT STARTED

**Requirements:**
- [ ] `resolve()` - Resolve combat between attacker and defender
  - [ ] Calculate attacker's total attack (base + Gabriel/Baal bonus)
  - [ ] Calculate defender's defense
  - [ ] Determine damage
  - [ ] Apply damage to defender
  - [ ] Check if defender is eliminated
  - [ ] Return combat result

- [ ] `calculateDamage()` - Calculate damage dealt
- [ ] `applyDamage()` - Apply damage to token
- [ ] Check Gabriel/Baal presence for +1 attack bonus

**Combat Rules:**
1. **Attack = Attacker's Attack stat**
   - +1 if Gabriel (angels) or Baal (demons) is in combat
2. **Defense = Defender's Defense stat**
3. **Damage = Attack - Defense**
4. **Token eliminated if Damage > 0**
5. **Multiple attackers:** Sum all attacks, compare to defense

**Combat Result Structure:**
```php
[
    'attackerEliminated' => false,
    'defenderEliminated' => true,
    'attackerHealth' => 5,
    'defenderHealth' => 0,
    'damage' => 2,
    'combatBonus' => true, // Gabriel or Baal present
]
```

---

### 3.3 WinConditionChecker Component ⚠️
**File:** `/app/Games/Engines/WarInHeaven/Components/WinConditionChecker.php`

**Status:** ⚠️ NOT STARTED

**Requirements:**
- [ ] `check()` - Check if game has been won
  - [ ] Commander eliminated: Opponent wins immediately
  - [ ] Gate control: Control all 4 gates at end of turn = Victory
  - [ ] Victory points: (Future implementation)

- [ ] `calculateGateControl()` - Determine who controls gates
  - [ ] Count angels on gates (A5, B5, C5, D5)
  - [ ] Count demons on gates
  - [ ] Return controlling faction or null

- [ ] Return winner and condition

**Victory Conditions:**
1. **Commander Elimination:** If Michael/Lucifer is eliminated, opponent wins
2. **Gate Control:** Control all 4 gates at end of your turn
3. **Victory Points:** (Not implemented yet - future feature)

**Return Structure:**
```php
// Game still in progress
null

// Game over
[
    'winner' => 'angels',
    'winnerIndex' => 0,
    'condition' => 'commander_eliminated', // or 'gate_control'
]
```

---

## Phase 4: Backend Engine Integration ⚠️ (NOT STARTED)

### 4.1 Update WarInHeavenEngine ⚠️
**File:** `/app/Games/Engines/WarInHeaven/WarInHeavenEngine.php`

**Status:** ⚠️ PARTIALLY COMPLETE - Needs updates

**Requirements:**
- [x] Basic structure in place
- [ ] Update `initializeGame()` to use new component implementations
  - [ ] Initialize board with HexBoard
  - [ ] Initialize cards with CardManager
  - [ ] Set up starting tokens
  - [ ] Use 'angels'/'demons' instead of 'FACTION1'/'FACTION2'

- [ ] Implement `validateMove()` with actual validation
- [ ] Implement `applyMove()` with actual state changes
- [ ] Implement `checkGameOver()` with WinConditionChecker
- [ ] Implement `getValidMoves()` with MoveValidator
- [ ] Update `getPlayerView()` to hide opponent's hand

**Initial State Structure:**
```php
[
    'gameType' => 'WAR_IN_HEAVEN',
    'status' => 'READY',

    // Players
    'players' => [
        ['userId' => 1, 'faction' => 'angels', 'playerIndex' => 0, 'isConnected' => true],
        ['userId' => 2, 'faction' => 'demons', 'playerIndex' => 1, 'isConnected' => true],
    ],
    'currentTurn' => 0,
    'phase' => 'recharge', // recharge, action, combat, end
    'round' => 1,

    // Board
    'board' => [...], // Hex state from HexBoard

    // Cards
    'cards' => [...], // Card state from CardManager

    // Game state
    'actionsRemaining' => 3, // 3 actions per turn
    'rechargesRemaining' => 1, // Base 1, +1 per gate controlled, +1 for Mammon
    'selectedAttackers' => [], // Tokens selected for combat
    'combatTarget' => null, // Target of current combat
    'combatLog' => [], // History of combat events
    'moveHistory' => [],

    // Victory
    'victoryCondition' => null,
    'winner' => null,
]
```

**Move Types:**
```php
// Movement
['type' => 'MOVE_PIECE', 'from' => 'A5', 'to' => 'B5']

// Deploy card
['type' => 'DEPLOY_TOKEN', 'cardId' => 'angel_uriel', 'tokenIndex' => 0, 'to' => 'A1']

// Attack
['type' => 'ATTACK', 'attackers' => ['A5', 'B5'], 'target' => 'C5']

// Recharge
['type' => 'RECHARGE', 'cardId' => 'angel_gabriel', 'tokenIndex' => 0]

// End turn
['type' => 'END_TURN']
```

---

## Phase 5: Frontend Integration ⚠️ (NOT STARTED)

### 5.1 Update WarInHeaven.tsx ✅
**File:** `/resources/js/Pages/Games/WarInHeaven.tsx`

**Status:** ✅ COMPLETE - Already updated to use useGameStore pattern

**Completed:**
- [x] Follows Swoop/OhHell multiplayer pattern
- [x] Uses `useGameStore()` for API/WebSocket integration
- [x] Shows waiting room before game starts
- [x] Handles auto-join with ?join=true parameter
- [x] Displays loading/error states
- [x] Passes gameState to GameView as props

---

### 5.2 Refactor GameView Component ⚠️
**File:** `/resources/js/Pages/Games/WarInHeaven/GameView.tsx`

**Status:** ⚠️ NEEDS MAJOR REFACTOR

**Current State:**
- Uses local Zustand store with full game logic
- 36,000+ lines of complex game engine code
- Works for hot-seat play only

**Required Changes:**
- [ ] Remove import of `useGameStore` from `./stores/gameStore`
- [ ] Accept backend state as props instead
  ```typescript
  interface GameViewProps {
      gameState: any; // Backend state
      currentGame: Game;
      playerIndex: number;
      auth: PageProps['auth'];
      gameId: number;
      makeMove: (gameId: number, move: any) => Promise<void>;
  }
  ```

- [ ] Remove ALL game logic (movement validation, combat, etc.)
- [ ] Keep ONLY UI state:
  - [ ] `selectedPiece` - Which piece is selected for movement
  - [ ] `combatMode` - Whether in combat declaration mode
  - [ ] `selectedAttackers` - Pieces selected for attack
  - [ ] `hoveredHex` - UI hover state

- [ ] Implement move submission to backend:
  ```typescript
  const handleMovePiece = async (from: string, to: string) => {
      await makeMove(gameId, {
          type: 'MOVE_PIECE',
          from,
          to,
      });
      setSelectedPiece(null);
  };
  ```

- [ ] Update to read state from props instead of Zustand:
  ```typescript
  // OLD
  const { hexes, currentPlayer } = useGameStore();

  // NEW
  const hexes = gameState?.board || {};
  const currentPlayer = gameState?.players[gameState?.currentTurn]?.faction;
  ```

- [ ] Map backend state structure to frontend display:
  - [ ] `gameState.board` → hex rendering
  - [ ] `gameState.cards` → card display
  - [ ] `gameState.phase` → phase UI
  - [ ] `gameState.actionsRemaining` → action counter
  - [ ] `gameState.combatLog` → combat history

**Files to Update:**
- `/resources/js/Pages/Games/WarInHeaven/GameView.tsx` - Main component
- Keep all presentation components unchanged:
  - `/resources/js/Pages/Games/WarInHeaven/components/HexBoard/`
  - `/resources/js/Pages/Games/WarInHeaven/components/Card.tsx`
  - `/resources/js/Pages/Games/WarInHeaven/components/Token.tsx`
  - `/resources/js/Pages/Games/WarInHeaven/components/GameControls.tsx`

---

### 5.3 Remove Local Game Store ⚠️
**File:** `/resources/js/Pages/Games/WarInHeaven/stores/gameStore.ts`

**Status:** ⚠️ NEEDS DELETION

**Action:**
- [ ] Delete the entire file (1000+ lines)
- [ ] OR keep as reference documentation for backend implementation

**Note:** This file contains the complete game logic that needs to be ported to backend. Consider keeping it temporarily as a reference while implementing backend components.

---

### 5.4 Update Type Definitions ⚠️
**File:** `/resources/js/types/index.d.ts`

**Status:** ⚠️ NEEDS NEW TYPES

**Requirements:**
- [ ] Add `WarInHeavenGameState` interface matching backend structure
  ```typescript
  export interface WarInHeavenGameState {
      gameType: 'WAR_IN_HEAVEN';
      status: GameStatus;
      players: Array<{
          userId: number;
          faction: 'angels' | 'demons';
          playerIndex: number;
          isConnected: boolean;
      }>;
      currentTurn: number;
      phase: 'recharge' | 'action' | 'combat' | 'end';
      round: number;
      board: Record<string, HexState>;
      cards: any; // Define card state structure
      actionsRemaining: number;
      rechargesRemaining: number;
      selectedAttackers: string[];
      combatTarget: string | null;
      combatLog: CombatLogEntry[];
      moveHistory: any[];
      victoryCondition: string | null;
      winner: string | null;
  }

  interface HexState {
      coordinate: string;
      type: 'standard' | 'deploy' | 'gate';
      owner?: 'angels' | 'demons';
      occupiedBy: TokenData | null;
  }

  interface TokenData {
      id: string;
      cardId: string;
      name: string;
      faction: 'angels' | 'demons';
      subtype: 'commander' | 'ally' | 'troop';
      attack: number;
      defense: number;
      isActive: boolean;
      position: string;
  }

  interface CombatLogEntry {
      round: number;
      attackers: string[];
      target: string;
      result: 'attacker_eliminated' | 'defender_eliminated' | 'no_damage';
      timestamp: number;
  }
  ```

---

## Phase 6: Testing & Refinement ⚠️ (NOT STARTED)

### 6.1 Backend Component Testing ⚠️
- [ ] Test HexBoard adjacency calculations
- [ ] Test card initialization
- [ ] Test movement validation for all 4 movement types
- [ ] Test combat resolution with various scenarios
- [ ] Test win condition checking
- [ ] Test special abilities (Michael, Uriel, Gabriel, etc.)

### 6.2 Integration Testing ⚠️
- [ ] Create game from lobby
- [ ] Join game as second player
- [ ] Start game
- [ ] Deploy tokens
- [ ] Move pieces (all 4 movement types)
- [ ] Attack and eliminate tokens
- [ ] Recharge tokens
- [ ] Test gate control
- [ ] Test commander elimination victory
- [ ] Test WebSocket real-time updates

### 6.3 Edge Cases ⚠️
- [ ] Player disconnection handling
- [ ] Invalid move attempts
- [ ] Concurrent move submissions
- [ ] Turn timer expiration (if implemented)
- [ ] Game state recovery

---

## Implementation Order (Recommended)

### Session 1 (Current): Setup ✅
- [x] Remove old War card game
- [x] Create WarInHeaven.tsx multiplayer wrapper
- [x] Implement HexBoard component
- [x] Create this implementation plan

### Session 2: Backend Data (4-6 hours)
1. Implement CardManager with all 32 cards
2. Implement PieceManager for token management
3. Update WarInHeavenEngine initialization

### Session 3: Backend Logic (6-8 hours)
1. Implement MoveValidator (all movement types)
2. Implement CombatResolver
3. Implement WinConditionChecker
4. Wire up all validators/resolvers in WarInHeavenEngine

### Session 4: Frontend Integration (4-6 hours)
1. Refactor GameView to accept backend state
2. Remove game logic from frontend
3. Implement move submission
4. Add type definitions
5. Test basic flow

### Session 5: Testing & Polish (2-4 hours)
1. Test all special abilities
2. Test victory conditions
3. Fix bugs
4. Performance optimization
5. Final multiplayer testing

---

## Critical Files Reference

### Backend Files
- `/app/Games/Engines/WarInHeaven/WarInHeavenEngine.php` - Main engine
- `/app/Games/Engines/WarInHeaven/Components/HexBoard.php` ✅
- `/app/Games/Engines/WarInHeaven/Components/CardManager.php` ⚠️
- `/app/Games/Engines/WarInHeaven/Components/PieceManager.php` ⚠️
- `/app/Games/Engines/WarInHeaven/Components/MoveValidator.php` ⚠️
- `/app/Games/Engines/WarInHeaven/Components/CombatResolver.php` ⚠️
- `/app/Games/Engines/WarInHeaven/Components/WinConditionChecker.php` ⚠️

### Frontend Files
- `/resources/js/Pages/Games/WarInHeaven.tsx` ✅
- `/resources/js/Pages/Games/WarInHeaven/GameView.tsx` ⚠️ (needs refactor)
- `/resources/js/Pages/Games/WarInHeaven/stores/gameStore.ts` ⚠️ (to be removed)
- `/resources/js/types/index.d.ts` ⚠️ (needs WarInHeavenGameState)

### Reference Files
- `/resources/js/Pages/Games/WarInHeaven/GameView.tsx` (lines 59-485) - Card definitions
- `/reference/games/war-in-heaven/` - All game documentation
- `/reference/games/war-in-heaven/card-images/` - Card assets

---

## Known Challenges

### 1. Complex Movement System
Four different movement types need proper validation:
- Standard: Simple 1-space adjacent
- Uriel/Leviathen: 2-space with phase-through
- Camiel/Asmodeus: Straight-line unlimited
- Jophiel/Belphegor: Push/pull mechanics

**Solution:** Implement each as separate method in MoveValidator

### 2. Special Abilities
Each card has unique abilities requiring special handling:
- Michael: One-time teleport
- Gabriel/Baal: Combat bonus
- Raphael: Free deployment
- Mammon: Extra recharge

**Solution:** Track ability usage in game state, implement as separate methods

### 3. Combat System
Multi-attacker combat with bonuses:
- Multiple tokens can attack one target
- Gabriel/Baal provide +1 attack bonus
- Damage calculation and elimination

**Solution:** Sum all attacks, check for Gabriel/Baal in combat, compare to defense

### 4. State Synchronization
Frontend needs to immediately reflect backend state changes:
- Use WebSocket for real-time updates
- Optimistic UI updates with rollback on error
- Handle concurrent actions

**Solution:** Standard useGameStore pattern handles this automatically

---

## Success Criteria

**Backend:**
- ✅ All components implemented and tested
- ✅ All move types validated correctly
- ✅ All special abilities working
- ✅ Victory conditions accurate
- ✅ State properly serialized/deserialized

**Frontend:**
- ✅ Accepts backend state as props
- ✅ No game logic in frontend
- ✅ Moves submitted to API
- ✅ Real-time updates via WebSocket
- ✅ UI accurately reflects game state

**Integration:**
- ✅ Can create and join games
- ✅ Both players see synchronized state
- ✅ All actions work (move, attack, deploy, recharge)
- ✅ Victory conditions trigger correctly
- ✅ No desync issues

---

## Next Steps for New Session

**Start with:** CardManager implementation
1. Copy card definitions from GameView.tsx lines 59-485
2. Convert TypeScript card data to PHP arrays
3. Implement deck initialization
4. Implement card state management

**File to create:**
`/app/Games/Engines/WarInHeaven/Components/CardManager.php`

**Reference the card data structure from:**
`/resources/js/Pages/Games/WarInHeaven/GameView.tsx`

**Estimated time:** 4-6 hours
