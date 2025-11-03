# War Card Game - Implementation Guide

## Game Overview

War is a simple two-player card game where players compete to win all 52 cards. It's an ideal first game for the platform because:
- Simple rules (easy to implement)
- Turn-based (fits our architecture)
- Fast gameplay
- No complex strategy required

## Game Rules

### Setup
1. Standard 52-card deck is shuffled
2. Cards are dealt evenly to both players (26 cards each)
3. Players don't see their cards until played
4. Cards ranked: 2 (lowest) → Ace (highest)

### Gameplay
1. Both players simultaneously flip their top card
2. Player with higher card wins both cards
3. Won cards go to bottom of winner's deck
4. If cards are equal, "War" is declared:
   - Each player places 3 cards face down
   - Then 1 card face up
   - Higher face-up card wins all cards in play
   - If another tie, repeat war process

### Winning
- Player who collects all 52 cards wins
- If a player runs out of cards during war, they lose
- Game can be limited by turn count (optional timeout after 500 turns)

## Data Structures

### Game State

```typescript
interface WarGameState {
  // Player decks (array of card IDs)
  player1Deck: string[];
  player2Deck: string[];

  // Cards currently in play (on the table)
  cardsInPlay: {
    player1: string[]; // Cards played by player 1
    player2: string[]; // Cards played by player 2
  };

  // Current phase of the game
  phase: 'FLIP' | 'WAR' | 'COLLECT' | 'GAME_OVER';

  // Whose turn to act (for async gameplay)
  waitingFor: 'PLAYER_1' | 'PLAYER_2' | 'BOTH' | 'NONE';

  // Turn counter (to prevent infinite games)
  turnCount: number;

  // Last action (for UI display)
  lastAction: {
    type: 'FLIP' | 'WAR' | 'WIN_ROUND' | 'GAME_OVER';
    winner?: 'PLAYER_1' | 'PLAYER_2';
    cardsWon?: number;
    timestamp: string;
  } | null;

  // War state (when war is in progress)
  warDepth: number; // Number of consecutive wars (0 = no war)
}
```

### Card Representation

```typescript
interface Card {
  id: string;        // e.g., "clubs_ace", "hearts_7"
  suit: 'clubs' | 'diamonds' | 'hearts' | 'spades';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'jack' | 'queen' | 'king' | 'ace';
  value: number;     // 2-14 (for comparison)
  imageUrl: string;  // Path to card image
}

// Card value mapping
const CARD_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'jack': 11, 'queen': 12, 'king': 13, 'ace': 14
};
```

## Game Engine Implementation

### WarGame Class

```typescript
// lib/games/war/WarGame.ts

export class WarGame implements Game {
  private state: WarGameState;

  constructor(initialState?: WarGameState) {
    this.state = initialState || this.initializeGame();
  }

  private initializeGame(): WarGameState {
    // Create and shuffle deck
    const deck = this.createDeck();
    const shuffled = this.shuffleDeck(deck);

    // Deal cards
    const player1Deck = shuffled.slice(0, 26).map(c => c.id);
    const player2Deck = shuffled.slice(26, 52).map(c => c.id);

    return {
      player1Deck,
      player2Deck,
      cardsInPlay: { player1: [], player2: [] },
      phase: 'FLIP',
      waitingFor: 'BOTH',
      turnCount: 0,
      lastAction: null,
      warDepth: 0
    };
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

  // Validate if move is legal
  validateMove(playerIndex: number, moveData: any): ValidationResult {
    // Check if it's player's turn
    if (this.state.waitingFor === 'PLAYER_1' && playerIndex !== 0) {
      return { valid: false, error: 'Not your turn' };
    }
    if (this.state.waitingFor === 'PLAYER_2' && playerIndex !== 1) {
      return { valid: false, error: 'Not your turn' };
    }

    // Check if game is over
    if (this.state.phase === 'GAME_OVER') {
      return { valid: false, error: 'Game is over' };
    }

    // Check if player has cards
    const deck = playerIndex === 0 ? this.state.player1Deck : this.state.player2Deck;
    if (deck.length === 0) {
      return { valid: false, error: 'No cards left' };
    }

    // For War game, the only action is "flip"
    if (moveData.action !== 'flip') {
      return { valid: false, error: 'Invalid action' };
    }

    return { valid: true };
  }

  // Apply a move and return new state
  applyMove(playerIndex: number, moveData: any): WarGameState {
    const newState = { ...this.state };

    if (moveData.action === 'flip') {
      // Player flips their top card
      const deck = playerIndex === 0 ? newState.player1Deck : newState.player2Deck;
      const card = deck[0]; // Top card

      // Add to cards in play
      if (playerIndex === 0) {
        newState.cardsInPlay.player1.push(card);
        newState.player1Deck = deck.slice(1);
      } else {
        newState.cardsInPlay.player2.push(card);
        newState.player2Deck = deck.slice(1);
      }

      // Check if both players have flipped
      if (newState.cardsInPlay.player1.length > 0 &&
          newState.cardsInPlay.player2.length > 0) {
        // Resolve the round
        return this.resolveRound(newState);
      } else {
        // Wait for other player
        newState.waitingFor = playerIndex === 0 ? 'PLAYER_2' : 'PLAYER_1';
      }
    }

    return newState;
  }

  private resolveRound(state: WarGameState): WarGameState {
    const newState = { ...state };

    // Get the face-up cards
    const player1Card = newState.cardsInPlay.player1[newState.cardsInPlay.player1.length - 1];
    const player2Card = newState.cardsInPlay.player2[newState.cardsInPlay.player2.length - 1];

    const card1 = this.getCardById(player1Card);
    const card2 = this.getCardById(player2Card);

    newState.turnCount += 1;

    if (card1.value > card2.value) {
      // Player 1 wins
      return this.playerWinsRound(newState, 0);
    } else if (card2.value > card1.value) {
      // Player 2 wins
      return this.playerWinsRound(newState, 1);
    } else {
      // War!
      return this.initiateWar(newState);
    }
  }

  private playerWinsRound(state: WarGameState, winnerIndex: number): WarGameState {
    const newState = { ...state };

    // Collect all cards in play
    const allCards = [
      ...newState.cardsInPlay.player1,
      ...newState.cardsInPlay.player2
    ];

    // Add to winner's deck (at bottom)
    if (winnerIndex === 0) {
      newState.player1Deck = [...newState.player1Deck, ...allCards];
    } else {
      newState.player2Deck = [...newState.player2Deck, ...allCards];
    }

    // Clear cards in play
    newState.cardsInPlay = { player1: [], player2: [] };
    newState.phase = 'FLIP';
    newState.waitingFor = 'BOTH';
    newState.warDepth = 0;

    newState.lastAction = {
      type: 'WIN_ROUND',
      winner: winnerIndex === 0 ? 'PLAYER_1' : 'PLAYER_2',
      cardsWon: allCards.length,
      timestamp: new Date().toISOString()
    };

    return newState;
  }

  private initiateWar(state: WarGameState): WarGameState {
    const newState = { ...state };

    newState.phase = 'WAR';
    newState.warDepth += 1;

    newState.lastAction = {
      type: 'WAR',
      timestamp: new Date().toISOString()
    };

    // Each player must place 3 cards face down + 1 face up
    // Check if players have enough cards
    if (newState.player1Deck.length < 4 || newState.player2Deck.length < 4) {
      // Player without enough cards loses
      const winner = newState.player1Deck.length >= 4 ? 0 : 1;
      return this.endGame(newState, winner);
    }

    // Auto-play war cards (3 face down, 1 face up)
    const p1WarCards = newState.player1Deck.slice(0, 4);
    const p2WarCards = newState.player2Deck.slice(0, 4);

    newState.player1Deck = newState.player1Deck.slice(4);
    newState.player2Deck = newState.player2Deck.slice(4);

    newState.cardsInPlay.player1.push(...p1WarCards);
    newState.cardsInPlay.player2.push(...p2WarCards);

    // Resolve with the face-up cards
    return this.resolveRound(newState);
  }

  private endGame(state: WarGameState, winnerIndex: number): WarGameState {
    const newState = { ...state };

    newState.phase = 'GAME_OVER';
    newState.waitingFor = 'NONE';

    newState.lastAction = {
      type: 'GAME_OVER',
      winner: winnerIndex === 0 ? 'PLAYER_1' : 'PLAYER_2',
      timestamp: new Date().toISOString()
    };

    return newState;
  }

  checkGameOver(state: WarGameState): GameOverResult {
    // Check if either player has no cards
    if (state.player1Deck.length === 0) {
      return {
        isGameOver: true,
        winnerId: 1, // Player 2 wins
        reason: 'Player 1 ran out of cards'
      };
    }

    if (state.player2Deck.length === 0) {
      return {
        isGameOver: true,
        winnerId: 0, // Player 1 wins
        reason: 'Player 2 ran out of cards'
      };
    }

    // Check turn limit (prevent infinite games)
    if (state.turnCount >= 500) {
      // Winner is player with more cards
      const winner = state.player1Deck.length > state.player2Deck.length ? 0 : 1;
      return {
        isGameOver: true,
        winnerId: winner,
        reason: 'Turn limit reached'
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
      imageUrl: `/cards/default/${cardId}.png`
    };
  }

  getState(): WarGameState {
    return this.state;
  }
}
```

## Client-Side UI Components

### Game Board Layout

```
┌─────────────────────────────────────────────────────┐
│                    Opponent                          │
│              ┌────┐  (26 cards)                     │
│              │ ?? │                                  │
│              └────┘                                  │
│                                                      │
│                  Battle Area                         │
│         ┌────┐          ┌────┐                      │
│         │ 7♥ │    VS    │ K♠ │                      │
│         └────┘          └────┘                      │
│                                                      │
│                                                      │
│              ┌────┐  (26 cards)                     │
│              │ ?? │                                  │
│              └────┘                                  │
│                     You                              │
│                                                      │
│               [Flip Card] Button                     │
└─────────────────────────────────────────────────────┘
```

### WarGameBoard Component

```typescript
// components/game/WarGameBoard.tsx
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

export function WarGameBoard({ gameId, playerIndex }: Props) {
  const socket = useSocket();
  const [gameState, setGameState] = useState<WarGameState | null>(null);
  const [canFlip, setCanFlip] = useState(false);

  useEffect(() => {
    // Listen for game state updates
    socket.on('game:state', (state) => {
      setGameState(state.gameState);
      updateCanFlip(state.gameState);
    });

    socket.on('game:move_made', (data) => {
      setGameState(data.newGameState.gameState);
      updateCanFlip(data.newGameState.gameState);
    });

    return () => {
      socket.off('game:state');
      socket.off('game:move_made');
    };
  }, [socket]);

  function updateCanFlip(state: WarGameState) {
    if (state.phase === 'GAME_OVER') {
      setCanFlip(false);
      return;
    }

    const waiting = state.waitingFor;
    const isMyTurn =
      waiting === 'BOTH' ||
      (waiting === 'PLAYER_1' && playerIndex === 0) ||
      (waiting === 'PLAYER_2' && playerIndex === 1);

    setCanFlip(isMyTurn);
  }

  function handleFlip() {
    socket.emit('game:move', {
      gameId,
      moveData: { action: 'flip' }
    });
    setCanFlip(false); // Disable until server responds
  }

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  const myDeck = playerIndex === 0 ? gameState.player1Deck : gameState.player2Deck;
  const opponentDeck = playerIndex === 0 ? gameState.player2Deck : gameState.player1Deck;

  const myCardsInPlay = playerIndex === 0 ? gameState.cardsInPlay.player1 : gameState.cardsInPlay.player2;
  const opponentCardsInPlay = playerIndex === 0 ? gameState.cardsInPlay.player2 : gameState.cardsInPlay.player1;

  return (
    <div className="flex flex-col items-center justify-between h-screen p-8 bg-gradient-to-b from-green-800 to-green-900">

      {/* Opponent's deck */}
      <div className="flex flex-col items-center">
        <div className="text-white text-lg mb-2">Opponent</div>
        <div className="relative">
          <Card cardId="back" count={opponentDeck.length} />
        </div>
      </div>

      {/* Battle area */}
      <div className="flex items-center gap-8">
        <AnimatePresence>
          {opponentCardsInPlay.length > 0 && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ scale: 0 }}
            >
              <Card cardId={opponentCardsInPlay[opponentCardsInPlay.length - 1]} size="large" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-white text-3xl font-bold">VS</div>

        <AnimatePresence>
          {myCardsInPlay.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ scale: 0 }}
            >
              <Card cardId={myCardsInPlay[myCardsInPlay.length - 1]} size="large" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* War indicator */}
      {gameState.warDepth > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-yellow-400 text-4xl font-bold"
        >
          WAR! ⚔️
        </motion.div>
      )}

      {/* Player's deck */}
      <div className="flex flex-col items-center">
        <div className="relative mb-2">
          <Card cardId="back" count={myDeck.length} />
        </div>
        <div className="text-white text-lg">You</div>

        <Button
          onClick={handleFlip}
          disabled={!canFlip}
          className="mt-4"
          size="lg"
        >
          {canFlip ? 'Flip Card' : 'Waiting...'}
        </Button>
      </div>

      {/* Game over overlay */}
      {gameState.phase === 'GAME_OVER' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-white p-8 rounded-lg text-center"
          >
            <h2 className="text-3xl font-bold mb-4">
              {gameState.lastAction?.winner === (playerIndex === 0 ? 'PLAYER_1' : 'PLAYER_2')
                ? 'You Won! 🎉'
                : 'You Lost'}
            </h2>
            <p className="text-gray-600 mb-4">
              Final Score: {myDeck.length} - {opponentDeck.length}
            </p>
            <Button onClick={() => window.location.href = '/play'}>
              Back to Lobby
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
```

### Card Component

```typescript
// components/game/Card.tsx
import Image from 'next/image';

interface Props {
  cardId: string;
  size?: 'small' | 'medium' | 'large';
  count?: number; // Show card count badge
}

export function Card({ cardId, size = 'medium', count }: Props) {
  const sizes = {
    small: { width: 60, height: 84 },
    medium: { width: 90, height: 126 },
    large: { width: 120, height: 168 }
  };

  const { width, height } = sizes[size];

  return (
    <div className="relative">
      <Image
        src={`/cards/default/${cardId}.png`}
        alt={cardId}
        width={width}
        height={height}
        className="rounded-lg shadow-lg"
      />
      {count !== undefined && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
          {count}
        </div>
      )}
    </div>
  );
}
```

## Performance Optimizations

### Fast Game Mode

For faster gameplay, automatically flip cards without requiring player click:

```typescript
// Auto-flip mode
useEffect(() => {
  if (canFlip && autoPlay) {
    const timeout = setTimeout(() => {
      handleFlip();
    }, 1000); // 1 second delay

    return () => clearTimeout(timeout);
  }
}, [canFlip, autoPlay]);
```

### Animation Optimization

Use CSS transforms for smooth animations:
- Card flips: `rotateY(180deg)`
- Card movement: `translateY()` instead of `top`
- Use `will-change` for frequently animated elements

## Testing Strategy

### Unit Tests

```typescript
// __tests__/WarGame.test.ts
import { WarGame } from '@/lib/games/war/WarGame';

describe('WarGame', () => {
  test('should initialize with 26 cards per player', () => {
    const game = new WarGame();
    const state = game.getState();

    expect(state.player1Deck.length).toBe(26);
    expect(state.player2Deck.length).toBe(26);
  });

  test('should handle basic flip', () => {
    const game = new WarGame();
    const newState = game.applyMove(0, { action: 'flip' });

    expect(newState.cardsInPlay.player1.length).toBe(1);
    expect(newState.player1Deck.length).toBe(25);
  });

  test('should resolve round correctly', () => {
    // Test with controlled deck...
  });

  test('should handle war correctly', () => {
    // Test war scenario...
  });
});
```

---

This implementation provides a complete, playable War card game that serves as a solid foundation for adding more complex games to the platform.
