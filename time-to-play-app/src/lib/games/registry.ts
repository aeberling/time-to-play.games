import { GameFactory } from './core/Game.interface';
import { WarGame } from './war/WarGame';
import { MoveValidator } from '../game/state';
import { WarMoveValidator } from './war/WarMoveValidator';

/**
 * Game type constants
 */
export const GAME_TYPES = {
  WAR: 'WAR',
} as const;

export type GameType = typeof GAME_TYPES[keyof typeof GAME_TYPES];

/**
 * Validator registry
 */
class ValidatorRegistry {
  private validators: Map<string, MoveValidator> = new Map();

  register(gameType: string, validator: MoveValidator) {
    this.validators.set(gameType, validator);
  }

  get(gameType: string): MoveValidator | null {
    return this.validators.get(gameType) || null;
  }
}

export const validatorRegistry = new ValidatorRegistry();

/**
 * Register all games and their validators
 */
export function registerGames() {
  // Register War game
  GameFactory.register(GAME_TYPES.WAR, WarGame);
  validatorRegistry.register(GAME_TYPES.WAR, new WarMoveValidator());

  console.log('Games registered:', GameFactory.getSupportedGames());
}
