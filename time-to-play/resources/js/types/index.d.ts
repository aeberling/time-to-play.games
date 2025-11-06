// ==================== User Types ====================

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    display_name?: string;
    username?: string;
    avatar_url?: string;
    is_guest?: boolean;
    theme_id?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

// ==================== Game Types ====================

export type GameType = 'WAR' | 'SWOOP' | 'OH_HELL';

export type GameStatus = 'WAITING' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export interface GameConfig {
    minPlayers: number;
    maxPlayers: number;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    estimatedDuration: string;
    requiresStrategy: boolean;
}

export interface GameTypeInfo {
    type: GameType;
    name: string;
    config: GameConfig;
}

export interface TimerConfig {
    turn_time?: number;
    total_time?: number;
}

// ==================== Card Types ====================

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'joker';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'JOKER';

export interface Card {
    suit: Suit;
    rank: Rank;
    value: number;
    imageUrl: string;
}

export interface Player {
    id: number;
    name: string;
    avatar?: string;
}

// ==================== Game Player ====================

export interface GamePlayer {
    id: number;
    game_id: number;
    user_id: number;
    player_index: number;
    is_ready: boolean;
    is_connected: boolean;
    placement?: number;
    score?: number;
    user: User;
}

// ==================== Game Move ====================

export interface GameMove {
    id: number;
    game_id: number;
    player_index: number;
    move_data: Record<string, any>;
    game_state_after: string;
    created_at: string;
}

// ==================== Game Model ====================

export interface Game {
    id: number;
    game_type: GameType;
    status: GameStatus;
    max_players: number;
    timer_config: TimerConfig | null;
    game_options?: Record<string, any> | null;
    current_state: string | null;
    winner_id: number | null;
    created_at: string;
    updated_at: string;
    game_players: GamePlayer[];
    game_moves?: GameMove[];
    winner?: User | null;
}

// ==================== Game State Types ====================

// War Game State
export interface WarGameState {
    players: Player[];
    player1Deck: Card[];
    player2Deck: Card[];
    cardsInPlay: {
        player1: Card[];
        player2: Card[];
    };
    phase: 'FLIP' | 'WAR' | 'GAME_OVER';
    waitingFor: 'PLAYER_1' | 'PLAYER_2' | 'BOTH' | 'NONE';
    turnCount: number;
    warDepth: number;
    lastAction: {
        type: string;
        playerIndex?: number;
        cards?: Card[];
        winner?: number;
    };
}

// Swoop Game State
export interface SwoopGameState {
    players: Player[];
    playerCount: number;
    playerHands: Card[][];
    faceUpCards: Card[][];
    mysteryCards: Card[][];
    playPile: Card[];
    removedCards: Card[];
    currentPlayerIndex: number;
    phase: 'PLAYING' | 'ROUND_OVER' | 'GAME_OVER';
    round: number;
    scores: number[];
    scoreLimit: number;
    scoringMethod: 'beginner' | 'normal';
    lastAction: {
        type: string;
        playerIndex?: number;
        cards?: Card[];
    };
    recentSwoop: string | null;
}

// Oh Hell Game State
export interface OhHellGameState {
    players: Player[];
    playerCount: number;
    maxCards: number;
    scoringVariant: 'standard' | 'partial';
    currentRound: number;
    totalRounds: number;
    cardsThisRound: number;
    isAscending: boolean;
    trumpSuit: string | null;
    trumpCard: Card | null;
    trumpBroken: boolean;
    dealerIndex: number;
    playerHands: Card[][];
    phase: 'BIDDING' | 'PLAYING' | 'ROUND_OVER' | 'GAME_OVER';
    bids: (number | null)[];
    currentBidder: number | null;
    currentTrick: {
        cards: Array<{ playerIndex: number; card: Card }>;
        leadSuit: string | null;
        currentPlayer: number;
    };
    tricksWon: number[];
    completedTricks: any[];
    scores: number[];
    roundScores: number[];
    playersReadyToContinue: boolean[];
    lastAction: {
        type: string;
        playerIndex?: number;
        card?: Card;
        bid?: number;
    };
}

export type GameState = WarGameState | SwoopGameState | OhHellGameState;

// ==================== API Response Types ====================

export interface GameTypesResponse {
    games: GameTypeInfo[];
}

export interface GameListResponse {
    current_page: number;
    data: Game[];
    per_page: number;
    total: number;
}

export interface CreateGameRequest {
    game_type: GameType;
    max_players: number;
    timer_config?: TimerConfig;
}

export interface CreateGameResponse {
    message: string;
    game: Game;
}

export interface GameDetailResponse {
    game: Game;
}

export interface GameStateResponse {
    state: GameState;
}

export interface GameStatsResponse {
    total_moves: number;
    duration: number;
    players: {
        user_id: number;
        name: string;
        placement: number;
        score: number | null;
        moves_made: number;
    }[];
}

export interface StartGameResponse {
    message: string;
    state: GameState;
}

export interface JoinGameResponse {
    message: string;
    game_player: GamePlayer;
}

export interface MakeMoveRequest {
    move: Record<string, any>;
}

export interface MakeMoveResponse {
    message: string;
    state: GameState;
}

export interface ErrorResponse {
    message: string;
    error?: string;
    errors?: Record<string, string[]>;
}

// ==================== WebSocket Event Types ====================

export interface GameStateUpdatedEvent {
    gameId: number;
    gameState: GameState;
    playerIndex: number | null;
    timestamp: string;
}

export interface MoveMadeEvent {
    gameId: number;
    playerIndex: number;
    move: Record<string, any>;
    newGameState: GameState;
    timestamp: string;
}

export interface PlayerJoinedEvent {
    gameId: number;
    userId: number;
    userName: string;
    avatarUrl: string | null;
    timestamp: string;
}

export interface PlayerLeftEvent {
    gameId: number;
    userId: number;
    userName: string;
    timestamp: string;
}
