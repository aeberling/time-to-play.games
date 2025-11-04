import {
  Game,
  GameConfig,
  MoveResult,
  Card,
  Player,
} from '../core/Game.interface';

/**
 * Swoop card game state
 */
export interface SwoopGameData {
  // Player hands (arrays of card IDs)
  playerHands: string[][];

  // Face-up table cards for each player
  faceUpCards: string[][];

  // Mystery cards (face-down) for each player
  mysteryCards: string[][];

  // Central play pile
  playPile: string[];

  // Cards removed from game (from swoops)
  removedCards: string[];

  // Current turn
  currentPlayerIndex: number;

  // Game phase
  phase: 'PLAYING' | 'ROUND_OVER' | 'GAME_OVER';

  // Round number
  round: number;

  // Player scores (cumulative across rounds)
  scores: number[];

  // Last action (for UI display)
  lastAction: {
    type: 'PLAY' | 'SWOOP' | 'PICKUP' | 'MYSTERY_REVEAL' | 'SKIP' | 'ROUND_END';
    playerIndex: number;
    cards?: string[];
    swoopTriggered?: boolean;
    mysteryCardRevealed?: string;
    timestamp: string;
  } | null;

  // Swoop animation state
  recentSwoop: boolean;

  // Player configuration
  players: Player[];
}

/**
 * Swoop game move
 */
export interface SwoopMove {
  action: 'PLAY' | 'PICKUP' | 'SKIP';

  // For PLAY action
  cards?: string[]; // Card IDs to play
  fromHand?: boolean; // Are cards from hand?
  fromFaceUp?: number[]; // Indices of face-up cards
  fromMystery?: number; // Index of mystery card (only 1 at a time)
}

/**
 * Card value mapping for Swoop (Ace is LOW)
 */
const SWOOP_CARD_VALUES: { [key: string]: number } = {
  'A': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 0, // Special card
  'J': 11,
  'Q': 12,
  'K': 13,
  'JOKER': 0, // Special card
};

/**
 * Card point values for scoring
 */
const CARD_POINTS: { [key: string]: number } = {
  'A': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 50,
  'J': 10,
  'Q': 10,
  'K': 10,
  'JOKER': 50,
};

/**
 * Swoop card game implementation
 *
 * Rules:
 * - 3-8 players compete to get rid of all cards first
 * - Each player has: 11 hand cards, 4 face-up cards, 4 mystery (face-down) cards
 * - Play equal or lower rank cards on the pile
 * - Higher rank = pick up entire pile
 * - Swoop: Top 4 cards equal = pile removed, player goes again
 * - 10s and Jokers = automatic swoop
 * - First to empty all cards wins round
 * - Points for remaining cards, lowest score wins game
 */
export class SwoopGame implements Game {
  config: GameConfig | null = null;

  /**
   * Initialize a new game
   */
  initialize(config: GameConfig): SwoopGameData {
    this.config = config;

    const playerCount = config.players.length;

    if (playerCount < 3 || playerCount > 8) {
      throw new Error('Swoop requires 3-8 players');
    }

    // Determine number of decks
    const deckCount = this.getDeckCount(playerCount);

    // Create and shuffle decks
    const deck = this.createDecks(deckCount);
    const shuffled = this.shuffleDeck(deck);

    // Initialize player data
    const playerHands: string[][] = [];
    const faceUpCards: string[][] = [];
    const mysteryCards: string[][] = [];
    const scores: number[] = [];

    // Deal cards to each player
    for (let i = 0; i < playerCount; i++) {
      const playerCards = shuffled.slice(i * 19, (i + 1) * 19);

      // 4 mystery cards (face down) - first 4 cards
      mysteryCards.push(playerCards.slice(0, 4).map((c) => c.id));

      // 4 face-up cards - next 4 cards
      faceUpCards.push(playerCards.slice(4, 8).map((c) => c.id));

      // 11 hand cards - remaining cards
      playerHands.push(playerCards.slice(8, 19).map((c) => c.id));

      // Initialize score
      scores.push(0);
    }

    return {
      playerHands,
      faceUpCards,
      mysteryCards,
      playPile: [],
      removedCards: [],
      currentPlayerIndex: 0,
      phase: 'PLAYING',
      round: 1,
      scores,
      lastAction: null,
      recentSwoop: false,
      players: config.players,
    };
  }

  /**
   * Determine number of decks based on player count
   */
  private getDeckCount(playerCount: number): number {
    if (playerCount <= 4) return 2;
    if (playerCount <= 6) return 3;
    return 4;
  }

  /**
   * Create multiple decks with jokers
   */
  private createDecks(deckCount: number): Card[] {
    const suits: Array<'hearts' | 'diamonds' | 'clubs' | 'spades'> = [
      'hearts',
      'diamonds',
      'clubs',
      'spades',
    ];
    const ranks: Array<
      '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'
    > = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const allCards: Card[] = [];

    for (let deckNum = 1; deckNum <= deckCount; deckNum++) {
      // Regular cards
      for (const suit of suits) {
        for (const rank of ranks) {
          allCards.push({
            id: `${suit}_${rank}_${deckNum}`,
            suit,
            rank,
            value: SWOOP_CARD_VALUES[rank],
            deckNumber: deckNum,
          });
        }
      }

      // Add 2 jokers per deck
      for (let j = 1; j <= 2; j++) {
        allCards.push({
          id: `joker_${deckNum}_${j}`,
          suit: 'joker',
          rank: 'JOKER',
          value: 0,
          deckNumber: deckNum,
        });
      }
    }

    return allCards;
  }

  /**
   * Shuffle deck using Fisher-Yates algorithm
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
   * Get card object by ID
   */
  private getCardById(cardId: string): Card {
    // Parse card ID format: "suit_rank_deckNum" or "joker_deckNum_jokerNum"
    if (cardId.startsWith('joker')) {
      const parts = cardId.split('_');
      return {
        id: cardId,
        suit: 'joker',
        rank: 'JOKER',
        value: 0,
        deckNumber: parseInt(parts[1]),
      };
    }

    const parts = cardId.split('_');
    const suit = parts[0] as 'hearts' | 'diamonds' | 'clubs' | 'spades';
    const rank = parts[1] as
      | '2'
      | '3'
      | '4'
      | '5'
      | '6'
      | '7'
      | '8'
      | '9'
      | '10'
      | 'J'
      | 'Q'
      | 'K'
      | 'A';
    const deckNumber = parseInt(parts[2]);

    return {
      id: cardId,
      suit,
      rank,
      value: SWOOP_CARD_VALUES[rank],
      deckNumber,
    };
  }

  /**
   * Check if card is special (10 or Joker)
   */
  private isSpecialCard(card: Card): boolean {
    return card.rank === '10' || card.rank === 'JOKER';
  }

  /**
   * Validate a move
   */
  async validateMove(
    gameData: SwoopGameData,
    move: SwoopMove,
    userId: string
  ): Promise<boolean> {
    // Find player index
    const playerIndex = gameData.players.findIndex((p) => p.userId === userId);
    if (playerIndex === -1) return false;

    // Check if it's player's turn
    if (playerIndex !== gameData.currentPlayerIndex) return false;

    // Check if game is over
    if (gameData.phase === 'ROUND_OVER' || gameData.phase === 'GAME_OVER') {
      return false;
    }

    if (move.action === 'SKIP') {
      return true; // Skipping is always valid
    }

    if (move.action === 'PICKUP') {
      // Pickup is valid if pile has cards
      return gameData.playPile.length > 0;
    }

    if (move.action === 'PLAY') {
      if (!move.cards || move.cards.length === 0) return false;

      // Verify player owns these cards
      const hasCards = this.playerHasCards(gameData, playerIndex, move);
      if (!hasCards) return false;

      // All cards must be same rank
      const cards = move.cards.map((id) => this.getCardById(id));
      const firstRank = cards[0].rank;
      const allSameRank = cards.every((c) => c.rank === firstRank);

      if (!allSameRank) return false;

      // Check if play is valid against pile
      const isValid = this.isValidPlay(cards, gameData.playPile);
      if (!isValid) return false;

      // Check swoop constraint: cannot create more than 4 equal cards
      if (!this.isSpecialCard(cards[0])) {
        const topCard = this.getTopPileCard(gameData.playPile);
        if (topCard && topCard.rank === firstRank) {
          const equalCount = this.countEqualCardsOnTop(gameData.playPile);
          if (equalCount + cards.length > 4) {
            return false; // Cannot create more than 4 equal cards
          }
        }
      }

      return true;
    }

    return false;
  }

  /**
   * Check if player has the cards they're trying to play
   */
  private playerHasCards(
    gameData: SwoopGameData,
    playerIndex: number,
    move: SwoopMove
  ): boolean {
    if (!move.cards) return false;

    const cardSet = new Set(move.cards);
    const cardsArray = Array.from(cardSet);

    // Check hand
    if (move.fromHand) {
      const handSet = new Set(gameData.playerHands[playerIndex]);
      for (const card of cardsArray) {
        if (!handSet.has(card)) return false;
      }
    }

    // Check face-up
    if (move.fromFaceUp && move.fromFaceUp.length > 0) {
      const faceUp = gameData.faceUpCards[playerIndex];
      for (const idx of move.fromFaceUp) {
        if (idx < 0 || idx >= faceUp.length) return false;
        if (!cardSet.has(faceUp[idx])) return false;
      }
    }

    // Check mystery
    if (move.fromMystery !== undefined) {
      const mystery = gameData.mysteryCards[playerIndex];
      if (move.fromMystery < 0 || move.fromMystery >= mystery.length) {
        return false;
      }
      if (!cardSet.has(mystery[move.fromMystery])) return false;
    }

    return true;
  }

  /**
   * Check if play is valid against current pile
   */
  private isValidPlay(cards: Card[], pile: string[]): boolean {
    // Special cards (10s and Jokers) can always be played
    if (this.isSpecialCard(cards[0])) {
      return true;
    }

    // Empty pile - any card valid
    if (pile.length === 0) {
      return true;
    }

    // Get top card of pile
    const topCard = this.getCardById(pile[pile.length - 1]);

    // Playing higher rank is technically "valid" but requires picking up pile
    // This is handled in processMove, not validation
    // Equal or lower is valid
    return cards[0].value <= topCard.value || cards[0].value === 0;
  }

  /**
   * Count how many equal cards are on top of pile
   */
  private countEqualCardsOnTop(pile: string[]): number {
    if (pile.length === 0) return 0;

    const topCard = this.getCardById(pile[pile.length - 1]);
    let count = 0;

    for (let i = pile.length - 1; i >= 0; i--) {
      const card = this.getCardById(pile[i]);
      if (card.rank === topCard.rank) {
        count++;
      } else {
        break;
      }
    }

    return count;
  }

  /**
   * Get top card of pile
   */
  private getTopPileCard(pile: string[]): Card | null {
    if (pile.length === 0) return null;
    return this.getCardById(pile[pile.length - 1]);
  }

  /**
   * Check if swoop occurred (top 4 cards equal)
   */
  private checkSwoop(pile: string[]): boolean {
    if (pile.length < 4) return false;

    // Check if top 4 cards are equal
    const top4 = pile.slice(-4);
    const cards = top4.map((id) => this.getCardById(id));

    const firstRank = cards[0].rank;
    return cards.every((c) => c.rank === firstRank);
  }

  /**
   * Process a move and return updated game state
   */
  async processMove(
    gameData: SwoopGameData,
    move: SwoopMove,
    userId: string
  ): Promise<MoveResult> {
    const playerIndex = gameData.players.findIndex((p) => p.userId === userId);

    if (playerIndex === -1) {
      return { success: false, error: 'Player not found' };
    }

    const newGameData = JSON.parse(JSON.stringify(gameData)) as SwoopGameData;

    if (move.action === 'SKIP') {
      newGameData.lastAction = {
        type: 'SKIP',
        playerIndex,
        timestamp: new Date().toISOString(),
      };

      newGameData.currentPlayerIndex =
        (playerIndex + 1) % newGameData.players.length;
      newGameData.recentSwoop = false;

      return {
        success: true,
        gameData: newGameData,
        gameOver: false,
      };
    }

    if (move.action === 'PICKUP') {
      // Add pile to player's hand
      newGameData.playerHands[playerIndex] = [
        ...newGameData.playerHands[playerIndex],
        ...newGameData.playPile,
      ];

      const pickedUpCards = [...newGameData.playPile];
      newGameData.playPile = [];

      newGameData.lastAction = {
        type: 'PICKUP',
        playerIndex,
        cards: pickedUpCards,
        timestamp: new Date().toISOString(),
      };

      newGameData.currentPlayerIndex =
        (playerIndex + 1) % newGameData.players.length;
      newGameData.recentSwoop = false;

      return {
        success: true,
        gameData: newGameData,
        gameOver: false,
      };
    }

    if (move.action === 'PLAY' && move.cards) {
      const cards = move.cards.map((id) => this.getCardById(id));
      const isSwoopCard = this.isSpecialCard(cards[0]);

      // Check if playing higher rank (must pick up pile)
      const topCard = this.getTopPileCard(newGameData.playPile);
      if (
        !isSwoopCard &&
        topCard &&
        cards[0].value > topCard.value &&
        cards[0].value !== 0
      ) {
        // Playing higher = automatic pickup
        // Add current pile to hand
        newGameData.playerHands[playerIndex] = [
          ...newGameData.playerHands[playerIndex],
          ...newGameData.playPile,
        ];

        // Then add played cards to pile
        newGameData.playPile = [...move.cards];

        // Remove cards from player's areas (they go to pile temporarily)
        this.removeCardsFromPlayer(newGameData, playerIndex, move);

        // Then player picks up the pile (including their played cards)
        newGameData.playerHands[playerIndex] = [
          ...newGameData.playerHands[playerIndex],
          ...newGameData.playPile,
        ];

        newGameData.playPile = [];

        newGameData.lastAction = {
          type: 'PICKUP',
          playerIndex,
          cards: move.cards,
          timestamp: new Date().toISOString(),
        };

        newGameData.currentPlayerIndex =
          (playerIndex + 1) % newGameData.players.length;
        newGameData.recentSwoop = false;

        return {
          success: true,
          gameData: newGameData,
          gameOver: false,
        };
      }

      // Remove cards from player's areas
      this.removeCardsFromPlayer(newGameData, playerIndex, move);

      // Add cards to pile
      newGameData.playPile = [...newGameData.playPile, ...move.cards];

      // Check for swoop
      const swoopTriggered = isSwoopCard || this.checkSwoop(newGameData.playPile);

      newGameData.lastAction = {
        type: swoopTriggered ? 'SWOOP' : 'PLAY',
        playerIndex,
        cards: move.cards,
        swoopTriggered,
        timestamp: new Date().toISOString(),
      };

      if (swoopTriggered) {
        // Remove pile from game
        newGameData.removedCards = [
          ...newGameData.removedCards,
          ...newGameData.playPile,
        ];
        newGameData.playPile = [];
        newGameData.recentSwoop = true;

        // Same player goes again - don't increment turn
      } else {
        newGameData.recentSwoop = false;
        // Next player's turn
        newGameData.currentPlayerIndex =
          (playerIndex + 1) % newGameData.players.length;
      }

      // Check if player won the round
      if (this.hasPlayerWonRound(newGameData, playerIndex)) {
        return this.endRound(newGameData, playerIndex);
      }

      return {
        success: true,
        gameData: newGameData,
        gameOver: false,
      };
    }

    return { success: false, error: 'Invalid move action' };
  }

  /**
   * Remove cards from player's hand/face-up/mystery
   */
  private removeCardsFromPlayer(
    gameData: SwoopGameData,
    playerIndex: number,
    move: SwoopMove
  ): void {
    if (!move.cards) return;

    // Remove from hand
    if (move.fromHand) {
      const cardSet = new Set(move.cards);
      gameData.playerHands[playerIndex] = gameData.playerHands[
        playerIndex
      ].filter((c) => !cardSet.has(c));
    }

    // Remove from face-up
    if (move.fromFaceUp) {
      const indices = [...move.fromFaceUp].sort((a, b) => b - a); // Reverse order
      for (const idx of indices) {
        gameData.faceUpCards[playerIndex].splice(idx, 1);
      }
    }

    // Remove from mystery
    if (move.fromMystery !== undefined) {
      gameData.mysteryCards[playerIndex].splice(move.fromMystery, 1);
    }
  }

  /**
   * Check if player has won the round
   */
  private hasPlayerWonRound(
    gameData: SwoopGameData,
    playerIndex: number
  ): boolean {
    return (
      gameData.playerHands[playerIndex].length === 0 &&
      gameData.faceUpCards[playerIndex].length === 0 &&
      gameData.mysteryCards[playerIndex].length === 0
    );
  }

  /**
   * End the round and calculate scores
   */
  private endRound(
    gameData: SwoopGameData,
    winnerIndex: number
  ): MoveResult {
    const newGameData = { ...gameData };

    // Calculate scores for all other players
    for (let i = 0; i < newGameData.players.length; i++) {
      if (i === winnerIndex) continue;

      const allCards = [
        ...newGameData.playerHands[i],
        ...newGameData.faceUpCards[i],
        ...newGameData.mysteryCards[i],
      ];

      const points = this.calculatePoints(allCards);
      newGameData.scores[i] += points;
    }

    // Check if game is over (someone reached 500+)
    const maxScore = Math.max(...newGameData.scores);
    if (maxScore >= 500) {
      newGameData.phase = 'GAME_OVER';

      // Find winner (lowest score)
      const lowestScore = Math.min(...newGameData.scores);
      const gameWinnerIndex = newGameData.scores.indexOf(lowestScore);

      return {
        success: true,
        gameData: newGameData,
        gameOver: true,
        winner: newGameData.players[gameWinnerIndex].userId,
      };
    } else {
      newGameData.phase = 'ROUND_OVER';
    }

    newGameData.lastAction = {
      type: 'ROUND_END',
      playerIndex: winnerIndex,
      timestamp: new Date().toISOString(),
    };

    return {
      success: true,
      gameData: newGameData,
      gameOver: false,
    };
  }

  /**
   * Calculate points for cards
   */
  private calculatePoints(cardIds: string[]): number {
    return cardIds.reduce((sum, id) => {
      const card = this.getCardById(id);
      return sum + CARD_POINTS[card.rank];
    }, 0);
  }

  /**
   * Check if game is over
   */
  isGameOver(gameData: SwoopGameData): boolean {
    return gameData.phase === 'GAME_OVER';
  }

  /**
   * Get winner(s)
   */
  getWinner(gameData: SwoopGameData): string | string[] | null {
    if (gameData.phase !== 'GAME_OVER') return null;

    // Find player with lowest score
    const lowestScore = Math.min(...gameData.scores);
    const winnerIndex = gameData.scores.indexOf(lowestScore);

    return gameData.players[winnerIndex].userId;
  }

  /**
   * Get game rules/description
   */
  getRules(): string {
    return `Swoop - Fast-paced shedding card game

Players: 3-8
Goal: Be the first to get rid of all your cards (hand, face-up, and mystery cards)

Setup:
- Each player gets 19 cards: 4 mystery (face-down), 4 face-up, 11 in hand
- Cards rank A-2-3-4-5-6-7-8-9-J-Q-K (Ace is LOW)
- 10s and Jokers are special cards

Gameplay:
- Play 1-4 cards of the same rank
- Must play equal or lower than top pile card
- Playing higher = pick up entire pile
- SWOOP: Top 4 cards equal = pile removed, play again!
- 10s and Jokers = automatic swoop

Mystery Cards:
- Played blind after face-up cards are gone
- If higher than pile = pick up pile

Scoring:
- First to empty all cards wins round
- Others score points for remaining cards
- When someone reaches 500+, lowest score wins!`;
  }

  /**
   * Get current game status for display
   */
  getStatus(gameData: SwoopGameData): string {
    if (gameData.phase === 'GAME_OVER') {
      const winner = this.getWinner(gameData);
      const winnerPlayer = gameData.players.find((p) => p.userId === winner);
      return `Game Over! ${winnerPlayer?.displayName} wins with ${Math.min(...gameData.scores)} points!`;
    }

    if (gameData.phase === 'ROUND_OVER') {
      return `Round ${gameData.round} complete! Scores: ${gameData.scores.join(', ')}`;
    }

    const currentPlayer = gameData.players[gameData.currentPlayerIndex];
    const pileSize = gameData.playPile.length;

    if (gameData.recentSwoop) {
      return `SWOOP! ${currentPlayer.displayName} plays again!`;
    }

    return `${currentPlayer.displayName}'s turn | Pile: ${pileSize} cards | Round ${gameData.round}`;
  }
}
