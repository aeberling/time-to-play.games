import { redis } from '@/lib/redis';
import { prisma } from '@/lib/db';

/**
 * Game state structure stored in Redis
 */
export interface GameState {
  gameId: string;
  gameType: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  players: {
    userId: string;
    displayName: string;
    playerNumber: number;
    isReady: boolean;
    isConnected: boolean;
  }[];
  currentTurn?: number; // Player number whose turn it is
  gameData: any; // Game-specific state (cards, board, etc.)
  timerConfig?: {
    type: 'BLITZ' | 'RAPID' | 'STANDARD' | 'CASUAL' | 'UNTIMED';
    timePerTurn?: number; // seconds
    totalTime?: number; // seconds per player
  };
  turnStartedAt?: number; // timestamp
  createdAt: number;
  updatedAt: number;
  lastMoveAt?: number;
}

/**
 * Game state manager - handles Redis caching and DB persistence
 */
export class GameStateManager {
  private static readonly STATE_TTL = 60 * 60 * 24; // 24 hours
  private static readonly STATE_KEY_PREFIX = 'game:state:';

  /**
   * Get game state from Redis (with DB fallback)
   */
  static async getState(gameId: string): Promise<GameState | null> {
    try {
      // Try Redis first
      const cached = await redis.get<GameState>(`${this.STATE_KEY_PREFIX}${gameId}`);
      if (cached) {
        return cached;
      }

      // Fallback to database
      const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
          players: {
            include: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                },
              },
            },
          },
        },
      });

      if (!game) {
        return null;
      }

      // Reconstruct state from DB
      const state: GameState = {
        gameId: game.id,
        gameType: game.gameType,
        status: game.status as GameState['status'],
        players: game.players.map((p) => ({
          userId: p.userId,
          displayName: p.user.displayName,
          playerNumber: p.playerNumber,
          isReady: p.isReady,
          isConnected: false, // Will be updated by socket connections
        })),
        currentTurn: game.currentTurn || undefined,
        gameData: game.stateSnapshot || {},
        timerConfig: game.timerConfig as GameState['timerConfig'],
        createdAt: game.createdAt.getTime(),
        updatedAt: game.updatedAt.getTime(),
        lastMoveAt: game.startedAt?.getTime(),
      };

      // Cache in Redis
      await this.setState(gameId, state);

      return state;
    } catch (error) {
      console.error('Error getting game state:', error);
      return null;
    }
  }

  /**
   * Set game state in Redis
   */
  static async setState(gameId: string, state: GameState): Promise<void> {
    try {
      state.updatedAt = Date.now();
      await redis.set(`${this.STATE_KEY_PREFIX}${gameId}`, state, {
        ex: this.STATE_TTL,
      });
    } catch (error) {
      console.error('Error setting game state:', error);
      throw error;
    }
  }

  /**
   * Update specific fields in game state
   */
  static async updateState(
    gameId: string,
    updates: Partial<GameState>
  ): Promise<GameState | null> {
    try {
      const currentState = await this.getState(gameId);
      if (!currentState) {
        return null;
      }

      const newState: GameState = {
        ...currentState,
        ...updates,
        updatedAt: Date.now(),
      };

      await this.setState(gameId, newState);
      return newState;
    } catch (error) {
      console.error('Error updating game state:', error);
      return null;
    }
  }

  /**
   * Update player connection status
   */
  static async updatePlayerConnection(
    gameId: string,
    userId: string,
    isConnected: boolean
  ): Promise<void> {
    try {
      const state = await this.getState(gameId);
      if (!state) return;

      const playerIndex = state.players.findIndex((p) => p.userId === userId);
      if (playerIndex === -1) return;

      state.players[playerIndex].isConnected = isConnected;
      await this.setState(gameId, state);
    } catch (error) {
      console.error('Error updating player connection:', error);
    }
  }

  /**
   * Update player ready status
   */
  static async updatePlayerReady(
    gameId: string,
    userId: string,
    isReady: boolean
  ): Promise<void> {
    try {
      const state = await this.getState(gameId);
      if (!state) return;

      const playerIndex = state.players.findIndex((p) => p.userId === userId);
      if (playerIndex === -1) return;

      state.players[playerIndex].isReady = isReady;
      await this.setState(gameId, state);
    } catch (error) {
      console.error('Error updating player ready status:', error);
    }
  }

  /**
   * Save state snapshot to database
   */
  static async saveSnapshot(gameId: string): Promise<void> {
    try {
      const state = await this.getState(gameId);
      if (!state) return;

      await prisma.game.update({
        where: { id: gameId },
        data: {
          status: state.status,
          currentTurn: state.currentTurn,
          stateSnapshot: state.gameData,
          updatedAt: new Date(state.updatedAt),
        },
      });
    } catch (error) {
      console.error('Error saving game snapshot:', error);
      throw error;
    }
  }

  /**
   * Delete game state from Redis
   */
  static async deleteState(gameId: string): Promise<void> {
    try {
      await redis.del(`${this.STATE_KEY_PREFIX}${gameId}`);
    } catch (error) {
      console.error('Error deleting game state:', error);
    }
  }

  /**
   * Check if all players are ready
   */
  static async areAllPlayersReady(gameId: string): Promise<boolean> {
    const state = await this.getState(gameId);
    if (!state) return false;
    return state.players.every((p) => p.isReady);
  }

  /**
   * Check if all players are connected
   */
  static async areAllPlayersConnected(gameId: string): Promise<boolean> {
    const state = await this.getState(gameId);
    if (!state) return false;
    return state.players.every((p) => p.isConnected);
  }

  /**
   * Get current player's turn
   */
  static async getCurrentPlayer(gameId: string): Promise<string | null> {
    const state = await this.getState(gameId);
    if (!state || !state.currentTurn) return null;

    const player = state.players.find((p) => p.playerNumber === state.currentTurn);
    return player?.userId || null;
  }

  /**
   * Advance to next player's turn
   */
  static async nextTurn(gameId: string): Promise<void> {
    try {
      const state = await this.getState(gameId);
      if (!state) return;

      const currentTurn = state.currentTurn || 1;
      const nextTurn = (currentTurn % state.players.length) + 1;

      await this.updateState(gameId, {
        currentTurn: nextTurn,
        turnStartedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error advancing turn:', error);
      throw error;
    }
  }
}

/**
 * Move validator interface
 */
export interface MoveValidator {
  validate(gameState: GameState, move: any, userId: string): Promise<MoveValidationResult>;
}

export interface MoveValidationResult {
  valid: boolean;
  error?: string;
  updatedGameData?: any;
}

/**
 * Base move validator with common validation logic
 */
export class BaseMoveValidator implements MoveValidator {
  async validate(
    gameState: GameState,
    move: any,
    userId: string
  ): Promise<MoveValidationResult> {
    // Check game is in progress
    if (gameState.status !== 'IN_PROGRESS') {
      return {
        valid: false,
        error: 'Game is not in progress',
      };
    }

    // Check it's the player's turn
    const player = gameState.players.find((p) => p.userId === userId);
    if (!player) {
      return {
        valid: false,
        error: 'Player not in game',
      };
    }

    if (gameState.currentTurn && player.playerNumber !== gameState.currentTurn) {
      return {
        valid: false,
        error: 'Not your turn',
      };
    }

    // Check time limit if applicable
    if (gameState.timerConfig?.timePerTurn && gameState.turnStartedAt) {
      const elapsed = (Date.now() - gameState.turnStartedAt) / 1000;
      if (elapsed > gameState.timerConfig.timePerTurn) {
        return {
          valid: false,
          error: 'Time limit exceeded',
        };
      }
    }

    return { valid: true };
  }
}
