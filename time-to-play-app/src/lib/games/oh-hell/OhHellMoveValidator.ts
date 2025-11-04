import { GameState, MoveValidator, MoveValidationResult, BaseMoveValidator } from '@/lib/game/state';
import { OhHellGame, OhHellGameData, OhHellMove } from './OhHellGame';

/**
 * Oh Hell specific move validator
 */
export class OhHellMoveValidator extends BaseMoveValidator implements MoveValidator {
  private ohHellGame: OhHellGame;

  constructor() {
    super();
    this.ohHellGame = new OhHellGame();
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

    // Oh Hell specific validation
    const ohHellMove = move as OhHellMove;
    const gameData = gameState.gameData as OhHellGameData;

    // Validate the move using Oh Hell game logic
    const isValid = await this.ohHellGame.validateMove(gameData, ohHellMove, userId);

    if (!isValid) {
      return {
        valid: false,
        error: 'Invalid move for Oh Hell game',
      };
    }

    // Process the move to get updated game data
    const result = await this.ohHellGame.processMove(gameData, ohHellMove, userId);

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
