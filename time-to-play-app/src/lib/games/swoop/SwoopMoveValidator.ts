import {
  GameState,
  MoveValidator,
  MoveValidationResult,
  BaseMoveValidator,
} from '@/lib/game/state';
import { SwoopGame, SwoopGameData, SwoopMove } from './SwoopGame';

/**
 * Swoop-specific move validator
 */
export class SwoopMoveValidator
  extends BaseMoveValidator
  implements MoveValidator
{
  private swoopGame: SwoopGame;

  constructor() {
    super();
    this.swoopGame = new SwoopGame();
  }

  async validate(
    gameState: GameState,
    move: any,
    userId: string
  ): Promise<MoveValidationResult> {
    // First run base validation (turn, status, timer)
    const baseValidation = await super.validate(gameState, move, userId);
    if (!baseValidation.valid) {
      return baseValidation;
    }

    // Swoop-specific validation
    const swoopMove = move as SwoopMove;
    const gameData = gameState.gameData as SwoopGameData;

    // Validate the move using Swoop game logic
    const isValid = await this.swoopGame.validateMove(
      gameData,
      swoopMove,
      userId
    );

    if (!isValid) {
      return {
        valid: false,
        error: 'Invalid move for Swoop game',
      };
    }

    // Process the move to get updated game data
    const result = await this.swoopGame.processMove(
      gameData,
      swoopMove,
      userId
    );

    if (!result.success) {
      return {
        valid: false,
        error: result.error || 'Move processing failed',
      };
    }

    return {
      valid: true,
      updatedGameData: result.gameData,
    };
  }
}
