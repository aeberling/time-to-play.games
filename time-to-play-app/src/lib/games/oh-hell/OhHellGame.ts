import {
  Game,
  GameConfig,
  MoveResult,
  Card,
} from '../core/Game.interface';

/**
 * Oh Hell (Bugger Your Neighbor) card game state
 */
export interface OhHellGameData {
  // Game configuration
  playerCount: number;
  maxCards: number; // 10 for 3-5 players
  scoringVariant: 'standard' | 'partial'; // standard = 0 for fails, partial = tricks won
  playerIds: string[]; // User IDs in turn order

  // Round progression
  currentRound: number; // 1-19 for 3-5 players
  totalRounds: number; // 19 for 3-5 players
  cardsThisRound: number; // 10, 9, 8, ..., 1, 2, ..., 10
  isAscending: boolean; // false until after 1-card round, then true

  // Trump
  trumpSuit: 'clubs' | 'diamonds' | 'hearts' | 'spades' | 'none';
  trumpCard: OhHellCard | null; // The card that was flipped

  // Dealer
  dealerIndex: number; // Rotates each round

  // Player hands
  playerHands: OhHellCard[][]; // [player1Cards, player2Cards, ...]

  // Bidding phase
  phase: 'BIDDING' | 'PLAYING' | 'ROUND_OVER' | 'GAME_OVER';
  bids: (number | null)[]; // null = hasn't bid yet
  currentBidder: number | null; // Index of player currently bidding

  // Trick-taking phase
  currentTrick: {
    cards: { playerIndex: number; card: OhHellCard }[];
    leadSuit: 'clubs' | 'diamonds' | 'hearts' | 'spades' | null;
    currentPlayer: number;
  };
  tricksWon: number[]; // Count of tricks won by each player this round
  completedTricks: any[]; // History of tricks this round

  // Scoring
  scores: number[]; // Cumulative scores for each player
  roundScores: number[]; // Scores earned this round

  // Last action
  lastAction: {
    type: 'BID' | 'PLAY_CARD' | 'TRICK_WON' | 'ROUND_END';
    playerIndex?: number;
    bid?: number;
    card?: OhHellCard;
    trickWinner?: number;
    timestamp: string;
  } | null;

  status: 'playing' | 'finished';
  winner?: string | string[];
}

/**
 * Oh Hell specific card representation
 */
export interface OhHellCard {
  id: string; // e.g., "clubs_ace", "hearts_7"
  suit: 'clubs' | 'diamonds' | 'hearts' | 'spades';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'jack' | 'queen' | 'king' | 'ace';
  value: number; // 2-14 for comparison (Ace = 14)
}

/**
 * Move data structure
 */
export interface OhHellMove {
  action: 'BID' | 'PLAY_CARD' | 'CONTINUE_ROUND';

  // For BID action
  bid?: number; // 0 to cardsInHand

  // For PLAY_CARD action
  card?: string; // Card ID to play
}

// Card value mapping (Ace high)
const CARD_VALUES: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'jack': 11, 'queen': 12, 'king': 13, 'ace': 14
};

/**
 * Oh Hell! (Bugger Your Neighbor) card game implementation
 *
 * A strategic trick-taking game where players must bid exactly how many tricks they'll win.
 * The dealer cannot bid a number that would make total bids equal total tricks available.
 */
export class OhHellGame implements Game {
  /**
   * Create a standard 52-card deck for Oh Hell
   */
  private createDeck(): OhHellCard[] {
    const suits: OhHellCard['suit'][] = ['clubs', 'diamonds', 'hearts', 'spades'];
    const ranks: OhHellCard['rank'][] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
    const deck: OhHellCard[] = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({
          id: `${suit}_${rank}`,
          suit,
          rank,
          value: CARD_VALUES[rank],
        });
      }
    }

    return deck;
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  private shuffleDeck(deck: OhHellCard[]): OhHellCard[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Deal cards for a round and determine trump
   */
  private dealRound(cardsPerPlayer: number, playerCount: number): {
    hands: OhHellCard[][];
    trumpCard: OhHellCard | null;
    trumpSuit: 'clubs' | 'diamonds' | 'hearts' | 'spades' | 'none';
  } {
    const shuffled = this.shuffleDeck(this.createDeck());
    const hands: OhHellCard[][] = [];

    // Initialize hands
    for (let i = 0; i < playerCount; i++) {
      hands.push([]);
    }

    // Deal cards to players (one at a time, clockwise)
    let cardIndex = 0;
    for (let round = 0; round < cardsPerPlayer; round++) {
      for (let player = 0; player < playerCount; player++) {
        hands[player].push(shuffled[cardIndex++]);
      }
    }

    // Determine trump
    const totalDealt = cardsPerPlayer * playerCount;
    if (totalDealt < 52) {
      // Flip next card for trump
      const trumpCard = shuffled[totalDealt];
      return {
        hands,
        trumpCard,
        trumpSuit: trumpCard.suit
      };
    } else {
      // No trump if all cards dealt
      return {
        hands,
        trumpCard: null,
        trumpSuit: 'none'
      };
    }
  }

  /**
   * Start a new round
   */
  private startRound(gameData: OhHellGameData): OhHellGameData {
    const { hands, trumpCard, trumpSuit } = this.dealRound(
      gameData.cardsThisRound,
      gameData.playerCount
    );

    return {
      ...gameData,
      playerHands: hands,
      trumpCard,
      trumpSuit,
      phase: 'BIDDING',
      bids: new Array(gameData.playerCount).fill(null),
      currentBidder: (gameData.dealerIndex + 1) % gameData.playerCount,
      tricksWon: new Array(gameData.playerCount).fill(0),
      completedTricks: [],
      roundScores: new Array(gameData.playerCount).fill(0),
      currentTrick: {
        cards: [],
        leadSuit: null,
        currentPlayer: (gameData.dealerIndex + 1) % gameData.playerCount
      },
      lastAction: null,
    };
  }

  /**
   * Initialize a new Oh Hell game
   */
  initialize(config: GameConfig): OhHellGameData {
    const playerCount = config.players.length;

    if (playerCount < 3 || playerCount > 5) {
      throw new Error('Oh Hell requires 3-5 players');
    }

    const maxCards = 10; // For 3-5 players
    const totalRounds = (maxCards * 2) - 1; // 10 down to 1, back up to 10 = 19 rounds

    const initialData: OhHellGameData = {
      playerCount,
      maxCards,
      scoringVariant: 'standard',
      playerIds: config.players.map(p => p.userId),
      currentRound: 1,
      totalRounds,
      cardsThisRound: maxCards,
      isAscending: false,
      trumpSuit: 'none',
      trumpCard: null,
      dealerIndex: 0,
      playerHands: [],
      phase: 'BIDDING',
      bids: new Array(playerCount).fill(null),
      currentBidder: 1,
      currentTrick: {
        cards: [],
        leadSuit: null,
        currentPlayer: 1
      },
      tricksWon: new Array(playerCount).fill(0),
      completedTricks: [],
      scores: new Array(playerCount).fill(0),
      roundScores: new Array(playerCount).fill(0),
      lastAction: null,
      status: 'playing',
    };

    // Deal the first round
    return this.startRound(initialData);
  }

  /**
   * Validate a move
   */
  async validateMove(
    gameData: OhHellGameData,
    move: OhHellMove,
    userId: string
  ): Promise<boolean> {
    // Get player index
    const playerIndex = gameData.playerIds.indexOf(userId);
    if (playerIndex === -1) {
      return false;
    }

    // Check game is not finished
    if (gameData.status === 'finished') {
      return false;
    }

    if (gameData.phase === 'BIDDING') {
      if (move.action !== 'BID') {
        return false;
      }

      if (gameData.currentBidder !== playerIndex) {
        return false;
      }

      if (move.bid === undefined || move.bid < 0 || move.bid > gameData.cardsThisRound) {
        return false;
      }

      // Check dealer restriction
      if (playerIndex === gameData.dealerIndex) {
        const totalBids = gameData.bids.reduce((sum, b) => sum + (b || 0), 0);
        const totalTricks = gameData.cardsThisRound;

        if (totalBids + move.bid === totalTricks) {
          return false; // Dealer cannot bid this amount
        }
      }

      return true;
    }

    if (gameData.phase === 'PLAYING') {
      if (move.action !== 'PLAY_CARD') {
        return false;
      }

      if (gameData.currentTrick.currentPlayer !== playerIndex) {
        return false;
      }

      if (!move.card) {
        return false;
      }

      // Check player has card
      const hasCard = gameData.playerHands[playerIndex].some(c => c.id === move.card);
      if (!hasCard) {
        return false;
      }

      // Check following suit
      const card = gameData.playerHands[playerIndex].find(c => c.id === move.card)!;
      const leadSuit = gameData.currentTrick.leadSuit;

      if (leadSuit && card.suit !== leadSuit) {
        // Must follow suit if possible
        const hasLeadSuit = gameData.playerHands[playerIndex].some(c => c.suit === leadSuit);
        if (hasLeadSuit) {
          return false; // Must follow suit
        }
      }

      return true;
    }

    if (gameData.phase === 'ROUND_OVER') {
      return move.action === 'CONTINUE_ROUND';
    }

    return false;
  }

  /**
   * Determine the winner of a trick
   */
  private determineTrickWinner(
    trick: { playerIndex: number; card: OhHellCard }[],
    trumpSuit: string,
    leadSuit: string
  ): number {
    let winningIndex = 0;
    let winningCard = trick[0].card;

    for (let i = 1; i < trick.length; i++) {
      const card = trick[i].card;

      // Trump beats non-trump
      if (card.suit === trumpSuit && winningCard.suit !== trumpSuit) {
        winningIndex = i;
        winningCard = card;
        continue;
      }

      // Both trump or both non-trump
      if (card.suit === trumpSuit && winningCard.suit === trumpSuit) {
        // Higher trump wins
        if (card.value > winningCard.value) {
          winningIndex = i;
          winningCard = card;
        }
      } else if (card.suit === leadSuit && winningCard.suit === leadSuit) {
        // Higher card of lead suit wins
        if (card.value > winningCard.value) {
          winningIndex = i;
          winningCard = card;
        }
      } else if (card.suit === leadSuit && winningCard.suit !== trumpSuit) {
        // Lead suit beats off-suit (when no trump)
        winningIndex = i;
        winningCard = card;
      }
    }

    return trick[winningIndex].playerIndex;
  }

  /**
   * Calculate score for a player
   */
  private calculateScore(bid: number, tricksWon: number, variant: 'standard' | 'partial'): number {
    if (bid === tricksWon) {
      // Made bid exactly
      return 10 + bid;
    } else {
      // Missed bid
      if (variant === 'standard') {
        return 0;
      } else {
        // Partial scoring: 1 point per trick won
        return tricksWon;
      }
    }
  }

  /**
   * End the current round and calculate scores
   */
  private endRound(gameData: OhHellGameData): OhHellGameData {
    const roundScores = new Array(gameData.playerCount).fill(0);

    // Calculate scores
    for (let i = 0; i < gameData.playerCount; i++) {
      const bid = gameData.bids[i]!;
      const won = gameData.tricksWon[i];
      roundScores[i] = this.calculateScore(bid, won, gameData.scoringVariant);
    }

    // Update cumulative scores
    const scores = gameData.scores.map((score, i) => score + roundScores[i]);

    return {
      ...gameData,
      phase: 'ROUND_OVER',
      roundScores,
      scores,
      lastAction: {
        type: 'ROUND_END',
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Advance to the next round
   */
  private advanceToNextRound(gameData: OhHellGameData): OhHellGameData {
    const currentRound = gameData.currentRound + 1;

    // Check if game is over
    if (currentRound > gameData.totalRounds) {
      // Find winner(s)
      const maxScore = Math.max(...gameData.scores);
      const winners = gameData.scores
        .map((score, i) => ({ score, userId: gameData.playerIds[i] }))
        .filter(p => p.score === maxScore)
        .map(p => p.userId);

      return {
        ...gameData,
        phase: 'GAME_OVER',
        status: 'finished',
        winner: winners.length === 1 ? winners[0] : winners,
      };
    }

    // Advance dealer
    const dealerIndex = (gameData.dealerIndex + 1) % gameData.playerCount;

    // Determine cards for next round
    let cardsThisRound: number;
    let isAscending: boolean;

    if (gameData.cardsThisRound === 1) {
      // Switch from descending to ascending
      isAscending = true;
      cardsThisRound = 2;
    } else if (gameData.isAscending) {
      isAscending = true;
      cardsThisRound = gameData.cardsThisRound + 1;
    } else {
      isAscending = false;
      cardsThisRound = gameData.cardsThisRound - 1;
    }

    const updatedData: OhHellGameData = {
      ...gameData,
      currentRound,
      dealerIndex,
      cardsThisRound,
      isAscending,
    };

    // Deal new round
    return this.startRound(updatedData);
  }

  /**
   * Process a move and return updated game state
   */
  async processMove(
    gameData: OhHellGameData,
    move: OhHellMove,
    userId: string
  ): Promise<MoveResult> {
    const playerIndex = gameData.playerIds.indexOf(userId);

    if (playerIndex === -1) {
      return {
        success: false,
        error: 'Player not in game',
      };
    }

    // Handle bidding
    if (move.action === 'BID' && move.bid !== undefined) {
      const bids = [...gameData.bids];
      bids[playerIndex] = move.bid;

      const allBid = bids.every(b => b !== null);

      let newData: OhHellGameData = {
        ...gameData,
        bids,
        lastAction: {
          type: 'BID',
          playerIndex,
          bid: move.bid,
          timestamp: new Date().toISOString()
        }
      };

      if (allBid) {
        // Move to playing phase
        newData.phase = 'PLAYING';
        newData.currentBidder = null;
      } else {
        // Next player bids
        newData.currentBidder = (playerIndex + 1) % gameData.playerCount;
      }

      return {
        success: true,
        gameData: newData,
      };
    }

    // Handle playing card
    if (move.action === 'PLAY_CARD' && move.card) {
      const card = gameData.playerHands[playerIndex].find(c => c.id === move.card)!;

      // Remove card from player's hand
      const playerHands = gameData.playerHands.map((hand, i) =>
        i === playerIndex ? hand.filter(c => c.id !== move.card) : hand
      );

      // Add to current trick
      const currentTrick = { ...gameData.currentTrick };
      currentTrick.cards = [
        ...currentTrick.cards,
        { playerIndex, card }
      ];

      // Set lead suit if first card
      if (currentTrick.cards.length === 1) {
        currentTrick.leadSuit = card.suit;
      }

      let newData: OhHellGameData = {
        ...gameData,
        playerHands,
        currentTrick,
        lastAction: {
          type: 'PLAY_CARD',
          playerIndex,
          card,
          timestamp: new Date().toISOString()
        }
      };

      // Check if trick is complete
      if (currentTrick.cards.length === gameData.playerCount) {
        // Determine trick winner
        const winner = this.determineTrickWinner(
          currentTrick.cards,
          gameData.trumpSuit,
          currentTrick.leadSuit!
        );

        const tricksWon = [...gameData.tricksWon];
        tricksWon[winner]++;

        newData = {
          ...newData,
          tricksWon,
          completedTricks: [
            ...gameData.completedTricks,
            { ...currentTrick, winner }
          ],
          lastAction: {
            type: 'TRICK_WON',
            trickWinner: winner,
            timestamp: new Date().toISOString()
          }
        };

        // Check if round is over
        if (playerHands.every(hand => hand.length === 0)) {
          newData = this.endRound(newData);
        } else {
          // Start new trick
          newData.currentTrick = {
            cards: [],
            leadSuit: null,
            currentPlayer: winner // Winner leads next trick
          };
        }
      } else {
        // Next player's turn
        newData.currentTrick.currentPlayer =
          (currentTrick.currentPlayer + 1) % gameData.playerCount;
      }

      return {
        success: true,
        gameData: newData,
        gameOver: newData.status === 'finished',
        winner: newData.winner,
      };
    }

    // Handle continuing to next round
    if (move.action === 'CONTINUE_ROUND' && gameData.phase === 'ROUND_OVER') {
      const newData = this.advanceToNextRound(gameData);

      return {
        success: true,
        gameData: newData,
        gameOver: newData.status === 'finished',
        winner: newData.winner,
      };
    }

    return {
      success: false,
      error: 'Invalid move',
    };
  }

  /**
   * Check if game is over
   */
  isGameOver(gameData: OhHellGameData): boolean {
    return gameData.status === 'finished';
  }

  /**
   * Get winner(s)
   */
  getWinner(gameData: OhHellGameData): string | string[] | null {
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
# Oh Hell! (Bugger Your Neighbor) - Rules

## Objective
Score the most points over 19 rounds by bidding exactly how many tricks you'll win each round.

## Setup
- 3-5 players
- Standard 52-card deck
- Game consists of 19 rounds (10 cards down to 1, then back up to 10)

## Card Rankings
A (high) > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3 > 2 (low)

## Each Round
1. **Deal**: Cards are dealt (10, then 9, 8... down to 1, then back up to 10)
2. **Trump**: Top card of remaining deck becomes trump suit (or no trump if all dealt)
3. **Bidding**: Each player bids 0-N tricks (N = cards in hand)
   - **Dealer restriction**: Dealer cannot bid a number that makes total bids = total tricks
4. **Play**: Player left of dealer leads; must follow suit if possible
5. **Scoring**: Made bid exactly = 10 + bid points; failed bid = 0 points

## Trump
- Trump cards beat all non-trump cards
- Highest trump wins the trick
- If no trump played, highest card of led suit wins

## Winning
Highest score after all 19 rounds wins!
    `.trim();
  }

  /**
   * Get current game status
   */
  getStatus(gameData: OhHellGameData): string {
    if (gameData.status === 'finished') {
      const winners = Array.isArray(gameData.winner) ? gameData.winner : [gameData.winner];
      return `Game Over - ${winners.join(', ')} wins!`;
    }

    if (gameData.phase === 'BIDDING') {
      return `Round ${gameData.currentRound}/${gameData.totalRounds} - Bidding (${gameData.cardsThisRound} cards)`;
    }

    if (gameData.phase === 'PLAYING') {
      return `Round ${gameData.currentRound}/${gameData.totalRounds} - Playing (${gameData.cardsThisRound} cards)`;
    }

    if (gameData.phase === 'ROUND_OVER') {
      return `Round ${gameData.currentRound}/${gameData.totalRounds} - Complete`;
    }

    return 'In Progress';
  }
}
