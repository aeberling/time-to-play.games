# War in Heaven - Data Structures & Game Objects

## Overview

This document defines the complete data structures for implementing War in Heaven, including cards, pieces, board state, and game flow.

---

## Character Cards

### Card Object Structure

```typescript
interface CharacterCard {
  // Identity
  id: string;                    // Unique identifier (e.g., "angel_michael", "demon_lucifer")
  name: string;                  // Display name (e.g., "Michael", "Lucifer")
  faction: 'angels' | 'demons';  // Faction affiliation
  subtype: 'commander' | 'troop' | 'ally'; // Card type

  // Stats
  cost: number;                  // Deploy cost (0-3 tokens)
  attack: number;                // Attack value (0-6)
  defense: number;               // Defense/Defeat value (1-6)

  // Visual
  colorHex: string;              // Faction color (#FFB200 or #7F0212)
  circleIcon: string;            // Icon URL for token
  cardImage: string;             // Full card image URL
  specialImage?: string;         // Special ability icon URL (optional)
  specialMapImage?: string;      // Icon for map/board display (optional)

  // Text
  flavorText: string;            // Flavor text for card
  specialText?: string;          // Special ability description

  // Abilities
  abilities: Ability[];          // Array of ability objects

  // Token tracking
  quantity: number;              // Number of tokens (1 for most, 4 for troops)
  tokensAvailable: number;       // How many tokens are not eliminated
  tokensActive: number;          // How many tokens are currently active (face-up)
}
```

### Ability Object Structure

```typescript
interface Ability {
  id: string;                    // Unique ability identifier
  type: AbilityType;             // Type of ability
  trigger: AbilityTrigger;       // When the ability activates
  effect: AbilityEffect;         // What the ability does
  target?: AbilityTarget;        // Who/what the ability affects
  value?: number | string;       // Numerical or string value for effect
  restrictions?: string[];       // Any restrictions on usage
  usesPerGame?: number;          // Limits (e.g., 1 for Commander ability)
  usesRemaining?: number;        // Tracking for limited-use abilities
}

type AbilityType =
  | 'movement'           // Enhanced movement
  | 'triggered'          // Activates at specific time
  | 'passive'            // Continuous effect
  | 'oneTime'            // Use once per game
  | 'winCondition';      // Alternative victory

type AbilityTrigger =
  | 'onDeploy'           // When token is deployed
  | 'startOfRound'       // Beginning of each round
  | 'endOfMove'          // After this token moves
  | 'endOfTurn'          // End of player's turn
  | 'onBattle'           // During combat
  | 'passive'            // Always active
  | 'manual';            // Player activates

type AbilityEffect =
  | 'moveExtra'          // Move extra spaces
  | 'moveThroughUnits'   // Move through occupied hexes
  | 'moveUnlimited'      // Move unlimited in straight line
  | 'pullEnemies'        // Pull enemy troops closer
  | 'pushEnemies'        // Push enemy troops away
  | 'recharge'           // Flip token to active
  | 'deployFree'         // Deploy without cost
  | 'boostStats'         // Increase attack/defense
  | 'teleport'           // Move token to adjacent hex
  | 'checkWin';          // Check alternative win condition

interface AbilityTarget {
  who: 'self' | 'allies' | 'enemies' | 'troops' | 'commander' | 'all';
  scope: 'adjacent' | 'straightLine' | 'battlefield' | 'offBattlefield';
  filter?: string;       // Additional filtering (e.g., "troops only")
}
```

### Complete Card Data

#### Angels Faction

```json
{
  "angels": [
    {
      "id": "angel_michael",
      "name": "Michael",
      "faction": "angels",
      "subtype": "commander",
      "cost": 0,
      "attack": 5,
      "defense": 6,
      "colorHex": "#FFB200",
      "circleIcon": "/assets/games/war-in-heaven/icons/iconmichael.png",
      "cardImage": "/assets/games/war-in-heaven/cards/michael.png",
      "specialImage": "/assets/games/war-in-heaven/icons/refresh.png",
      "specialMapImage": "/assets/games/war-in-heaven/icons/iconmichael.png",
      "flavorText": "Defender of faith, protector of souls and symbol of divine justice.",
      "specialText": "Once per game, may move one of your Allies or Troops on the Battle Field to a space adjacent to Michael.",
      "quantity": 1,
      "abilities": [
        {
          "id": "michael_teleport",
          "type": "oneTime",
          "trigger": "manual",
          "effect": "teleport",
          "target": {
            "who": "allies",
            "scope": "battlefield"
          },
          "usesPerGame": 1,
          "usesRemaining": 1,
          "restrictions": ["Must move to hex adjacent to Michael"]
        }
      ]
    },
    {
      "id": "angel_militia",
      "name": "Heaven's Militia",
      "faction": "angels",
      "subtype": "troop",
      "cost": 0,
      "attack": 1,
      "defense": 1,
      "colorHex": "#FFB200",
      "circleIcon": "/assets/games/war-in-heaven/icons/iconmilitia.png",
      "cardImage": "/assets/games/war-in-heaven/cards/militia.png",
      "specialMapImage": "/assets/games/war-in-heaven/icons/iconmilitia.png",
      "flavorText": "Symbols of justice and might, deliverers of God's Wrath, and the bane of wickedness.",
      "specialText": "Start the game with 4 Troops on the Battle Field.",
      "quantity": 4,
      "abilities": []
    },
    {
      "id": "angel_uriel",
      "name": "Uriel",
      "faction": "angels",
      "subtype": "ally",
      "cost": 1,
      "attack": 3,
      "defense": 2,
      "colorHex": "#FFB200",
      "circleIcon": "/assets/games/war-in-heaven/icons/iconuriel.png",
      "cardImage": "/assets/games/war-in-heaven/cards/uriel.png",
      "specialMapImage": "/assets/games/war-in-heaven/icons/iconuriel.png",
      "flavorText": "At least wars can end, diseases can be cured, and evil can be vanquished. But stupidity? That thing is about as ever-lasting as His glory.",
      "specialText": "Moves 2 spaces in any direction. May move through occupied spaces.",
      "quantity": 1,
      "abilities": [
        {
          "id": "uriel_movement",
          "type": "movement",
          "trigger": "passive",
          "effect": "moveExtra",
          "value": 2
        },
        {
          "id": "uriel_phase",
          "type": "movement",
          "trigger": "passive",
          "effect": "moveThroughUnits"
        }
      ]
    },
    {
      "id": "angel_jophiel",
      "name": "Jophiel",
      "faction": "angels",
      "subtype": "ally",
      "cost": 2,
      "attack": 2,
      "defense": 4,
      "colorHex": "#FFB200",
      "circleIcon": "/assets/games/war-in-heaven/icons/iconjophiel.png",
      "cardImage": "/assets/games/war-in-heaven/cards/jophiel.png",
      "specialMapImage": "/assets/games/war-in-heaven/icons/iconjophiel.png",
      "flavorText": "Beauty of God.",
      "specialText": "At the end of her move, each opponent's Troops in a straight line to her moves one space closer to her.",
      "quantity": 1,
      "abilities": [
        {
          "id": "jophiel_pull",
          "type": "triggered",
          "trigger": "endOfMove",
          "effect": "pullEnemies",
          "target": {
            "who": "troops",
            "scope": "straightLine"
          },
          "value": 1
        }
      ]
    },
    {
      "id": "angel_raphael",
      "name": "Raphael",
      "faction": "angels",
      "subtype": "ally",
      "cost": 3,
      "attack": 0,
      "defense": 4,
      "colorHex": "#FFB200",
      "circleIcon": "/assets/games/war-in-heaven/icons/iconraphael.png",
      "cardImage": "/assets/games/war-in-heaven/cards/raphael.png",
      "specialMapImage": "/assets/games/war-in-heaven/icons/iconraphael.png",
      "flavorText": "Heal the earth which the fallen angels have defiled.",
      "specialText": "At the start of each Round, may Deploy 1 of your ready or depleted Troops to the battlefield for free.",
      "quantity": 1,
      "abilities": [
        {
          "id": "raphael_resurrect",
          "type": "triggered",
          "trigger": "startOfRound",
          "effect": "deployFree",
          "target": {
            "who": "troops",
            "scope": "offBattlefield"
          },
          "restrictions": ["Can only deploy Troop tokens", "Deploys to Deploy spaces"]
        }
      ]
    },
    {
      "id": "angel_camiel",
      "name": "Camiel",
      "faction": "angels",
      "subtype": "ally",
      "cost": 1,
      "attack": 6,
      "defense": 2,
      "colorHex": "#FFB200",
      "circleIcon": "/assets/games/war-in-heaven/icons/iconcamiel.png",
      "cardImage": "/assets/games/war-in-heaven/cards/camiel.png",
      "specialMapImage": "/assets/games/war-in-heaven/icons/iconcamiel.png",
      "flavorText": "Strength, courage and war.",
      "specialText": "Can move any number of spaces in a straight line. Cannot move onto or past Pearly Gate spaces.",
      "quantity": 1,
      "abilities": [
        {
          "id": "camiel_movement",
          "type": "movement",
          "trigger": "passive",
          "effect": "moveUnlimited",
          "restrictions": ["Cannot move onto Gate/Bridge spaces", "Cannot move past Gate/Bridge spaces"]
        }
      ]
    },
    {
      "id": "angel_zadkiel",
      "name": "Zadkiel",
      "faction": "angels",
      "subtype": "ally",
      "cost": 2,
      "attack": 1,
      "defense": 3,
      "colorHex": "#FFB200",
      "circleIcon": "/assets/games/war-in-heaven/icons/iconzadkiel.png",
      "cardImage": "/assets/games/war-in-heaven/cards/zadkiel.png",
      "specialMapImage": "/assets/games/war-in-heaven/icons/iconzadkiel.png",
      "flavorText": "The righteousness of God.",
      "specialText": "WIN if you control the Pearly Gates by occupying all 4 spaces.",
      "quantity": 1,
      "abilities": [
        {
          "id": "zadkiel_win",
          "type": "winCondition",
          "trigger": "endOfTurn",
          "effect": "checkWin",
          "restrictions": ["Must occupy all 4 Gate/Bridge spaces (A5, B5, C5, D5)"]
        }
      ]
    },
    {
      "id": "angel_gabriel",
      "name": "Gabriel",
      "faction": "angels",
      "subtype": "ally",
      "cost": 3,
      "attack": 3,
      "defense": 3,
      "colorHex": "#FFB200",
      "circleIcon": "/assets/games/war-in-heaven/icons/icongabriel.png",
      "cardImage": "/assets/games/war-in-heaven/cards/gabriel.png",
      "specialMapImage": "/assets/games/war-in-heaven/icons/icongabriel.png",
      "flavorText": "Messenger of God.",
      "specialText": "Bolster your Troops by +2 Attack and +2 Defense.",
      "quantity": 1,
      "abilities": [
        {
          "id": "gabriel_boost",
          "type": "passive",
          "trigger": "passive",
          "effect": "boostStats",
          "target": {
            "who": "troops",
            "scope": "battlefield"
          },
          "value": "+2/+2"
        }
      ]
    }
  ]
}
```

#### Demons Faction

```json
{
  "demons": [
    {
      "id": "demon_lucifer",
      "name": "Lucifer",
      "faction": "demons",
      "subtype": "commander",
      "cost": 0,
      "attack": 5,
      "defense": 6,
      "colorHex": "#7F0212",
      "circleIcon": "/assets/games/war-in-heaven/icons/iconlucifer.png",
      "cardImage": "/assets/games/war-in-heaven/cards/lucifer.png",
      "specialImage": "/assets/games/war-in-heaven/icons/refresh.png",
      "flavorText": "Lucifer was extremely prideful and rebelled against his Father.",
      "specialText": "Once per game, may move one of your Allies or Troops on the Battle Field to a space adjacent to Lucifer.",
      "quantity": 1,
      "abilities": [
        {
          "id": "lucifer_teleport",
          "type": "oneTime",
          "trigger": "manual",
          "effect": "teleport",
          "target": {
            "who": "allies",
            "scope": "battlefield"
          },
          "usesPerGame": 1,
          "usesRemaining": 1,
          "restrictions": ["Must move to hex adjacent to Lucifer"]
        }
      ]
    },
    {
      "id": "demon_fallen",
      "name": "Fallen Angels",
      "faction": "demons",
      "subtype": "troop",
      "cost": 0,
      "attack": 1,
      "defense": 1,
      "colorHex": "#7F0212",
      "circleIcon": "/assets/games/war-in-heaven/icons/iconfallenangels.png",
      "cardImage": "/assets/games/war-in-heaven/cards/fallen.png",
      "flavorText": "How art thou fallen from heaven.",
      "specialText": "Start the game with 4 Troops on the Battle Field.",
      "quantity": 4,
      "abilities": []
    },
    {
      "id": "demon_leviathen",
      "name": "Leviathen",
      "faction": "demons",
      "subtype": "ally",
      "cost": 1,
      "attack": 3,
      "defense": 2,
      "colorHex": "#7F0212",
      "circleIcon": "/assets/games/war-in-heaven/icons/iconleviathen.png",
      "cardImage": "/assets/games/war-in-heaven/cards/leviathen.png",
      "flavorText": "Demon of the deadly sin envy.",
      "specialText": "Moves 2 spaces in any direction. May move through occupied spaces.",
      "quantity": 1,
      "abilities": [
        {
          "id": "leviathen_movement",
          "type": "movement",
          "trigger": "passive",
          "effect": "moveExtra",
          "value": 2
        },
        {
          "id": "leviathen_phase",
          "type": "movement",
          "trigger": "passive",
          "effect": "moveThroughUnits"
        }
      ]
    },
    {
      "id": "demon_belphegor",
      "name": "Belphegor",
      "faction": "demons",
      "subtype": "ally",
      "cost": 2,
      "attack": 2,
      "defense": 4,
      "colorHex": "#7F0212",
      "circleIcon": "/assets/games/war-in-heaven/icons/iconbelphegor.png",
      "cardImage": "/assets/games/war-in-heaven/cards/belphegor.png",
      "flavorText": "Demon of the deadly sin sloth.",
      "specialText": "At the end of his move, each opponent's Troops in a straight line to him moves one space away from him.",
      "quantity": 1,
      "abilities": [
        {
          "id": "belphegor_push",
          "type": "triggered",
          "trigger": "endOfMove",
          "effect": "pushEnemies",
          "target": {
            "who": "troops",
            "scope": "straightLine"
          },
          "value": 1
        }
      ]
    },
    {
      "id": "demon_mammon",
      "name": "Mammon",
      "faction": "demons",
      "subtype": "ally",
      "cost": 3,
      "attack": 0,
      "defense": 4,
      "colorHex": "#7F0212",
      "circleIcon": "/assets/games/war-in-heaven/icons/iconmammon.png",
      "cardImage": "/assets/games/war-in-heaven/cards/mammon.png",
      "flavorText": "Demon of the deadly sin greed.",
      "specialText": "At the start of each Round, may recharge up to one token. This is in addition to normal Recharge game rule.",
      "quantity": 1,
      "abilities": [
        {
          "id": "mammon_recharge",
          "type": "triggered",
          "trigger": "startOfRound",
          "effect": "recharge",
          "target": {
            "who": "allies",
            "scope": "offBattlefield"
          },
          "value": 1,
          "restrictions": ["In addition to standard recharge"]
        }
      ]
    },
    {
      "id": "demon_asmodeus",
      "name": "Asmodeus",
      "faction": "demons",
      "subtype": "ally",
      "cost": 1,
      "attack": 6,
      "defense": 2,
      "colorHex": "#7F0212",
      "circleIcon": "/assets/games/war-in-heaven/icons/iconasmodeus.png",
      "cardImage": "/assets/games/war-in-heaven/cards/asmodeus.png",
      "flavorText": "Demon of the deadly sin lust.",
      "specialText": "Can move any number of spaces in a straight line. Cannot move onto or past Pearly Gate spaces.",
      "quantity": 1,
      "abilities": [
        {
          "id": "asmodeus_movement",
          "type": "movement",
          "trigger": "passive",
          "effect": "moveUnlimited",
          "restrictions": ["Cannot move onto Gate/Bridge spaces", "Cannot move past Gate/Bridge spaces"]
        }
      ]
    },
    {
      "id": "demon_beelzebub",
      "name": "Beelzebub",
      "faction": "demons",
      "subtype": "ally",
      "cost": 2,
      "attack": 1,
      "defense": 3,
      "colorHex": "#7F0212",
      "circleIcon": "/assets/games/war-in-heaven/icons/iconbeelzebub.png",
      "cardImage": "/assets/games/war-in-heaven/cards/beelzebub.png",
      "flavorText": "Demon of the deadly sin gluttony.",
      "specialText": "WIN if all of your Allies are on the Battle Field.",
      "quantity": 1,
      "abilities": [
        {
          "id": "beelzebub_win",
          "type": "winCondition",
          "trigger": "endOfTurn",
          "effect": "checkWin",
          "restrictions": ["All 6 Ally tokens must be on battlefield"]
        }
      ]
    },
    {
      "id": "demon_baal",
      "name": "Baal",
      "faction": "demons",
      "subtype": "ally",
      "cost": 3,
      "attack": 3,
      "defense": 3,
      "colorHex": "#7F0212",
      "circleIcon": "/assets/games/war-in-heaven/icons/iconbaal.png",
      "cardImage": "/assets/games/war-in-heaven/cards/baal.png",
      "flavorText": "Demon of the deadly sin fear.",
      "specialText": "Bolster Lucifer by +2 Attack and +2 Defense.",
      "quantity": 1,
      "abilities": [
        {
          "id": "baal_boost",
          "type": "passive",
          "trigger": "passive",
          "effect": "boostStats",
          "target": {
            "who": "commander",
            "scope": "battlefield"
          },
          "value": "+2/+2"
        }
      ]
    }
  ]
}
```

---

## Game Tokens (Pieces)

### Token Object Structure

```typescript
interface GameToken {
  // Identity
  id: string;                    // Unique token ID (e.g., "angel_michael_1", "demon_troop_3")
  cardId: string;                // Reference to parent card
  faction: 'angels' | 'demons';  // Faction
  subtype: 'commander' | 'troop' | 'ally'; // Type
  name: string;                  // Display name

  // State
  location: TokenLocation;       // Where the token currently is
  state: 'active' | 'inactive';  // Active (face-up) or Inactive (face-down)
  position?: string;             // Board position if on battlefield (e.g., "B2")

  // Stats (copied from card, may be modified by abilities)
  baseAttack: number;            // Base attack value
  baseDefense: number;           // Base defense value
  currentAttack: number;         // Current attack (after modifiers)
  currentDefense: number;        // Current defense (after modifiers)

  // Tracking
  hasMoved: boolean;             // Has moved this turn
  hasAttacked: boolean;          // Has attacked this turn
  modifiers: TokenModifier[];    // Active modifiers affecting this token
}

type TokenLocation =
  | 'battlefield'      // On the board
  | 'card'            // Off battlefield, on card
  | 'eliminated';     // Removed from game (but can be resurrected)

interface TokenModifier {
  source: string;      // What's causing this modifier (e.g., "gabriel_boost")
  type: 'attack' | 'defense' | 'movement';
  value: number;
  duration: 'permanent' | 'turn' | 'round';
}
```

---

## Board State

### Complete Game State Structure

```typescript
interface GameState {
  // Game metadata
  gameId: string;
  gameType: 'WAR_IN_HEAVEN';
  status: GameStatus;
  createdAt: string;
  updatedAt: string;

  // Players
  players: [Player, Player];

  // Game flow
  currentRound: number;          // 1-12
  currentTurn: 0 | 1;            // Player index
  currentPhase: GamePhase;
  firstPlayer: 0 | 1;            // Who goes first
  actionsRemaining: number;      // Actions left this turn

  // Board
  board: BoardState;

  // Cards & Tokens
  cards: {
    angels: CharacterCard[];
    demons: CharacterCard[];
  };
  tokens: {
    angels: GameToken[];
    demons: GameToken[];
  };

  // History
  moveHistory: Move[];
  battleHistory: BattleResult[];

  // Victory
  winner: null | 0 | 1;
  victoryCondition: null | VictoryCondition;
}

type GameStatus =
  | 'WAITING'        // Waiting for players
  | 'READY'          // Ready to start
  | 'IN_PROGRESS'    // Game ongoing
  | 'COMPLETED'      // Game finished
  | 'ABANDONED';     // Game abandoned

type GamePhase =
  | 'RECHARGE'       // Start of round recharge
  | 'ACTION'         // Player taking actions
  | 'BATTLE'         // Resolving battle
  | 'END_TURN'       // End of turn checks
  | 'END_ROUND'      // End of round
  | 'GAME_OVER';     // Game finished

interface Player {
  userId: string;
  playerIndex: 0 | 1;
  faction: 'angels' | 'demons';
  isConnected: boolean;
  deploySpaces: string[];        // e.g., ["A1", "B1"] for angels
}

interface BoardState {
  hexes: Record<string, HexState>;  // Key = hex coordinate (e.g., "B2")
}

interface HexState {
  coordinate: string;            // e.g., "B2"
  type: 'standard' | 'deploy' | 'gate';
  owner?: 'angels' | 'demons';   // For deploy spaces
  occupiedBy: string | null;     // Token ID or null
}

type VictoryCondition =
  | 'COMMANDER_DEFEATED'         // Defeated opponent's commander
  | 'ZADKIEL_GATES'              // Zadkiel: Control all 4 gates
  | 'BEELZEBUB_ALLIES'           // Beelzebub: All allies deployed
  | 'ROUND_12_ALLIES'            // Most allies on battlefield
  | 'ROUND_12_TOKENS';           // Most tokens on battlefield
```

---

## Move & Action Structures

### Move Object

```typescript
interface Move {
  // Identity
  moveId: string;
  playerIndex: 0 | 1;
  round: number;
  turnPhase: GamePhase;
  timestamp: string;

  // Action details
  action: ActionType;
  tokenId: string;               // Token performing action

  // Movement-specific
  from?: string;                 // Starting hex (for movement)
  to?: string;                   // Ending hex (for movement)
  path?: string[];               // Path taken (for multi-hex moves)

  // Deploy-specific
  deployed?: {
    tokenId: string;
    costPaid: string[];          // Token IDs flipped to pay cost
    deploySpace: string;
  };

  // Battle-specific
  battle?: {
    attackers: string[];         // Token IDs
    defenders: string[];         // Token IDs
    location: string;            // Where battle occurred
  };

  // Ability-specific
  ability?: {
    abilityId: string;
    targets: string[];
    effect: any;
  };

  // Result
  success: boolean;
  error?: string;
}

type ActionType =
  | 'MOVE'           // Move a token
  | 'DEPLOY'         // Deploy a token
  | 'BATTLE'         // Declare battle
  | 'ABILITY'        // Use special ability
  | 'END_TURN'       // End turn
  | 'RECHARGE';      // Recharge token
```

### Battle Result

```typescript
interface BattleResult {
  battleId: string;
  round: number;
  location: string;              // Hex coordinate where battle occurred
  attackingPlayer: 0 | 1;

  // Participants
  attackers: BattleParticipant[];
  defenders: BattleParticipant[];

  // Results
  attackerLosses: string[];      // Token IDs eliminated
  defenderLosses: string[];      // Token IDs eliminated
  damageDealt: Record<string, number>; // Token ID => damage dealt

  // Combat log
  combatLog: string[];           // Step-by-step combat resolution
  timestamp: string;
}

interface BattleParticipant {
  tokenId: string;
  attack: number;                // Attack value (with modifiers)
  defense: number;               // Defense value (with modifiers)
  position: string;              // Hex position
  survived: boolean;
}
```

---

## Validation Structures

### Move Validation

```typescript
interface MoveValidation {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

// Common validation error codes
const VALIDATION_ERRORS = {
  INVALID_HEX: 'Invalid hex coordinate',
  HEX_OCCUPIED: 'Destination hex is occupied',
  NOT_ADJACENT: 'Destination is not adjacent',
  OUT_OF_RANGE: 'Movement exceeds token range',
  WRONG_PLAYER: 'Not your token',
  TOKEN_INACTIVE: 'Token is inactive',
  TOKEN_NOT_ON_BOARD: 'Token is not on battlefield',
  INSUFFICIENT_RESOURCES: 'Not enough tokens to pay cost',
  INVALID_DEPLOY_SPACE: 'Cannot deploy to this space',
  NO_BATTLE_AVAILABLE: 'No valid battle participants',
  GATE_BLOCKED: 'Cannot move onto/past Gate spaces',
  ABILITY_ALREADY_USED: 'Ability already used',
  NOT_YOUR_TURN: 'Not your turn',
  NO_ACTIONS_REMAINING: 'No actions remaining'
};
```

---

## Helper Functions & Constants

### Game Constants

```typescript
const GAME_CONSTANTS = {
  MAX_ROUNDS: 12,
  STANDARD_ACTIONS_PER_TURN: 3,
  EXTENDED_ACTIONS_PER_TURN: 4,  // From round 8+
  EXTENDED_ACTIONS_START_ROUND: 8,
  FIRST_PLAYER_FIRST_TURN_ACTIONS: 2,

  GATE_HEXES: ['A5', 'B5', 'C5', 'D5'],
  ANGEL_DEPLOY_HEXES: ['A1', 'B1'],
  DEMON_DEPLOY_HEXES: ['A9', 'B9'],

  ANGEL_STARTING_POSITIONS: {
    commander: 'B2',
    troops: ['A3', 'B3', 'C3', 'D3']
  },
  DEMON_STARTING_POSITIONS: {
    commander: 'B8',
    troops: ['A7', 'B7', 'C7', 'D7']
  }
};
```

### Initial State Generator

```typescript
function generateInitialGameState(
  player1: Player,
  player2: Player
): GameState {
  // Implementation would create full initial state
  // with all cards, tokens, board hexes, etc.
}
```

---

## Summary

This data structure specification provides:

1. **Complete card definitions** for both factions with all stats and abilities
2. **Token tracking** for battlefield and card states
3. **Board state** with hex-based coordinate system
4. **Move validation** and action tracking
5. **Battle resolution** structures
6. **Game flow** management (rounds, turns, phases)
7. **Victory conditions** tracking

All structures are designed to be:
- **Type-safe** (using TypeScript interfaces)
- **Serializable** (can be stored in database/Redis)
- **Modular** (easy to extend with new cards/abilities)
- **Consistent** with the game rules

Next steps would include implementing these structures in both backend (PHP/Laravel) and frontend (TypeScript/React).
