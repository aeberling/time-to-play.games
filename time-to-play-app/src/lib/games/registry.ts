import { GameFactory } from './core/Game.interface';
import { WarGame } from './war/WarGame';
import { SwoopGame } from './swoop/SwoopGame';
import { OhHellGame } from './oh-hell/OhHellGame';
import { MoveValidator } from '../game/state';
import { WarMoveValidator } from './war/WarMoveValidator';
import { SwoopMoveValidator } from './swoop/SwoopMoveValidator';
import { OhHellMoveValidator } from './oh-hell/OhHellMoveValidator';

/**
 * Game type constants
 */
export const GAME_TYPES = {
  WAR: 'WAR',
  SWOOP: 'SWOOP',
  OH_HELL: 'OH_HELL',
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

  // Register Swoop game
  GameFactory.register(GAME_TYPES.SWOOP, SwoopGame);
  validatorRegistry.register(GAME_TYPES.SWOOP, new SwoopMoveValidator());

  // Register Oh Hell game
  GameFactory.register(GAME_TYPES.OH_HELL, OhHellGame);
  validatorRegistry.register(GAME_TYPES.OH_HELL, new OhHellMoveValidator());

  console.log('Games registered:', GameFactory.getSupportedGames());
}
