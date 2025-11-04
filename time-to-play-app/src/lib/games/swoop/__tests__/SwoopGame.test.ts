import { SwoopGame, SwoopGameData, SwoopMove } from '../SwoopGame';
import { GameConfig, Player } from '../../core/Game.interface';

describe('SwoopGame', () => {
  let game: SwoopGame;
  let config: GameConfig;
  let players: Player[];

  beforeEach(() => {
    game = new SwoopGame();
    players = [
      { userId: 'user1', displayName: 'Player 1', playerNumber: 0 },
      { userId: 'user2', displayName: 'Player 2', playerNumber: 1 },
      { userId: 'user3', displayName: 'Player 3', playerNumber: 2 },
      { userId: 'user4', displayName: 'Player 4', playerNumber: 3 },
    ];
    config = {
      gameType: 'SWOOP',
      players,
    };
  });

  describe('initialize', () => {
    it('should initialize game with 4 players', () => {
      const gameData = game.initialize(config);

      expect(gameData.players.length).toBe(4);
      expect(gameData.playerHands.length).toBe(4);
      expect(gameData.faceUpCards.length).toBe(4);
      expect(gameData.mysteryCards.length).toBe(4);
    });

    it('should deal 19 cards per player (11 hand + 4 face-up + 4 mystery)', () => {
      const gameData = game.initialize(config);

      for (let i = 0; i < 4; i++) {
        const totalCards =
          gameData.playerHands[i].length +
          gameData.faceUpCards[i].length +
          gameData.mysteryCards[i].length;

        expect(totalCards).toBe(19);
        expect(gameData.playerHands[i].length).toBe(11);
        expect(gameData.faceUpCards[i].length).toBe(4);
        expect(gameData.mysteryCards[i].length).toBe(4);
      }
    });

    it('should initialize with empty play pile', () => {
      const gameData = game.initialize(config);
      expect(gameData.playPile).toEqual([]);
    });

    it('should initialize scores at 0', () => {
      const gameData = game.initialize(config);
      expect(gameData.scores).toEqual([0, 0, 0, 0]);
    });

    it('should throw error for less than 3 players', () => {
      const invalidConfig = {
        gameType: 'SWOOP',
        players: players.slice(0, 2),
      };

      expect(() => game.initialize(invalidConfig)).toThrow(
        'Swoop requires 3-8 players'
      );
    });

    it('should throw error for more than 8 players', () => {
      const manyPlayers = Array.from({ length: 9 }, (_, i) => ({
        userId: `user${i}`,
        displayName: `Player ${i}`,
        playerNumber: i,
      }));

      const invalidConfig = {
        gameType: 'SWOOP',
        players: manyPlayers,
      };

      expect(() => game.initialize(invalidConfig)).toThrow(
        'Swoop requires 3-8 players'
      );
    });
  });

  describe('validateMove', () => {
    let gameData: SwoopGameData;

    beforeEach(() => {
      gameData = game.initialize(config);
    });

    it('should validate SKIP action', async () => {
      const move: SwoopMove = { action: 'SKIP' };
      const isValid = await game.validateMove(gameData, move, 'user1');
      expect(isValid).toBe(true);
    });

    it('should reject move from wrong player', async () => {
      const move: SwoopMove = { action: 'SKIP' };
      const isValid = await game.validateMove(gameData, move, 'user2'); // Not player 1's turn
      expect(isValid).toBe(false);
    });

    it('should validate PICKUP when pile has cards', async () => {
      // Add some cards to pile
      gameData.playPile = ['hearts_7_1', 'clubs_9_1'];
      const move: SwoopMove = { action: 'PICKUP' };
      const isValid = await game.validateMove(gameData, move, 'user1');
      expect(isValid).toBe(true);
    });

    it('should reject PICKUP when pile is empty', async () => {
      gameData.playPile = [];
      const move: SwoopMove = { action: 'PICKUP' };
      const isValid = await game.validateMove(gameData, move, 'user1');
      expect(isValid).toBe(false);
    });

    it('should reject PLAY with cards player does not have', async () => {
      const move: SwoopMove = {
        action: 'PLAY',
        cards: ['hearts_K_999'], // Non-existent card
        fromHand: true,
      };
      const isValid = await game.validateMove(gameData, move, 'user1');
      expect(isValid).toBe(false);
    });
  });

  describe('processMove', () => {
    let gameData: SwoopGameData;

    beforeEach(() => {
      gameData = game.initialize(config);
    });

    it('should process SKIP move and advance turn', async () => {
      const move: SwoopMove = { action: 'SKIP' };
      const result = await game.processMove(gameData, move, 'user1');

      expect(result.success).toBe(true);
      expect(result.gameData?.currentPlayerIndex).toBe(1);
      expect(result.gameData?.lastAction?.type).toBe('SKIP');
    });

    it('should process PICKUP move and add pile to hand', async () => {
      // Setup: Add cards to pile
      gameData.playPile = ['hearts_7_1', 'clubs_9_1'];
      const originalHandSize = gameData.playerHands[0].length;

      const move: SwoopMove = { action: 'PICKUP' };
      const result = await game.processMove(gameData, move, 'user1');

      expect(result.success).toBe(true);
      expect(result.gameData?.playerHands[0].length).toBe(
        originalHandSize + 2
      );
      expect(result.gameData?.playPile).toEqual([]);
    });
  });

  describe('game rules', () => {
    it('should provide game rules', () => {
      const rules = game.getRules();
      expect(rules).toContain('Swoop');
      expect(rules).toContain('3-8');
      expect(rules).toContain('mystery');
    });
  });

  describe('game status', () => {
    let gameData: SwoopGameData;

    beforeEach(() => {
      gameData = game.initialize(config);
    });

    it('should show current player turn in status', () => {
      const status = game.getStatus(gameData);
      expect(status).toContain('Player 1');
      expect(status).toContain('turn');
    });

    it('should show swoop message when swoop occurs', () => {
      gameData.recentSwoop = true;
      const status = game.getStatus(gameData);
      expect(status).toContain('SWOOP');
    });

    it('should show game over message', () => {
      gameData.phase = 'GAME_OVER';
      const status = game.getStatus(gameData);
      expect(status).toContain('Game Over');
    });
  });

  describe('isGameOver', () => {
    let gameData: SwoopGameData;

    beforeEach(() => {
      gameData = game.initialize(config);
    });

    it('should return false when game is playing', () => {
      expect(game.isGameOver(gameData)).toBe(false);
    });

    it('should return true when game phase is GAME_OVER', () => {
      gameData.phase = 'GAME_OVER';
      expect(game.isGameOver(gameData)).toBe(true);
    });
  });

  describe('getWinner', () => {
    let gameData: SwoopGameData;

    beforeEach(() => {
      gameData = game.initialize(config);
    });

    it('should return null when game is not over', () => {
      expect(game.getWinner(gameData)).toBeNull();
    });

    it('should return player with lowest score when game is over', () => {
      gameData.phase = 'GAME_OVER';
      gameData.scores = [100, 50, 200, 75]; // Player 2 has lowest
      const winner = game.getWinner(gameData);
      expect(winner).toBe('user2');
    });
  });
});
