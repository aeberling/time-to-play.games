import { GameState, MoveValidator, MoveValidationResult, BaseMoveValidator } from '@/lib/game/state';
import { WarGame, WarGameData, WarMove } from './WarGame';

/**
 * War-specific move validator
 */
export class WarMoveValidator extends BaseMoveValidator implements MoveValidator {
  private warGame: WarGame;

  constructor() {
    super();
    this.warGame = new WarGame();
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

    // War-specific validation
    const warMove = move as WarMove;
    const gameData = gameState.gameData as WarGameData;

    // Validate the move using War game logic
    const isValid = await this.warGame.validateMove(gameData, warMove, userId);

    if (!isValid) {
      return {
        valid: false,
        error: 'Invalid move for War game',
      };
    }

    // Process the move to get updated game data
    const result = await this.warGame.processMove(gameData, warMove, userId);

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
