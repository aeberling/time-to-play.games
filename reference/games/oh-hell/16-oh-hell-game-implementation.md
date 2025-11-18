# Bugger Your Neighbor (Oh Hell!) - Implementation Guide

## Game Overview

**Bugger Your Neighbor** (also known as **Oh Hell!**, **Oh Pshaw**, **Blackout**, or **Up and Down the River**) is a strategic trick-taking card game where players must bid exactly how many tricks they'll win. The challenge: at least one player must fail each round due to the dealer's bidding restriction.

**Why Oh Hell is great for the platform:**
- Perfect for 3-5 players
- Strategic depth (bidding + trick-taking)
- Multiple rounds with escalating/de-escalating complexity
- Simple rules but challenging execution
- High replayability with changing trump suits
- Quick rounds with clear scoring

## Game Rules

### Setup

**Players and Deck:**
- **3-5 players** (this implementation)
- **1 standard 52-card deck** (no jokers)
- Game consists of multiple rounds (hands)

**Card Rankings:**
- **High to low:** A-K-Q-J-10-9-8-7-6-5-4-3-2
- Aces are **high**
- Suits have no inherent ranking (except trump)

### Round Structure (The "Elevator")

The game progresses through multiple hands with decreasing then increasing card counts:

**For 3-5 players:**
1. Start with **10 cards** per player
2. Each round, deal **one fewer card**
3. Continue down to **1 card** per player
4. Then increase back up to **10 cards**
5. Game ends after the final 10-card hand

**Example progression (4 players):**
- Round 1: 10 cards each
- Round 2: 9 cards each
- Round 3: 8 cards each
- ...
- Round 10: 1 card each
- Round 11: 2 cards each
- ...
- Round 19: 10 cards each (final round)

**Total rounds:** 19 rounds for 3-5 players

### Dealing and Trump Determination

**Each Round:**
1. Dealer rotates clockwise each round
2. Deal cards **face-down**, one at a time, clockwise from dealer's left
3. After dealing, **turn over the top card** of remaining deck
4. This card's suit becomes **trump** for the round
5. If all cards are dealt (no remainder), there is **no trump** that round

**Trump Suit:**
- Trump cards beat all non-trump cards
- The lowest trump beats the highest non-trump

### Bidding Phase

**Bidding Order:**
1. Player to dealer's **left** bids first
2. Bidding proceeds **clockwise**
3. Dealer bids **last**

**Bidding Rules:**
- Each player bids **0 to N** tricks (where N = cards in hand)
- Bid represents **exactly** how many tricks you think you'll win
- You **cannot pass** - must make a bid

**The Dealer's Restriction (Critical Rule):**
- The dealer **cannot bid** a number that would make the total bids equal the total tricks available
- This ensures **at least one player must fail** each round
- Example: 4 players, 5 cards each = 5 tricks available
  - If first 3 players bid: 2, 1, 1 (total = 4)
  - Dealer **cannot** bid 1 (would make total = 5)
  - Dealer must bid 0, 2, 3, 4, or 5

### Playing Tricks

**Trick Order:**
1. Player to **dealer's left** leads the first trick
2. Play proceeds **clockwise**
3. Each player plays **one card**
4. Winner of trick leads the next trick

**Following Suit:**
- Players **must follow suit** if possible
- If you cannot follow suit:
  - You may play a **trump** (beats all non-trump)
  - Or you may **discard** any other card (cannot win)

**Winning a Trick:**
1. **Highest trump** played wins
2. If no trump played, **highest card of led suit** wins
3. Trick winner collects cards and leads next trick

### Scoring

**Standard Scoring System:**

- **Made your bid exactly:** `10 + bid` points
  - Bid 0, made 0: **10 points**
  - Bid 3, made 3: **13 points**
  - Bid 5, made 5: **15 points**

- **Failed your bid (over or under):** `0 points`
  - Bid 3, made 2: **0 points**
  - Bid 3, made 4: **0 points**

**Alternative Scoring (can be selected as variant):**

- **Made your bid exactly:** `10 + bid` points (same)
- **Failed your bid:** `1 point per trick won` (no bonus)
  - Bid 3, made 2: **2 points**
  - Bid 3, made 4: **4 points**

### Winning

- **Highest cumulative score** after all rounds wins
- In case of tie, tied players share victory

## Data Structures

### Game State

```typescript
interface OhHellGameState {
  // Game configuration
  playerCount: number;
  maxCards: number; // 10 for 3-5 players
  scoringVariant: 'standard' | 'partial'; // standard = 0 for fails, partial = tricks won

  // Round progression
  currentRound: number; // 1-19 for 3-5 players
  totalRounds: number; // 19 for 3-5 players
  cardsThisRound: number; // 10, 9, 8, ..., 1, 2, ..., 10
  isAscending: boolean; // false until after 1-card round, then true

  // Trump
  trumpSuit: 'clubs' | 'diamonds' | 'hearts' | 'spades' | 'none';
  trumpCard: string | null; // The card that was flipped

  // Dealer
  dealerIndex: number; // Rotates each round

  // Player hands
  playerHands: string[][]; // [player1Cards, player2Cards, ...]

  // Bidding phase
  phase: 'BIDDING' | 'PLAYING' | 'ROUND_OVER' | 'GAME_OVER';
  bids: (number | null)[]; // null = hasn't bid yet
  currentBidder: number | null; // Index of player currently bidding

  // Trick-taking phase
  currentTrick: {
    cards: { playerIndex: number; card: string }[];
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
    card?: string;
    trickWinner?: number;
    timestamp: string;
  } | null;
}
```

### Card Representation

```typescript
interface Card {
  id: string; // e.g., "clubs_ace", "hearts_7"
  suit: 'clubs' | 'diamonds' | 'hearts' | 'spades';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'jack' | 'queen' | 'king' | 'ace';
  value: number; // 2-14 for comparison (Ace = 14)
  imageUrl: string;
}

// Card value mapping (Ace high)
const CARD_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'jack': 11, 'queen': 12, 'king': 13, 'ace': 14
};
```

### Move Data Structure

```typescript
interface OhHellMove {
  action: 'BID' | 'PLAY_CARD';

  // For BID action
  bid?: number; // 0 to cardsInHand

  // For PLAY_CARD action
  card?: string; // Card ID to play
}
```

## Game Engine Implementation

### OhHellGame Class

```typescript
// lib/games/oh-hell/OhHellGame.ts

export class OhHellGame implements Game {
  private state: OhHellGameState;
  private deck: Card[];

  constructor(playerCount: number, scoringVariant: 'standard' | 'partial' = 'standard', initialState?: OhHellGameState) {
    if (playerCount < 3 || playerCount > 5) {
      throw new Error('Oh Hell requires 3-5 players');
    }

    this.deck = this.createDeck();
    this.state = initialState || this.initializeGame(playerCount, scoringVariant);
  }

  private initializeGame(playerCount: number, scoringVariant: 'standard' | 'partial'): OhHellGameState {
    const maxCards = 10; // For 3-5 players
    const totalRounds = (maxCards * 2) - 1; // 10 down to 1, back up to 10 = 19 rounds

    return {
      playerCount,
      maxCards,
      scoringVariant,
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
      currentBidder: 1, // Player to left of dealer bids first
      currentTrick: {
        cards: [],
        leadSuit: null,
        currentPlayer: 1 // Player to left of dealer leads
      },
      tricksWon: new Array(playerCount).fill(0),
      completedTricks: [],
      scores: new Array(playerCount).fill(0),
      roundScores: new Array(playerCount).fill(0),
      lastAction: null
    };
  }

  // Start a new round
  startRound(state: OhHellGameState): OhHellGameState {
    const newState = { ...state };

    // Deal cards
    const { hands, trumpCard, trumpSuit } = this.dealRound(
      newState.cardsThisRound,
      newState.playerCount
    );

    newState.playerHands = hands;
    newState.trumpCard = trumpCard;
    newState.trumpSuit = trumpSuit;

    // Reset round state
    newState.phase = 'BIDDING';
    newState.bids = new Array(newState.playerCount).fill(null);
    newState.currentBidder = (newState.dealerIndex + 1) % newState.playerCount;
    newState.tricksWon = new Array(newState.playerCount).fill(0);
    newState.completedTricks = [];
    newState.roundScores = new Array(newState.playerCount).fill(0);

    newState.currentTrick = {
      cards: [],
      leadSuit: null,
      currentPlayer: (newState.dealerIndex + 1) % newState.playerCount
    };

    return newState;
  }

  private dealRound(cardsPerPlayer: number, playerCount: number): {
    hands: string[][];
    trumpCard: string | null;
    trumpSuit: 'clubs' | 'diamonds' | 'hearts' | 'spades' | 'none';
  } {
    const shuffled = this.shuffleDeck([...this.deck]);
    const hands: string[][] = [];

    // Deal cards to players
    let cardIndex = 0;
    for (let i = 0; i < playerCount; i++) {
      hands.push([]);
    }

    for (let round = 0; round < cardsPerPlayer; round++) {
      for (let player = 0; player < playerCount; player++) {
        hands[player].push(shuffled[cardIndex++].id);
      }
    }

    // Determine trump
    const totalDealt = cardsPerPlayer * playerCount;
    if (totalDealt < 52) {
      // Flip next card for trump
      const trumpCard = shuffled[totalDealt];
      return {
        hands,
        trumpCard: trumpCard.id,
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

  private createDeck(): Card[] {
    const suits = ['clubs', 'diamonds', 'hearts', 'spades'] as const;
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'] as const;
    const deck: Card[] = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({
          id: `${suit}_${rank}`,
          suit,
          rank,
          value: CARD_VALUES[rank],
          imageUrl: `/cards/default/${suit}_${rank}.png`
        });
      }
    }

    return deck;
  }

  private shuffleDeck(deck: Card[]): Card[] {
    // Fisher-Yates shuffle
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Validate move
  validateMove(playerIndex: number, moveData: OhHellMove): ValidationResult {
    const state = this.state;

    if (state.phase === 'BIDDING') {
      if (moveData.action !== 'BID') {
        return { valid: false, error: 'Must bid during bidding phase' };
      }

      if (state.currentBidder !== playerIndex) {
        return { valid: false, error: 'Not your turn to bid' };
      }

      if (moveData.bid === undefined || moveData.bid < 0 || moveData.bid > state.cardsThisRound) {
        return { valid: false, error: `Bid must be between 0 and ${state.cardsThisRound}` };
      }

      // Check dealer restriction
      if (playerIndex === state.dealerIndex) {
        const totalBids = state.bids.reduce((sum, b) => sum + (b || 0), 0);
        const totalTricks = state.cardsThisRound;

        if (totalBids + moveData.bid === totalTricks) {
          return {
            valid: false,
            error: `Dealer cannot bid ${moveData.bid} - would make total bids equal total tricks`
          };
        }
      }

      return { valid: true };
    }

    if (state.phase === 'PLAYING') {
      if (moveData.action !== 'PLAY_CARD') {
        return { valid: false, error: 'Must play card during playing phase' };
      }

      if (state.currentTrick.currentPlayer !== playerIndex) {
        return { valid: false, error: 'Not your turn to play' };
      }

      if (!moveData.card) {
        return { valid: false, error: 'Must specify a card to play' };
      }

      // Check player has card
      if (!state.playerHands[playerIndex].includes(moveData.card)) {
        return { valid: false, error: 'You do not have this card' };
      }

      // Check following suit
      const card = this.getCardById(moveData.card);
      const leadSuit = state.currentTrick.leadSuit;

      if (leadSuit && card.suit !== leadSuit) {
        // Must follow suit if possible
        const hasLeadSuit = state.playerHands[playerIndex].some(cardId => {
          const c = this.getCardById(cardId);
          return c.suit === leadSuit;
        });

        if (hasLeadSuit) {
          return { valid: false, error: `Must follow suit (${leadSuit})` };
        }
      }

      return { valid: true };
    }

    return { valid: false, error: 'Invalid game phase' };
  }

  // Apply move
  applyMove(playerIndex: number, moveData: OhHellMove): OhHellGameState {
    let newState = { ...this.state };

    if (moveData.action === 'BID' && moveData.bid !== undefined) {
      newState.bids[playerIndex] = moveData.bid;

      newState.lastAction = {
        type: 'BID',
        playerIndex,
        bid: moveData.bid,
        timestamp: new Date().toISOString()
      };

      // Check if all players have bid
      const allBid = newState.bids.every(b => b !== null);

      if (allBid) {
        // Move to playing phase
        newState.phase = 'PLAYING';
        newState.currentBidder = null;
      } else {
        // Next player bids
        newState.currentBidder = (playerIndex + 1) % newState.playerCount;
      }

      return newState;
    }

    if (moveData.action === 'PLAY_CARD' && moveData.card) {
      const card = this.getCardById(moveData.card);

      // Remove card from player's hand
      newState.playerHands[playerIndex] = newState.playerHands[playerIndex].filter(
        c => c !== moveData.card
      );

      // Add to current trick
      newState.currentTrick.cards.push({
        playerIndex,
        card: moveData.card
      });

      // Set lead suit if first card
      if (newState.currentTrick.cards.length === 1) {
        newState.currentTrick.leadSuit = card.suit;
      }

      newState.lastAction = {
        type: 'PLAY_CARD',
        playerIndex,
        card: moveData.card,
        timestamp: new Date().toISOString()
      };

      // Check if trick is complete
      if (newState.currentTrick.cards.length === newState.playerCount) {
        // Determine trick winner
        const winner = this.determineTrickWinner(newState.currentTrick, newState.trumpSuit);
        newState.tricksWon[winner]++;

        newState.completedTricks.push({
          ...newState.currentTrick,
          winner
        });

        newState.lastAction = {
          type: 'TRICK_WON',
          trickWinner: winner,
          timestamp: new Date().toISOString()
        };

        // Check if round is over
        if (newState.playerHands.every(hand => hand.length === 0)) {
          return this.endRound(newState);
        }

        // Start new trick
        newState.currentTrick = {
          cards: [],
          leadSuit: null,
          currentPlayer: winner // Winner leads next trick
        };
      } else {
        // Next player's turn
        newState.currentTrick.currentPlayer =
          (newState.currentTrick.currentPlayer + 1) % newState.playerCount;
      }

      return newState;
    }

    return newState;
  }

  private determineTrickWinner(trick: any, trumpSuit: string): number {
    const { cards, leadSuit } = trick;

    let winningIndex = 0;
    let winningCard = this.getCardById(cards[0].card);

    for (let i = 1; i < cards.length; i++) {
      const card = this.getCardById(cards[i].card);

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

    return cards[winningIndex].playerIndex;
  }

  private endRound(state: OhHellGameState): OhHellGameState {
    const newState = { ...state };

    // Calculate scores
    for (let i = 0; i < newState.playerCount; i++) {
      const bid = newState.bids[i]!;
      const won = newState.tricksWon[i];

      if (bid === won) {
        // Made bid exactly
        newState.roundScores[i] = 10 + bid;
      } else {
        // Missed bid
        if (newState.scoringVariant === 'standard') {
          newState.roundScores[i] = 0;
        } else {
          // Partial scoring: 1 point per trick won
          newState.roundScores[i] = won;
        }
      }

      newState.scores[i] += newState.roundScores[i];
    }

    newState.phase = 'ROUND_OVER';

    newState.lastAction = {
      type: 'ROUND_END',
      timestamp: new Date().toISOString()
    };

    return newState;
  }

  // Start next round
  advanceToNextRound(state: OhHellGameState): OhHellGameState {
    const newState = { ...state };

    newState.currentRound++;

    // Check if game is over
    if (newState.currentRound > newState.totalRounds) {
      newState.phase = 'GAME_OVER';
      return newState;
    }

    // Advance dealer
    newState.dealerIndex = (newState.dealerIndex + 1) % newState.playerCount;

    // Determine cards for next round
    if (newState.cardsThisRound === 1) {
      // Switch from descending to ascending
      newState.isAscending = true;
      newState.cardsThisRound = 2;
    } else if (newState.isAscending) {
      newState.cardsThisRound++;
    } else {
      newState.cardsThisRound--;
    }

    // Deal new round
    return this.startRound(newState);
  }

  checkGameOver(state: OhHellGameState): GameOverResult {
    if (state.phase === 'GAME_OVER') {
      // Find highest score
      let highestScore = -Infinity;
      let winnerId = 0;

      for (let i = 0; i < state.playerCount; i++) {
        if (state.scores[i] > highestScore) {
          highestScore = state.scores[i];
          winnerId = i;
        }
      }

      return {
        isGameOver: true,
        winnerId,
        reason: 'All rounds completed',
        finalScores: state.scores
      };
    }

    return { isGameOver: false };
  }

  private getCardById(cardId: string): Card {
    const [suit, rank] = cardId.split('_');
    return {
      id: cardId,
      suit: suit as any,
      rank: rank as any,
      value: CARD_VALUES[rank as keyof typeof CARD_VALUES],
      imageUrl: `/cards/default/${suit}_${rank}.png`
    };
  }

  getState(): OhHellGameState {
    return this.state;
  }

  // Initialize game and deal first round
  static createAndStart(playerCount: number, scoringVariant: 'standard' | 'partial' = 'standard'): OhHellGame {
    const game = new OhHellGame(playerCount, scoringVariant);
    game.state = game.startRound(game.state);
    return game;
  }
}
```

## Client-Side UI Components

### Game Board Layout

```
┌────────────────────────────────────────────────────────────┐
│  Round 5/19  |  Cards: 6  |  Trump: ♥ Hearts              │
│                                                             │
│  Player 2: Bid 2/Won 1    Player 3: Bid 1/Won 1            │
│  Score: 45                Score: 58                         │
│                                                             │
│                    Current Trick                            │
│              ┌──┐      ┌──┐      ┌──┐                      │
│         P2:  │7♥│ P3:  │K♦│ P4:  │A♥│  ← P4 winning       │
│              └──┘      └──┘      └──┘                      │
│                   Lead: Hearts                              │
│                                                             │
│  Player 4: Bid 2/Won 2                                     │
│  Score: 72                                                  │
│                                                             │
│─────────────────────────────────────────────────────────────│
│  You (Player 1): Bid 3 | Won so far: 2 | Score: 63        │
│                                                             │
│  Your Hand:  ┌──┐ ┌──┐ ┌──┐ ┌──┐                          │
│              │3♥│ │Q♠│ │9♣│ │2♥│   (Your turn!)           │
│              └──┘ └──┘ └──┘ └──┘                          │
│                ↑                                            │
│              Valid (must follow hearts)                     │
└────────────────────────────────────────────────────────────┘
```

### Bidding Interface

```
┌────────────────────────────────────────────────────────────┐
│  Round 1/19  |  Cards: 10  |  Trump: ♠ Spades            │
│                                                             │
│  Your Hand:                                                 │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐    │
│  │A♠│ │K♥│ │Q♠│ │10♦│ │8♠│ │7♣│ │5♥│ │4♦│ │3♠│ │2♣│   │
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘    │
│                                                             │
│  Current Bids:                                              │
│  Player 2: 3  |  Player 3: 2  |  Player 4: ?               │
│                                                             │
│  How many tricks will you win?                              │
│  [0] [1] [2] [3] [4] [5] [6] [7] [8] [9] [10]             │
│                                                             │
│  ⚠️  You are the dealer! Cannot bid 5 (total would be 10) │
└────────────────────────────────────────────────────────────┘
```

## Key Implementation Considerations

### Dealer Restriction Logic

```typescript
function getValidBids(
  playerIndex: number,
  dealerIndex: number,
  currentBids: (number | null)[],
  maxBid: number
): number[] {
  const validBids: number[] = [];

  for (let bid = 0; bid <= maxBid; bid++) {
    if (playerIndex === dealerIndex) {
      // Check dealer restriction
      const totalBids = currentBids.reduce((sum, b) => sum + (b || 0), 0);
      if (totalBids + bid === maxBid) {
        continue; // Invalid for dealer
      }
    }
    validBids.push(bid);
  }

  return validBids;
}
```

### Round Progression Calculator

```typescript
function getRoundProgression(maxCards: number): number[] {
  const rounds: number[] = [];

  // Descending: maxCards down to 1
  for (let i = maxCards; i >= 1; i--) {
    rounds.push(i);
  }

  // Ascending: 2 back up to maxCards
  for (let i = 2; i <= maxCards; i++) {
    rounds.push(i);
  }

  return rounds;
}

// For 10 cards: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

### Trick Winner Determination

```typescript
function findTrickWinner(
  trick: { playerIndex: number; card: Card }[],
  trumpSuit: string,
  leadSuit: string
): number {
  let winner = trick[0];

  for (let i = 1; i < trick.length; i++) {
    const current = trick[i];

    // Trump always wins over non-trump
    if (current.card.suit === trumpSuit && winner.card.suit !== trumpSuit) {
      winner = current;
    }
    // Both trump: higher value wins
    else if (current.card.suit === trumpSuit && winner.card.suit === trumpSuit) {
      if (current.card.value > winner.card.value) {
        winner = current;
      }
    }
    // Both lead suit: higher value wins
    else if (current.card.suit === leadSuit && winner.card.suit === leadSuit) {
      if (current.card.value > winner.card.value) {
        winner = current;
      }
    }
    // Current is lead suit, winner is not (and not trump): current wins
    else if (current.card.suit === leadSuit && winner.card.suit !== trumpSuit && winner.card.suit !== leadSuit) {
      winner = current;
    }
  }

  return winner.playerIndex;
}
```

## Scoring Variants

### Standard (Strict)

```typescript
function calculateScore(bid: number, tricksWon: number): number {
  if (bid === tricksWon) {
    return 10 + bid;
  }
  return 0; // Failed = no points
}
```

### Partial Credit

```typescript
function calculateScore(bid: number, tricksWon: number): number {
  if (bid === tricksWon) {
    return 10 + bid;
  }
  return tricksWon; // Failed = 1 point per trick
}
```

### Penalty Variant (Alternative)

```typescript
function calculateScore(bid: number, tricksWon: number): number {
  if (bid === tricksWon) {
    return 10 + bid;
  }
  const difference = Math.abs(bid - tricksWon);
  return -difference; // Negative points for missing
}
```

## Testing Strategy

```typescript
describe('OhHellGame', () => {
  test('should deal correct number of cards per round', () => {
    const game = OhHellGame.createAndStart(4);
    const state = game.getState();

    expect(state.cardsThisRound).toBe(10);
    state.playerHands.forEach(hand => {
      expect(hand.length).toBe(10);
    });
  });

  test('should enforce dealer bidding restriction', () => {
    const game = OhHellGame.createAndStart(4);
    let state = game.getState();

    // Simulate bids that sum to 9 (with 10 tricks available)
    state.bids = [3, 3, 3, null];
    state.currentBidder = 3; // Dealer
    state.dealerIndex = 3;

    // Dealer cannot bid 1 (would make total = 10)
    const result = game.validateMove(3, { action: 'BID', bid: 1 });
    expect(result.valid).toBe(false);

    // Dealer can bid 0 or 2+
    const result2 = game.validateMove(3, { action: 'BID', bid: 2 });
    expect(result2.valid).toBe(true);
  });

  test('should require following suit', () => {
    // Create game state with specific hands
    // Player has hearts but tries to play clubs when hearts led
    // Should be invalid
  });

  test('should correctly determine trick winner', () => {
    // Test cases:
    // - Trump beats non-trump
    // - Higher trump beats lower trump
    // - Lead suit beats off-suit (no trump played)
    // - Highest card of lead suit wins
  });

  test('should score correctly', () => {
    expect(calculateScore(3, 3)).toBe(13); // Made bid
    expect(calculateScore(3, 2)).toBe(0);  // Missed bid
    expect(calculateScore(0, 0)).toBe(10); // Made zero bid
  });

  test('should progress through rounds correctly', () => {
    const progression = getRoundProgression(10);
    expect(progression).toEqual([10,9,8,7,6,5,4,3,2,1,2,3,4,5,6,7,8,9,10]);
    expect(progression.length).toBe(19);
  });
});
```

## Strategy Tips (for AI and Players)

1. **Bidding Strategy:**
   - Count likely tricks based on high cards and trump
   - Ace in non-trump suit = likely 1 trick
   - Multiple high trumps = likely multiple tricks
   - Be conservative - missing bid = 0 points

2. **Playing Strategy:**
   - Lead with losing cards early to avoid unwanted tricks
   - Save high cards to guarantee tricks you bid
   - Track cards played to know what's left
   - If you've made your bid, try to avoid winning more

3. **Dealer Position:**
   - Disadvantage: restricted bidding
   - Advantage: last to bid (most information)
   - Plan bid based on restriction before your turn

4. **Trump Management:**
   - High trumps are valuable - don't waste them
   - Low trumps can steal tricks when void in suit
   - Track trump cards played

## Variants

### No Trump Rotation
Instead of flipping a card, rotate through suits: Clubs → Diamonds → Hearts → Spades → No Trump → repeat

### Canadian Oh Hell
- Bid 0 = 5 bonus points (instead of 10)
- Failed bid = negative points equal to difference

### Elevator (Implemented)
- Standard up-and-down progression
- 19 rounds for 3-5 players

---

This implementation provides a complete, strategic trick-taking game with the unique tension of exact bidding and the dealer's restriction ensuring competitive gameplay every round.
