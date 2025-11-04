'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { GameState } from '@/lib/game/state';
import { OhHellGameData, OhHellCard } from '@/lib/games/oh-hell/OhHellGame';
import { Card } from './Card';
import { Button } from '@/components/ui/button';
import { GameChat } from './GameChat';
import { TurnTimer } from './TurnTimer';
import { Users, Trophy, Heart, Diamond, Club, Spade } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OhHellGameProps {
  gameId: string;
  userId: string;
}

const SUIT_ICONS = {
  hearts: Heart,
  diamonds: Diamond,
  clubs: Club,
  spades: Spade,
};

const SUIT_COLORS = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};

export function OhHellGame({ gameId, userId }: OhHellGameProps) {
  const { socket, isConnected, sendMove, joinGame } = useSocket();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBid, setSelectedBid] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join the game room
    joinGame(gameId);

    // Listen for game state updates
    socket.on('game:state', (state: GameState) => {
      setGameState(state);
      setIsProcessing(false);
    });

    socket.on('game:started', () => {
      console.log('Game started!');
    });

    socket.on('game:move', () => {
      setIsProcessing(false);
      setSelectedBid(null);
      setSelectedCard(null);
    });

    socket.on('move:invalid', (data: { error: string }) => {
      console.error('Invalid move:', data.error);
      setIsProcessing(false);
    });

    return () => {
      socket.off('game:state');
      socket.off('game:started');
      socket.off('game:move');
      socket.off('move:invalid');
    };
  }, [socket, isConnected, gameId, joinGame]);

  const handleBid = (bid: number) => {
    if (!gameState || isProcessing) return;

    setIsProcessing(true);
    sendMove(gameId, {
      action: 'BID',
      bid,
    });
  };

  const handlePlayCard = (cardId: string) => {
    if (!gameState || isProcessing) return;

    setIsProcessing(true);
    sendMove(gameId, {
      action: 'PLAY_CARD',
      card: cardId,
    });
  };

  const handleContinue = () => {
    if (!gameState || isProcessing) return;

    setIsProcessing(true);
    sendMove(gameId, {
      action: 'CONTINUE_ROUND',
    });
  };

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  const ohHellData = gameState.gameData as OhHellGameData;
  const playerIndex = ohHellData.playerIds.indexOf(userId);
  const isMyTurn =
    ohHellData.phase === 'BIDDING'
      ? ohHellData.currentBidder === playerIndex
      : ohHellData.currentTrick.currentPlayer === playerIndex;

  const myHand = ohHellData.playerHands[playerIndex] || [];
  const myBid = ohHellData.bids[playerIndex];
  const myTricksWon = ohHellData.tricksWon[playerIndex];
  const myScore = ohHellData.scores[playerIndex];

  const isGameOver = gameState.status === 'COMPLETED';

  // Get valid bids for dealer restriction
  const getValidBids = (): number[] => {
    const validBids: number[] = [];
    for (let bid = 0; bid <= ohHellData.cardsThisRound; bid++) {
      if (playerIndex === ohHellData.dealerIndex) {
        const totalBids = ohHellData.bids.reduce((sum, b) => sum + (b || 0), 0);
        if (totalBids + bid === ohHellData.cardsThisRound) {
          continue; // Invalid for dealer
        }
      }
      validBids.push(bid);
    }
    return validBids;
  };

  // Check if card is playable
  const isCardPlayable = (card: OhHellCard): boolean => {
    const leadSuit = ohHellData.currentTrick.leadSuit;
    if (!leadSuit) return true; // First card can be anything

    if (card.suit === leadSuit) return true;

    // Can play any card if we don't have lead suit
    const hasLeadSuit = myHand.some((c) => c.suit === leadSuit);
    return !hasLeadSuit;
  };

  const TrumpIndicator = () => {
    if (ohHellData.trumpSuit === 'none') {
      return (
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-700">No Trump</p>
        </div>
      );
    }

    const SuitIcon = SUIT_ICONS[ohHellData.trumpSuit];
    return (
      <div className="bg-white rounded-lg p-4 shadow-md">
        <p className="text-sm font-semibold text-gray-700 mb-2">Trump Suit</p>
        <div className="flex items-center gap-2">
          <SuitIcon className={cn('w-8 h-8', SUIT_COLORS[ohHellData.trumpSuit])} />
          <span className={cn('font-bold capitalize', SUIT_COLORS[ohHellData.trumpSuit])}>
            {ohHellData.trumpSuit}
          </span>
        </div>
        {ohHellData.trumpCard && (
          <div className="mt-2">
            <Card card={ohHellData.trumpCard} size="sm" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Game Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold">Oh Hell!</h2>
              </div>
              <div className="text-sm text-gray-600">
                {isGameOver ? (
                  <span className="text-lg font-bold text-primary-600">Game Over!</span>
                ) : (
                  <span>
                    Round {ohHellData.currentRound}/{ohHellData.totalRounds} - {ohHellData.cardsThisRound} cards
                  </span>
                )}
              </div>
            </div>

            {/* Round Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-600">Your Bid</p>
                <p className="text-2xl font-bold text-primary-600">{myBid ?? '-'}</p>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-600">Tricks Won</p>
                <p className="text-2xl font-bold text-green-600">{myTricksWon}</p>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-600">Round Score</p>
                <p className="text-2xl font-bold text-blue-600">{ohHellData.roundScores[playerIndex]}</p>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-600">Total Score</p>
                <p className="text-2xl font-bold text-purple-600">{myScore}</p>
              </div>
            </div>

            {!isGameOver && gameState.turnStartedAt && gameState.timerConfig && (
              <TurnTimer
                turnStartedAt={gameState.turnStartedAt}
                timeLimit={gameState.timerConfig.timePerTurn}
                isMyTurn={isMyTurn}
                timerType={gameState.timerConfig.type}
              />
            )}
          </div>

          {/* Game Board */}
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg shadow-2xl p-8 min-h-[500px]">
            {/* Bidding Phase */}
            {ohHellData.phase === 'BIDDING' && (
              <div className="bg-white/90 backdrop-blur rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Bidding Phase</h3>

                {/* Show other players' bids */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Current Bids:</p>
                  <div className="flex flex-wrap gap-2">
                    {gameState.players.map((player, idx) => (
                      <div
                        key={player.userId}
                        className={cn(
                          'px-3 py-2 rounded-lg',
                          idx === playerIndex ? 'bg-primary-100' : 'bg-gray-100'
                        )}
                      >
                        <p className="text-sm font-semibold">{player.displayName}</p>
                        <p className="text-lg font-bold text-primary-600">
                          {ohHellData.bids[idx] !== null ? ohHellData.bids[idx] : '?'}
                        </p>
                        {idx === ohHellData.dealerIndex && (
                          <span className="text-xs text-amber-600">Dealer</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bidding controls */}
                {isMyTurn && (
                  <div>
                    <p className="text-sm text-gray-700 mb-3">
                      How many tricks will you win?
                      {playerIndex === ohHellData.dealerIndex && (
                        <span className="text-amber-600 font-semibold ml-2">
                          (You are the dealer - some bids may be restricted)
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getValidBids().map((bid) => (
                        <Button
                          key={bid}
                          onClick={() => {
                            setSelectedBid(bid);
                            handleBid(bid);
                          }}
                          disabled={isProcessing}
                          variant={selectedBid === bid ? 'default' : 'outline'}
                          className="min-w-[60px]"
                        >
                          {bid}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {!isMyTurn && (
                  <p className="text-center text-gray-600 py-4">
                    Waiting for{' '}
                    {gameState.players[ohHellData.currentBidder!]?.displayName} to bid...
                  </p>
                )}
              </div>
            )}

            {/* Playing Phase */}
            {ohHellData.phase === 'PLAYING' && (
              <div>
                {/* Current Trick */}
                <div className="mb-8">
                  <div className="bg-white/20 backdrop-blur rounded-lg p-6">
                    <p className="text-white text-sm mb-4">Current Trick</p>
                    <div className="flex justify-center gap-4 flex-wrap">
                      {ohHellData.currentTrick.cards.map((playedCard, idx) => (
                        <div key={idx} className="text-center">
                          <Card card={playedCard.card} />
                          <p className="text-white text-xs mt-2">
                            {gameState.players[playedCard.playerIndex]?.displayName}
                          </p>
                        </div>
                      ))}
                    </div>
                    {ohHellData.currentTrick.leadSuit && (
                      <p className="text-white text-center mt-4 text-sm">
                        Lead Suit:{' '}
                        <span className="font-bold capitalize">{ohHellData.currentTrick.leadSuit}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Turn indicator */}
                {!isMyTurn && (
                  <p className="text-center text-white py-4 bg-white/10 rounded-lg">
                    Waiting for{' '}
                    {gameState.players[ohHellData.currentTrick.currentPlayer]?.displayName} to play...
                  </p>
                )}
              </div>
            )}

            {/* Round Over */}
            {ohHellData.phase === 'ROUND_OVER' && (
              <div className="bg-white/90 backdrop-blur rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Round Complete!</h3>
                <div className="space-y-2 mb-6">
                  {gameState.players.map((player, idx) => {
                    const bid = ohHellData.bids[idx]!;
                    const won = ohHellData.tricksWon[idx];
                    const roundScore = ohHellData.roundScores[idx];
                    const madeIt = bid === won;

                    return (
                      <div
                        key={player.userId}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-lg',
                          madeIt ? 'bg-green-100' : 'bg-red-100'
                        )}
                      >
                        <span className="font-semibold">{player.displayName}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm">
                            Bid: {bid} | Won: {won}
                          </span>
                          <span className="font-bold text-lg">+{roundScore}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button onClick={handleContinue} disabled={isProcessing} className="w-full">
                  Continue to Next Round
                </Button>
              </div>
            )}

            {/* Game Over */}
            {ohHellData.phase === 'GAME_OVER' && (
              <div className="bg-white/90 backdrop-blur rounded-lg p-6">
                <div className="text-center mb-6">
                  <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
                </div>
                <div className="space-y-2">
                  {gameState.players
                    .map((player, idx) => ({
                      player,
                      score: ohHellData.scores[idx],
                    }))
                    .sort((a, b) => b.score - a.score)
                    .map(({ player, score }, rank) => (
                      <div
                        key={player.userId}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-lg',
                          rank === 0 ? 'bg-yellow-100' : 'bg-gray-100'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {rank === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                          <span className="font-semibold">{player.displayName}</span>
                        </div>
                        <span className="font-bold text-xl">{score}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Player's Hand */}
          {myHand.length > 0 && ohHellData.phase === 'PLAYING' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                Your Hand
                {myBid !== null && (
                  <span className="ml-4 text-sm text-gray-600">
                    (Need to win {myBid - myTricksWon} more)
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {myHand.map((card) => {
                  const playable = isCardPlayable(card);
                  return (
                    <button
                      key={card.id}
                      onClick={() => {
                        if (isMyTurn && playable) {
                          setSelectedCard(card.id);
                          handlePlayCard(card.id);
                        }
                      }}
                      disabled={!isMyTurn || !playable || isProcessing}
                      className={cn(
                        'transition-all transform hover:scale-105',
                        selectedCard === card.id && 'ring-4 ring-primary-500 rounded-lg',
                        !playable && 'opacity-50 cursor-not-allowed',
                        isMyTurn && playable && 'hover:-translate-y-2 cursor-pointer'
                      )}
                    >
                      <Card card={card} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trump Indicator */}
          <TrumpIndicator />

          {/* Scoreboard */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Scoreboard</h3>
            <div className="space-y-3">
              {gameState.players.map((player, idx) => (
                <div
                  key={player.userId}
                  className={cn(
                    'p-3 rounded-lg',
                    idx === playerIndex ? 'bg-primary-50' : 'bg-gray-50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{player.displayName}</p>
                      {ohHellData.bids[idx] !== null && (
                        <p className="text-xs text-gray-600">
                          Bid: {ohHellData.bids[idx]} | Won: {ohHellData.tricksWon[idx]}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">{ohHellData.scores[idx]}</p>
                      {ohHellData.roundScores[idx] > 0 && (
                        <p className="text-xs text-green-600">+{ohHellData.roundScores[idx]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <GameChat gameId={gameId} />
        </div>
      </div>
    </div>
  );
}
