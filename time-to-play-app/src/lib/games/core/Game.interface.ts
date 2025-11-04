/**
 * Core game interface that all games must implement
 */

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
  value: number; // For comparison
}

export interface Player {
  userId: string;
  displayName: string;
  playerNumber: number;
}

export interface GameConfig {
  gameType: string;
  players: Player[];
  timerConfig?: {
    type: 'BLITZ' | 'RAPID' | 'STANDARD' | 'CASUAL' | 'UNTIMED';
    timePerTurn?: number;
    totalTime?: number;
  };
}

export interface MoveResult {
  success: boolean;
  error?: string;
  gameData?: any;
  gameOver?: boolean;
  winner?: string;
  tie?: boolean;
}

/**
 * Base game interface
 */
export interface Game {
  /**
   * Initialize a new game
   */
  initialize(config: GameConfig): any;

  /**
   * Validate a move
   */
  validateMove(gameData: any, move: any, userId: string): Promise<boolean>;

  /**
   * Process a move and return updated game state
   */
  processMove(gameData: any, move: any, userId: string): Promise<MoveResult>;

  /**
   * Check if game is over
   */
  isGameOver(gameData: any): boolean;

  /**
   * Get winner(s)
   */
  getWinner(gameData: any): string | string[] | null;

  /**
   * Get game rules/description
   */
  getRules(): string;

  /**
   * Get current game status for display
   */
  getStatus(gameData: any): string;
}

/**
 * Game factory for creating game instances
 */
export class GameFactory {
  private static games: Map<string, new () => Game> = new Map();

  static register(gameType: string, gameClass: new () => Game) {
    this.games.set(gameType, gameClass);
  }

  static create(gameType: string): Game | null {
    const GameClass = this.games.get(gameType);
    if (!GameClass) {
      return null;
    }
    return new GameClass();
  }

  static getSupportedGames(): string[] {
    return Array.from(this.games.keys());
  }
}
