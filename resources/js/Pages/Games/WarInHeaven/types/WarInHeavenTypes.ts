/**
 * War in Heaven Game TypeScript Types
 */

export interface GameState {
    gameId: string;
    gameType: 'WAR_IN_HEAVEN';
    status: GameStatus;
    players: Player[];
    currentTurn: number;
    turnPhase: TurnPhase;
    round: number;
    board: BoardState;
    cards: CardStates;
    resources: Resources;
    moveHistory: Move[];
    victoryCondition: string | null;
    winner: number | null;
    config: GameConfig;
}

export type GameStatus = 'WAITING' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export type TurnPhase = 'DRAW' | 'MOVEMENT' | 'COMBAT' | 'END';

export interface Player {
    userId: string;
    faction: Faction;
    playerIndex: number;
    isConnected: boolean;
}

export type Faction = 'FACTION1' | 'FACTION2';

export interface BoardState {
    layout: string;
    size: number;
    hexes: Record<string, HexTile>;
}

export interface Resources {
    FACTION1: FactionResources;
    FACTION2: FactionResources;
}

export interface FactionResources {
    victoryPoints: number;
    specialResource: number;
}

export interface CardStates {
    FACTION1: CardState;
    FACTION2: CardState;
}

export interface CardState {
    deck: Card[];
    hand: Card[];
    discard: Card[];
    inPlay: Card[];
}

export interface Card {
    id: string;
    name: string;
    type: CardType;
    faction: Faction;
    attack: number;
    defense: number;
    abilities: string[];
    resourceCost: number;
    description: string;
}

export type CardType = 'ABILITY' | 'SUMMON' | 'EVENT';

export interface Move {
    turn: number;
    player: number;
    action: MoveType;
    data: MoveData;
    timestamp: number;
}

export type MoveType = 'MOVE_PIECE' | 'PLAY_CARD' | 'ATTACK' | 'END_TURN';

export interface MoveData {
    [key: string]: any;
}

export interface GameConfig {
    boardSize: number;
    turnTimeLimit: number;
    victoryPointsToWin: number;
    startingHandSize: number;
}

export interface HexTile {
    q: number;
    r: number;
    s: number;
    terrain: TerrainType;
    piece: Piece | null;
}

export type TerrainType = 'normal' | 'defensive' | 'objective' | 'impassable';

export interface Piece {
    id: string;
    type: PieceType;
    faction: Faction;
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    movementRange: number;
    attackRange: number;
    abilities: string[];
    hasMoved: boolean;
}

export type PieceType = string; // Defined per faction in piece data

export interface HexPosition {
    q: number;
    r: number;
}

export interface ValidationResult {
    valid: boolean;
    message?: string;
}
