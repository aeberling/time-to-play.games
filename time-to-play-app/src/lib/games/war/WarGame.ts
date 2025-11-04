import {
  Game,
  GameConfig,
  MoveResult,
  Card,
  Player,
} from '../core/Game.interface';

/**
 * War card game state
 */
export interface WarGameData {
  player1: {
    deck: Card[];
    wonCards: Card[];
  };
  player2: {
    deck: Card[];
    wonCards: Card[];
  };
  currentBattle?: {
    player1Card: Card;
    player2Card: Card;
    warPile?: Card[];
  };
  moveCount: number;
  status: 'playing' | 'war' | 'finished';
  winner?: string;
}

/**
 * War game move
 */
export interface WarMove {
  type: 'play_card' | 'acknowledge_result';
}

/**
 * War card game implementation
 *
 * Rules:
 * - Each player gets half the deck
 * - Players simultaneously play their top card
 * - Higher card wins both cards
 * - If cards are equal, it's "War":
 *   - Each player plays 3 cards face down, then 1 face up
 *   - Higher face-up card wins all cards
 * - Game ends when one player has all cards
 */
export class WarGame implements Game {
  private readonly RANK_VALUES: Record<string, number> = {
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 11,
    'Q': 12,
    'K': 13,
    'A': 14,
  };

  /**
   * Create a standard 52-card deck
   */
  private createDeck(): Card[] {
    const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Card['rank'][] = [
      '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'
    ];
    const deck: Card[] = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({
          suit,
          rank,
          value: this.RANK_VALUES[rank],
          id: `${suit}_${rank}_1`, // Format: suit_rank_deckNumber
        });
      }
    }

    return deck;
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  private shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Initialize a new War game
   */
  initialize(config: GameConfig): WarGameData {
    const deck = this.shuffleDeck(this.createDeck());
    const halfDeck = Math.floor(deck.length / 2);

    return {
      player1: {
        deck: deck.slice(0, halfDeck),
        wonCards: [],
      },
      player2: {
        deck: deck.slice(halfDeck),
        wonCards: [],
      },
      moveCount: 0,
      status: 'playing',
    };
  }

  /**
   * Validate a move
   */
  async validateMove(
    gameData: WarGameData,
    move: WarMove,
    userId: string
  ): Promise<boolean> {
    // Check game is not finished
    if (gameData.status === 'finished') {
      return false;
    }

    // War is fully automated, so moves are always just acknowledging results
    return move.type === 'play_card' || move.type === 'acknowledge_result';
  }

  /**
   * Process a move - play a battle round
   */
  async processMove(
    gameData: WarGameData,
    move: WarMove,
    userId: string
  ): Promise<MoveResult> {
    const newData = { ...gameData };

    // Get top cards from each player
    const player1Card = newData.player1.deck.shift();
    const player2Card = newData.player2.deck.shift();

    if (!player1Card || !player2Card) {
      // One player ran out of cards
      const winner = player1Card ? 'player1' : 'player2';
      return {
        success: true,
        gameData: {
          ...newData,
          status: 'finished',
          winner,
        },
        gameOver: true,
        winner,
      };
    }

    // Compare cards
    if (player1Card.value > player2Card.value) {
      // Player 1 wins
      newData.player1.wonCards.push(player1Card, player2Card);
      newData.currentBattle = {
        player1Card,
        player2Card,
      };
    } else if (player2Card.value > player1Card.value) {
      // Player 2 wins
      newData.player2.wonCards.push(player1Card, player2Card);
      newData.currentBattle = {
        player1Card,
        player2Card,
      };
    } else {
      // War!
      const warResult = this.handleWar(newData, player1Card, player2Card);
      if (warResult.gameOver) {
        return warResult;
      }
      newData.currentBattle = {
        player1Card,
        player2Card,
        warPile: warResult.warPile,
      };
    }

    // Shuffle won cards back into deck if main deck is empty
    if (newData.player1.deck.length === 0 && newData.player1.wonCards.length > 0) {
      newData.player1.deck = this.shuffleDeck(newData.player1.wonCards);
      newData.player1.wonCards = [];
    }
    if (newData.player2.deck.length === 0 && newData.player2.wonCards.length > 0) {
      newData.player2.deck = this.shuffleDeck(newData.player2.wonCards);
      newData.player2.wonCards = [];
    }

    newData.moveCount++;

    // Check if game is over
    const totalP1 = newData.player1.deck.length + newData.player1.wonCards.length;
    const totalP2 = newData.player2.deck.length + newData.player2.wonCards.length;

    if (totalP1 === 0 || totalP2 === 0) {
      const winner = totalP1 > 0 ? 'player1' : 'player2';
      return {
        success: true,
        gameData: {
          ...newData,
          status: 'finished',
          winner,
        },
        gameOver: true,
        winner,
      };
    }

    return {
      success: true,
      gameData: newData,
    };
  }

  /**
   * Handle War scenario (tied cards)
   */
  private handleWar(
    gameData: WarGameData,
    card1: Card,
    card2: Card
  ): { gameOver: boolean; winner?: string; warPile?: Card[] } {
    const warPile: Card[] = [card1, card2];
    let p1Cards: Card[] = [];
    let p2Cards: Card[] = [];

    // Each player puts down 3 cards face down
    for (let i = 0; i < 3; i++) {
      const p1Card = gameData.player1.deck.shift();
      const p2Card = gameData.player2.deck.shift();

      if (!p1Card) {
        // Player 1 doesn't have enough cards for war
        gameData.player2.wonCards.push(...warPile, ...p1Cards, ...p2Cards);
        return { gameOver: true, winner: 'player2' };
      }
      if (!p2Card) {
        // Player 2 doesn't have enough cards for war
        gameData.player1.wonCards.push(...warPile, ...p1Cards, ...p2Cards);
        return { gameOver: true, winner: 'player1' };
      }

      p1Cards.push(p1Card);
      p2Cards.push(p2Card);
      warPile.push(p1Card, p2Card);
    }

    // Play 1 card face up to determine winner
    const p1FaceUp = gameData.player1.deck.shift();
    const p2FaceUp = gameData.player2.deck.shift();

    if (!p1FaceUp) {
      gameData.player2.wonCards.push(...warPile);
      return { gameOver: true, winner: 'player2' };
    }
    if (!p2FaceUp) {
      gameData.player1.wonCards.push(...warPile);
      return { gameOver: true, winner: 'player1' };
    }

    warPile.push(p1FaceUp, p2FaceUp);

    // Determine winner of war
    if (p1FaceUp.value > p2FaceUp.value) {
      gameData.player1.wonCards.push(...warPile);
    } else if (p2FaceUp.value > p1FaceUp.value) {
      gameData.player2.wonCards.push(...warPile);
    } else {
      // Another war! Recursively handle it
      return this.handleWar(gameData, p1FaceUp, p2FaceUp);
    }

    return { gameOver: false, warPile };
  }

  /**
   * Check if game is over
   */
  isGameOver(gameData: WarGameData): boolean {
    return gameData.status === 'finished';
  }

  /**
   * Get winner
   */
  getWinner(gameData: WarGameData): string | null {
    if (!this.isGameOver(gameData)) {
      return null;
    }
    return gameData.winner || null;
  }

  /**
   * Get game rules
   */
  getRules(): string {
    return `
# War - Card Game Rules

## Objective
Be the first player to win all 52 cards.

## Setup
- The deck is shuffled and divided evenly between two players
- Each player keeps their cards face down in a pile

## Gameplay
1. Both players simultaneously flip their top card
2. The player with the higher card wins both cards
3. Won cards go to the bottom of the winner's deck
4. If cards are equal, it's "War":
   - Each player places 3 cards face down
   - Then 1 card face up
   - Higher face-up card wins all cards in play

## Card Rankings
A (high) > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3 > 2 (low)

## Winning
The game ends when one player has all the cards.
    `.trim();
  }

  /**
   * Get current game status
   */
  getStatus(gameData: WarGameData): string {
    if (gameData.status === 'finished') {
      return `Game Over - Player ${gameData.winner === 'player1' ? '1' : '2'} wins!`;
    }

    const p1Total = gameData.player1.deck.length + gameData.player1.wonCards.length;
    const p2Total = gameData.player2.deck.length + gameData.player2.wonCards.length;

    return `Player 1: ${p1Total} cards | Player 2: ${p2Total} cards`;
  }
}
