# Swoop Card Game - Implementation Guide

## Game Overview

Swoop (also known as Swipe, Swoosh, or Swish) is a fast-paced shedding card game that combines elements of strategy and luck. Players race to be the first to get rid of all their cards - from their hand, face-up table cards, and mystery face-down cards.

**Why Swoop is great for the platform:**
- Supports 3-8 players (excellent for groups)
- Fast-paced with exciting "swoop" moments
- Strategic depth (hand management, when to play mystery cards)
- Turn-based with clear game states
- Engaging social gameplay

## Game Rules

### Setup

**Players and Decks:**
- 3-4 players: 2 standard 52-card decks + 4 jokers (108 cards total)
- 5-6 players: 3 decks + 6 jokers (162 cards total)
- 7-8 players: 4 decks + 8 jokers (216 cards total)

**Card Distribution:**
1. Each player receives **19 cards** total
2. Without looking, each player places **4 cards face-down** in a row (mystery cards)
3. Then places **4 cards face-up** on top of each mystery card
4. Remaining **11 cards** form the player's hand

**Card Rankings:**
- Suits are irrelevant
- Ranks from low to high: **A-2-3-4-5-6-7-8-9-J-Q-K**
- **10s and Jokers** are special cards with no rank

### Gameplay

**Turn Structure:**
1. Player plays 1-4 cards from hand OR face-up table cards (or both)
2. All cards played together must be **equal in rank**
3. Play continues clockwise

**Valid Plays:**

1. **Equal or Lower Rank:**
   - Play cards matching the top card's rank
   - Play cards lower than the top card
   - Cards go on top of the central pile

2. **Higher Rank:**
   - If you play a higher rank card, you must **pick up the entire pile**
   - Add pile to your hand
   - Your turn ends

3. **Empty Pile:**
   - Any card(s) can start a new pile

4. **Special Cards (10s and Jokers):**
   - Can be played **at any time** regardless of pile
   - Instantly triggers a Swoop (see below)

**The Swoop Mechanic:**

A **Swoop** occurs when the top four cards of the play pile are equal in rank. This can happen by:
- Playing 4 cards of the same rank at once
- Playing cards that make the total equal cards on top = 4
  - Example: 2 Queens on pile → play 2 Queens = Swoop!
- Playing a 10 or Joker (automatic Swoop)

**When a Swoop happens:**
1. The entire central pile is removed from the game
2. The player who caused the Swoop takes another turn immediately
3. The pile starts fresh

**Important Swoop Rule:**
- You **cannot** create more than 4 equal cards on top
- Example: If 3 eights are on top, you cannot play 2 eights (would make 5)

**Playing Face-Up and Mystery Cards:**

1. **Face-Up Cards:**
   - Can be played once hand is empty
   - Can combine with hand cards (if same rank)
   - Play like normal cards

2. **Mystery Cards (Face-Down):**
   - Only playable after the face-up card covering it is gone
   - Played **blind** - flip it when you play it
   - If the revealed card is **higher** than the pile → pick up entire pile
   - If equal or lower → valid play (and may cause a Swoop!)

**Optional Play:**
- Players **may skip their turn** if they wish
- However, if you cannot make a valid play, you must pick up the pile

### Winning

**Round Victory:**
- First player to get rid of ALL cards wins the round:
  - Hand cards
  - Face-up table cards
  - All 4 mystery cards

**Scoring:**

When a player goes out, all other players count their remaining cards:

| Card | Points |
|------|--------|
| Ace | 1 |
| 2-9 | Face value (2=2pts, 9=9pts) |
| Jack, Queen, King | 10 each |
| 10s and Jokers | 50 each |

**Game Victory:**
- Scores accumulate over multiple rounds
- When any player reaches **500+ points**, the game ends
- Player with the **lowest total score** wins

## Data Structures

### Game State

```typescript
interface SwoopGameState {
  // Number of players
  playerCount: number;

  // Player hands (arrays of card IDs)
  playerHands: string[][]; // [player1Hand, player2Hand, ...]

  // Face-up table cards for each player
  faceUpCards: string[][]; // [player1FaceUp, player2FaceUp, ...]

  // Mystery cards (face-down) for each player
  mysteryCards: string[][]; // [player1Mystery, player2Mystery, ...]

  // Central play pile
  playPile: string[];

  // Cards removed from game (from swoops)
  removedCards: string[];

  // Current turn
  currentPlayerIndex: number;

  // Game phase
  phase: 'SETUP' | 'PLAYING' | 'ROUND_OVER' | 'GAME_OVER';

  // Round number
  round: number;

  // Player scores (cumulative across rounds)
  scores: number[]; // Index matches player index

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
}
```

### Card Representation

```typescript
interface Card {
  id: string;        // e.g., "clubs_ace_1", "hearts_7_2" (includes deck number for multi-deck)
  suit: 'clubs' | 'diamonds' | 'hearts' | 'spades' | 'joker';
  rank: 'ace' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'jack' | 'queen' | 'king' | 'joker';
  value: number;     // 1-13 for regular cards, 0 for 10s and jokers
  imageUrl: string;  // Path to card image
  isSpecial: boolean; // true for 10s and jokers
}

// Card value mapping (for comparison)
const CARD_VALUES = {
  'ace': 1,
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'jack': 11, 'queen': 12, 'king': 13,
  '10': 0,    // Special card
  'joker': 0  // Special card
};

// Card point values (for scoring)
const CARD_POINTS = {
  'ace': 1,
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'jack': 10, 'queen': 10, 'king': 10,
  '10': 50,
  'joker': 50
};
```

### Move Data Structure

```typescript
interface SwoopMove {
  action: 'PLAY' | 'PICKUP' | 'SKIP';

  // For PLAY action
  cards?: string[]; // Card IDs to play
  fromHand?: boolean; // Are cards from hand?
  fromFaceUp?: number[]; // Indices of face-up cards
  fromMystery?: number; // Index of mystery card (only 1 at a time)
}
```

## Game Engine Implementation

### SwoopGame Class

```typescript
// lib/games/swoop/SwoopGame.ts

export class SwoopGame implements Game {
  private state: SwoopGameState;

  constructor(playerCount: number, initialState?: SwoopGameState) {
    if (playerCount < 3 || playerCount > 8) {
      throw new Error('Swoop requires 3-8 players');
    }
    this.state = initialState || this.initializeGame(playerCount);
  }

  private initializeGame(playerCount: number): SwoopGameState {
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

      // 4 mystery cards (face down)
      mysteryCards.push(playerCards.slice(0, 4).map(c => c.id));

      // 4 face-up cards
      faceUpCards.push(playerCards.slice(4, 8).map(c => c.id));

      // 11 hand cards
      playerHands.push(playerCards.slice(8, 19).map(c => c.id));

      // Initialize score
      scores.push(0);
    }

    return {
      playerCount,
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
      recentSwoop: false
    };
  }

  private getDeckCount(playerCount: number): number {
    if (playerCount <= 4) return 2;
    if (playerCount <= 6) return 3;
    return 4;
  }

  private createDecks(deckCount: number): Card[] {
    const suits = ['clubs', 'diamonds', 'hearts', 'spades'] as const;
    const ranks = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'] as const;
    const allCards: Card[] = [];

    for (let deckNum = 1; deckNum <= deckCount; deckNum++) {
      // Regular cards
      for (const suit of suits) {
        for (const rank of ranks) {
          allCards.push({
            id: `${suit}_${rank}_${deckNum}`,
            suit,
            rank,
            value: CARD_VALUES[rank],
            imageUrl: `/cards/default/${suit}_${rank}.png`,
            isSpecial: rank === '10'
          });
        }
      }

      // Add 2 jokers per deck
      for (let j = 1; j <= 2; j++) {
        allCards.push({
          id: `joker_${deckNum}_${j}`,
          suit: 'joker',
          rank: 'joker',
          value: 0,
          imageUrl: `/cards/default/joker.png`,
          isSpecial: true
        });
      }
    }

    return allCards;
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

  // Validate if move is legal
  validateMove(playerIndex: number, moveData: SwoopMove): ValidationResult {
    // Check if it's player's turn
    if (playerIndex !== this.state.currentPlayerIndex) {
      return { valid: false, error: 'Not your turn' };
    }

    // Check if game is over
    if (this.state.phase === 'ROUND_OVER' || this.state.phase === 'GAME_OVER') {
      return { valid: false, error: 'Round/Game is over' };
    }

    if (moveData.action === 'SKIP') {
      return { valid: true }; // Skipping is always valid
    }

    if (moveData.action === 'PICKUP') {
      // Pickup is valid if pile has cards
      if (this.state.playPile.length === 0) {
        return { valid: false, error: 'No pile to pick up' };
      }
      return { valid: true };
    }

    if (moveData.action === 'PLAY') {
      if (!moveData.cards || moveData.cards.length === 0) {
        return { valid: false, error: 'No cards specified' };
      }

      // Verify player owns these cards
      const hasCards = this.playerHasCards(playerIndex, moveData);
      if (!hasCards) {
        return { valid: false, error: 'You do not have these cards' };
      }

      // All cards must be same rank
      const cards = moveData.cards.map(id => this.getCardById(id));
      const firstRank = cards[0].rank;
      const allSameRank = cards.every(c => c.rank === firstRank);

      if (!allSameRank) {
        return { valid: false, error: 'All cards must have the same rank' };
      }

      // Check if play is valid against pile
      const isValidPlay = this.isValidPlay(cards, this.state.playPile);
      if (!isValidPlay.valid) {
        return isValidPlay;
      }

      // Check swoop constraint: cannot create more than 4 equal cards
      if (!isValidPlay.isSwoopCard) {
        const topCard = this.getTopPileCard();
        if (topCard && topCard.rank === firstRank) {
          const equalCount = this.countEqualCardsOnTop();
          if (equalCount + cards.length > 4) {
            return { valid: false, error: 'Cannot create more than 4 equal cards on pile' };
          }
        }
      }

      return { valid: true };
    }

    return { valid: false, error: 'Invalid action' };
  }

  private playerHasCards(playerIndex: number, moveData: SwoopMove): boolean {
    if (!moveData.cards) return false;

    const cardSet = new Set(moveData.cards);

    // Check hand
    if (moveData.fromHand) {
      const handSet = new Set(this.state.playerHands[playerIndex]);
      for (const card of cardSet) {
        if (!handSet.has(card)) return false;
      }
    }

    // Check face-up
    if (moveData.fromFaceUp && moveData.fromFaceUp.length > 0) {
      const faceUp = this.state.faceUpCards[playerIndex];
      for (const idx of moveData.fromFaceUp) {
        if (idx < 0 || idx >= faceUp.length) return false;
        if (!cardSet.has(faceUp[idx])) return false;
      }
    }

    // Check mystery
    if (moveData.fromMystery !== undefined) {
      const mystery = this.state.mysteryCards[playerIndex];
      if (moveData.fromMystery < 0 || moveData.fromMystery >= mystery.length) {
        return false;
      }
      if (!cardSet.has(mystery[moveData.fromMystery])) return false;
    }

    return true;
  }

  private isValidPlay(cards: Card[], pile: string[]): ValidationResult {
    // Special cards (10s and Jokers) can always be played
    if (cards[0].isSpecial) {
      return { valid: true, isSwoopCard: true };
    }

    // Empty pile - any card valid
    if (pile.length === 0) {
      return { valid: true };
    }

    // Get top card of pile
    const topCard = this.getCardById(pile[pile.length - 1]);

    // Cannot play higher rank (unless it's a special card)
    if (cards[0].value > topCard.value) {
      return { valid: false, error: 'Card is higher than pile top - you must pick up the pile' };
    }

    // Equal or lower is valid
    return { valid: true };
  }

  private countEqualCardsOnTop(): number {
    if (this.state.playPile.length === 0) return 0;

    const topCard = this.getCardById(this.state.playPile[this.state.playPile.length - 1]);
    let count = 0;

    for (let i = this.state.playPile.length - 1; i >= 0; i--) {
      const card = this.getCardById(this.state.playPile[i]);
      if (card.rank === topCard.rank) {
        count++;
      } else {
        break;
      }
    }

    return count;
  }

  // Apply a move and return new state
  applyMove(playerIndex: number, moveData: SwoopMove): SwoopGameState {
    const newState = { ...this.state };

    if (moveData.action === 'SKIP') {
      newState.lastAction = {
        type: 'SKIP',
        playerIndex,
        timestamp: new Date().toISOString()
      };

      newState.currentPlayerIndex = (playerIndex + 1) % newState.playerCount;
      return newState;
    }

    if (moveData.action === 'PICKUP') {
      // Add pile to player's hand
      newState.playerHands[playerIndex] = [
        ...newState.playerHands[playerIndex],
        ...newState.playPile
      ];

      newState.playPile = [];

      newState.lastAction = {
        type: 'PICKUP',
        playerIndex,
        cards: [...this.state.playPile],
        timestamp: new Date().toISOString()
      };

      newState.currentPlayerIndex = (playerIndex + 1) % newState.playerCount;
      return newState;
    }

    if (moveData.action === 'PLAY' && moveData.cards) {
      // Remove cards from player's areas
      this.removeCardsFromPlayer(newState, playerIndex, moveData);

      // Add cards to pile
      newState.playPile = [...newState.playPile, ...moveData.cards];

      const cards = moveData.cards.map(id => this.getCardById(id));
      const isSwoopCard = cards[0].isSpecial;

      // Check for swoop
      const swoopTriggered = isSwoopCard || this.checkSwoop(newState.playPile);

      newState.lastAction = {
        type: swoopTriggered ? 'SWOOP' : 'PLAY',
        playerIndex,
        cards: moveData.cards,
        swoopTriggered,
        timestamp: new Date().toISOString()
      };

      if (swoopTriggered) {
        // Remove pile from game
        newState.removedCards = [...newState.removedCards, ...newState.playPile];
        newState.playPile = [];
        newState.recentSwoop = true;

        // Same player goes again - don't increment turn
      } else {
        newState.recentSwoop = false;
        // Next player's turn
        newState.currentPlayerIndex = (playerIndex + 1) % newState.playerCount;
      }

      // Check if player won the round
      if (this.hasPlayerWonRound(newState, playerIndex)) {
        return this.endRound(newState, playerIndex);
      }

      return newState;
    }

    return newState;
  }

  private removeCardsFromPlayer(state: SwoopGameState, playerIndex: number, moveData: SwoopMove): void {
    if (!moveData.cards) return;

    // Remove from hand
    if (moveData.fromHand) {
      const cardSet = new Set(moveData.cards);
      state.playerHands[playerIndex] = state.playerHands[playerIndex].filter(
        c => !cardSet.has(c)
      );
    }

    // Remove from face-up
    if (moveData.fromFaceUp) {
      const indices = [...moveData.fromFaceUp].sort((a, b) => b - a); // Reverse order
      for (const idx of indices) {
        state.faceUpCards[playerIndex].splice(idx, 1);
      }
    }

    // Remove from mystery
    if (moveData.fromMystery !== undefined) {
      state.mysteryCards[playerIndex].splice(moveData.fromMystery, 1);
    }
  }

  private checkSwoop(pile: string[]): boolean {
    if (pile.length < 4) return false;

    // Check if top 4 cards are equal
    const top4 = pile.slice(-4);
    const cards = top4.map(id => this.getCardById(id));

    const firstRank = cards[0].rank;
    return cards.every(c => c.rank === firstRank);
  }

  private hasPlayerWonRound(state: SwoopGameState, playerIndex: number): boolean {
    return (
      state.playerHands[playerIndex].length === 0 &&
      state.faceUpCards[playerIndex].length === 0 &&
      state.mysteryCards[playerIndex].length === 0
    );
  }

  private endRound(state: SwoopGameState, winnerIndex: number): SwoopGameState {
    const newState = { ...state };

    // Calculate scores for all other players
    for (let i = 0; i < newState.playerCount; i++) {
      if (i === winnerIndex) continue;

      const allCards = [
        ...newState.playerHands[i],
        ...newState.faceUpCards[i],
        ...newState.mysteryCards[i]
      ];

      const points = this.calculatePoints(allCards);
      newState.scores[i] += points;
    }

    // Check if game is over (someone reached 500+)
    const maxScore = Math.max(...newState.scores);
    if (maxScore >= 500) {
      newState.phase = 'GAME_OVER';
    } else {
      newState.phase = 'ROUND_OVER';
    }

    newState.lastAction = {
      type: 'ROUND_END',
      playerIndex: winnerIndex,
      timestamp: new Date().toISOString()
    };

    return newState;
  }

  private calculatePoints(cardIds: string[]): number {
    return cardIds.reduce((sum, id) => {
      const card = this.getCardById(id);
      return sum + CARD_POINTS[card.rank];
    }, 0);
  }

  checkGameOver(state: SwoopGameState): GameOverResult {
    if (state.phase === 'GAME_OVER') {
      // Find player with lowest score
      let lowestScore = Infinity;
      let winnerId = 0;

      for (let i = 0; i < state.playerCount; i++) {
        if (state.scores[i] < lowestScore) {
          lowestScore = state.scores[i];
          winnerId = i;
        }
      }

      return {
        isGameOver: true,
        winnerId,
        reason: 'A player reached 500 points',
        finalScores: state.scores
      };
    }

    return { isGameOver: false };
  }

  private getCardById(cardId: string): Card {
    // Parse card ID format: "suit_rank_deckNum" or "joker_deckNum_jokerNum"
    if (cardId.startsWith('joker')) {
      return {
        id: cardId,
        suit: 'joker',
        rank: 'joker',
        value: 0,
        imageUrl: '/cards/default/joker.png',
        isSpecial: true
      };
    }

    const parts = cardId.split('_');
    const suit = parts[0] as any;
    const rank = parts[1] as any;

    return {
      id: cardId,
      suit,
      rank,
      value: CARD_VALUES[rank],
      imageUrl: `/cards/default/${suit}_${rank}.png`,
      isSpecial: rank === '10'
    };
  }

  private getTopPileCard(): Card | null {
    if (this.state.playPile.length === 0) return null;
    return this.getCardById(this.state.playPile[this.state.playPile.length - 1]);
  }

  getState(): SwoopGameState {
    return this.state;
  }

  // Get player-specific view (hide other players' hands and mystery cards)
  getPlayerView(playerIndex: number): any {
    const state = this.state;

    return {
      ...state,
      playerHands: state.playerHands.map((hand, idx) =>
        idx === playerIndex ? hand : new Array(hand.length).fill('hidden')
      ),
      mysteryCards: state.mysteryCards.map((mystery, idx) =>
        idx === playerIndex ? mystery : new Array(mystery.length).fill('hidden')
      )
    };
  }
}
```

## Client-Side UI Components

### Game Board Layout

```
┌───────────────────────────────────────────────────────────────┐
│  Player 2            Player 3            Player 4             │
│  Score: 45           Score: 67           Score: 23            │
│  ┌──┐┌──┐┌──┐      ┌──┐┌──┐┌──┐       ┌──┐┌──┐┌──┐         │
│  │K♠││7♥││?││??│   │A♣││9♦││?││??│    │Q♥││4♠││?││??│        │
│  └──┘└──┘└──┘      └──┘└──┘└──┘       └──┘└──┘└──┘         │
│     (11 cards)        (8 cards)          (15 cards)          │
│                                                                │
│                    Central Pile                                │
│              ┌──┐  ┌──┐  ┌──┐  ┌──┐                          │
│              │8♣│  │8♦│  │8♥│  │8♠│  ← SWOOP!                │
│              └──┘  └──┘  └──┘  └──┘                          │
│                                                                │
│  Your Table Cards:                                             │
│  ┌──┐  ┌──┐  ┌──┐  ┌──┐                                      │
│  │3♥│  │J♠│  │10♦│ │?? │                                     │
│  └──┘  └──┘  └──┘  └──┘                                      │
│                                                                │
│  Your Hand:  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                        │
│              │7♣│ │7♦│ │K♥│ │2♠│ │A♦│   ...                  │
│              └──┘ └──┘ └──┘ └──┘ └──┘                        │
│                                                                │
│  [Play Selected] [Pick Up Pile] [Skip Turn]                   │
└───────────────────────────────────────────────────────────────┘
```

### SwoopGameBoard Component

```typescript
// components/game/SwoopGameBoard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { Button } from '@/components/ui/button';

interface Props {
  gameId: string;
  playerIndex: number;
}

export function SwoopGameBoard({ gameId, playerIndex }: Props) {
  const socket = useSocket();
  const [gameState, setGameState] = useState<SwoopGameState | null>(null);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    socket.on('game:state', (state) => {
      setGameState(state.gameState);
      updateCanPlay(state.gameState);
    });

    socket.on('game:move_made', (data) => {
      setGameState(data.newGameState.gameState);
      updateCanPlay(data.newGameState.gameState);
      setSelectedCards(new Set()); // Clear selection
    });

    return () => {
      socket.off('game:state');
      socket.off('game:move_made');
    };
  }, [socket]);

  function updateCanPlay(state: SwoopGameState) {
    setCanPlay(
      state.currentPlayerIndex === playerIndex &&
      state.phase === 'PLAYING'
    );
  }

  function toggleCard(cardId: string) {
    const newSelection = new Set(selectedCards);
    if (newSelection.has(cardId)) {
      newSelection.delete(cardId);
    } else {
      newSelection.add(cardId);
    }
    setSelectedCards(newSelection);
  }

  function handlePlay() {
    if (selectedCards.size === 0) return;

    const cards = Array.from(selectedCards);
    const hand = gameState!.playerHands[playerIndex];
    const faceUp = gameState!.faceUpCards[playerIndex];

    // Determine where cards are from
    const fromHand = cards.some(c => hand.includes(c));
    const fromFaceUp = cards
      .map(c => faceUp.indexOf(c))
      .filter(idx => idx !== -1);

    socket.emit('game:move', {
      gameId,
      moveData: {
        action: 'PLAY',
        cards,
        fromHand,
        fromFaceUp: fromFaceUp.length > 0 ? fromFaceUp : undefined
      }
    });
  }

  function handlePickup() {
    socket.emit('game:move', {
      gameId,
      moveData: { action: 'PICKUP' }
    });
  }

  function handleSkip() {
    socket.emit('game:move', {
      gameId,
      moveData: { action: 'SKIP' }
    });
  }

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  const myHand = gameState.playerHands[playerIndex];
  const myFaceUp = gameState.faceUpCards[playerIndex];
  const myMystery = gameState.mysteryCards[playerIndex];

  return (
    <div className="flex flex-col h-screen p-4 bg-gradient-to-b from-green-700 to-green-900">

      {/* Other players */}
      <div className="flex justify-around mb-4">
        {gameState.playerHands.map((hand, idx) => {
          if (idx === playerIndex) return null;

          return (
            <div key={idx} className={`text-center ${
              gameState.currentPlayerIndex === idx ? 'ring-2 ring-yellow-400' : ''
            }`}>
              <div className="text-white text-sm mb-1">
                Player {idx + 1} - Score: {gameState.scores[idx]}
              </div>
              <div className="flex gap-1">
                {gameState.faceUpCards[idx].map((card, cardIdx) => (
                  <Card key={cardIdx} cardId={card} size="small" />
                ))}
              </div>
              <div className="text-white text-xs mt-1">
                {hand.length} cards in hand
              </div>
            </div>
          );
        })}
      </div>

      {/* Central Pile */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          {gameState.playPile.length === 0 ? (
            <div className="text-white text-xl opacity-50">
              Empty Pile
            </div>
          ) : (
            <div className="flex gap-2">
              {gameState.playPile.slice(-4).map((cardId, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                >
                  <Card cardId={cardId} size="large" />
                </motion.div>
              ))}
            </div>
          )}

          {gameState.recentSwoop && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.5 }}
              exit={{ scale: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-yellow-400 text-6xl font-bold">
                SWOOP! 🎯
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Your table cards */}
      <div className="mb-4">
        <div className="text-white text-sm mb-2">Your Table:</div>
        <div className="flex gap-2 justify-center">
          {myFaceUp.map((cardId, idx) => (
            <div key={idx} className="relative">
              <Card
                cardId={cardId}
                size="medium"
                onClick={() => canPlay && toggleCard(cardId)}
                selected={selectedCards.has(cardId)}
              />
              {myMystery[idx] && (
                <div className="absolute -bottom-2 -right-2">
                  <Card cardId="back" size="small" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Your hand */}
      <div className="mb-4">
        <div className="text-white text-sm mb-2">Your Hand:</div>
        <div className="flex gap-2 justify-center overflow-x-auto">
          {myHand.map((cardId, idx) => (
            <Card
              key={idx}
              cardId={cardId}
              size="medium"
              onClick={() => canPlay && toggleCard(cardId)}
              selected={selectedCards.has(cardId)}
            />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center">
        <Button
          onClick={handlePlay}
          disabled={!canPlay || selectedCards.size === 0}
          variant="default"
        >
          Play Selected ({selectedCards.size})
        </Button>
        <Button
          onClick={handlePickup}
          disabled={!canPlay || gameState.playPile.length === 0}
          variant="destructive"
        >
          Pick Up Pile
        </Button>
        <Button
          onClick={handleSkip}
          disabled={!canPlay}
          variant="outline"
        >
          Skip Turn
        </Button>
      </div>

      {/* Round over overlay */}
      {gameState.phase === 'ROUND_OVER' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-white p-8 rounded-lg text-center max-w-md"
          >
            <h2 className="text-3xl font-bold mb-4">Round Over!</h2>
            <div className="mb-4">
              {gameState.scores.map((score, idx) => (
                <div key={idx} className="flex justify-between mb-2">
                  <span>Player {idx + 1}:</span>
                  <span className="font-bold">{score} pts</span>
                </div>
              ))}
            </div>
            <Button onClick={() => {/* Start new round */}}>
              Next Round
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
```

## Key Implementation Considerations

### Multi-Deck Card Management

- Use unique IDs including deck number: `hearts_7_2` (hearts 7 from deck 2)
- Track removed cards separately (swooped cards)
- Jokers need special ID format: `joker_2_1` (joker from deck 2, #1)

### Mystery Card Reveal Mechanic

```typescript
function handleMysteryCardPlay(playerIndex: number, mysteryIndex: number) {
  const mysteryCard = gameState.mysteryCards[playerIndex][mysteryIndex];

  // Reveal animation
  revealCard(mysteryCard);

  // Check if valid play
  const topCard = getTopPileCard();
  const revealedCard = getCardById(mysteryCard);

  if (topCard && revealedCard.value > topCard.value) {
    // Must pick up pile
    return {
      action: 'PICKUP',
      mysteryRevealed: mysteryCard
    };
  } else {
    // Valid play
    return {
      action: 'PLAY',
      cards: [mysteryCard],
      fromMystery: mysteryIndex
    };
  }
}
```

### Swoop Detection Algorithm

```typescript
function detectSwoop(pile: string[]): boolean {
  if (pile.length < 4) return false;

  // Get last 4 cards
  const last4 = pile.slice(-4);
  const cards = last4.map(getCardById);

  // Check if all same rank
  const rank = cards[0].rank;
  return cards.every(c => c.rank === rank);
}
```

### Scoring System

```typescript
function calculateRoundScores(gameState: SwoopGameState, winnerIndex: number) {
  const scores = new Array(gameState.playerCount).fill(0);

  for (let i = 0; i < gameState.playerCount; i++) {
    if (i === winnerIndex) continue;

    // All remaining cards count
    const allCards = [
      ...gameState.playerHands[i],
      ...gameState.faceUpCards[i],
      ...gameState.mysteryCards[i]
    ];

    scores[i] = allCards.reduce((sum, cardId) => {
      const card = getCardById(cardId);
      return sum + CARD_POINTS[card.rank];
    }, 0);
  }

  return scores;
}
```

## Animation & Visual Effects

### Swoop Animation

```typescript
const SwoopEffect = () => (
  <motion.div
    initial={{ scale: 0, rotate: 0 }}
    animate={{
      scale: [0, 1.5, 0],
      rotate: [0, 360, 720]
    }}
    transition={{ duration: 1 }}
    className="absolute inset-0 flex items-center justify-center pointer-events-none"
  >
    <div className="text-yellow-400 text-8xl font-bold drop-shadow-lg">
      SWOOP!
    </div>
  </motion.div>
);
```

### Card Flying to Pile

```typescript
function animateCardToPile(cardElement: HTMLElement) {
  const pileRect = document.getElementById('pile')!.getBoundingClientRect();
  const cardRect = cardElement.getBoundingClientRect();

  return {
    initial: { x: 0, y: 0 },
    animate: {
      x: pileRect.left - cardRect.left,
      y: pileRect.top - cardRect.top
    },
    transition: { duration: 0.3, ease: 'easeOut' }
  };
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('SwoopGame', () => {
  test('should deal 19 cards to each player', () => {
    const game = new SwoopGame(4);
    const state = game.getState();

    for (let i = 0; i < 4; i++) {
      const totalCards =
        state.playerHands[i].length +
        state.faceUpCards[i].length +
        state.mysteryCards[i].length;

      expect(totalCards).toBe(19);
    }
  });

  test('should detect swoop with 4 equal cards', () => {
    // Create controlled game state with 4 queens on top
    const state = createTestState({
      playPile: ['clubs_queen_1', 'hearts_queen_1', 'diamonds_queen_2', 'spades_queen_2']
    });

    expect(detectSwoop(state.playPile)).toBe(true);
  });

  test('should clear pile on 10 or Joker play', () => {
    const game = new SwoopGame(3);
    // ... play a 10
    expect(newState.playPile.length).toBe(0);
    expect(newState.removedCards.length).toBeGreaterThan(0);
  });

  test('should calculate scores correctly', () => {
    const cards = ['hearts_ace_1', 'clubs_10_1', 'joker_1_1'];
    const points = calculatePoints(cards);
    expect(points).toBe(1 + 50 + 50); // = 101
  });
});
```

## Strategy Tips (for AI opponents)

1. **Save special cards (10s/Jokers)** for critical moments
2. **Play face-up cards first** before hand cards when possible
3. **Set up swoops** by tracking what's on the pile
4. **Mystery cards are risky** - use when you have no other options
5. **Don't skip unless** you're setting up a better play next turn
6. **Watch opponent card counts** to predict their capabilities

## Variations

### Simplified Rules
- Only Jokers are swoop cards (10s are normal)
- Mystery cards are played face-up instead of blind

### Hardcore Mode
- Must play if you can (no skipping)
- Faster turn timer (15 seconds)

### Team Play (6-8 players)
- Partner system: every other player is on your team
- Team with lowest combined score wins

---

This implementation provides a complete, strategic multiplayer card game that scales from 3-8 players and offers exciting gameplay moments with the swoop mechanic.
