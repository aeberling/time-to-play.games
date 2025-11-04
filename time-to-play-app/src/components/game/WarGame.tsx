'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { GameState } from '@/lib/game/state';
import { WarGameData } from '@/lib/games/war/WarGame';
import { Card } from './Card';
import { Button } from '@/components/ui/button';
import { Users, Trophy } from 'lucide-react';

interface WarGameProps {
  gameId: string;
  userId: string;
}

export function WarGame({ gameId, userId }: WarGameProps) {
  const { socket, isConnected, sendMove, joinGame } = useSocket();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handlePlayCard = () => {
    if (!gameState || isProcessing) return;

    setIsProcessing(true);
    sendMove(gameId, {
      type: 'play_card',
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

  const warData = gameState.gameData as WarGameData;
  const player = gameState.players.find((p) => p.userId === userId);
  const playerNumber = player?.playerNumber || 1;
  const isPlayer1 = playerNumber === 1;

  const myDeck = isPlayer1 ? warData.player1 : warData.player2;
  const opponentDeck = isPlayer1 ? warData.player2 : warData.player1;

  const myTotalCards = myDeck.deck.length + myDeck.wonCards.length;
  const opponentTotalCards = opponentDeck.deck.length + opponentDeck.wonCards.length;

  const isGameOver = gameState.status === 'COMPLETED';
  const winner = isGameOver ? gameState.gameData?.winner : null;
  const iWon = winner === (isPlayer1 ? 'player1' : 'player2');

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Game Status */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold">War - Card Battle</h2>
          </div>
          <div className="text-sm text-gray-600">
            {isGameOver ? (
              <span className="text-lg font-bold text-primary-600">Game Over!</span>
            ) : (
              <span>In Progress</span>
            )}
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg shadow-2xl p-8 min-h-[500px]">
        {/* Opponent Side */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white">
              <p className="font-semibold">
                {gameState.players.find((p) => p.playerNumber !== playerNumber)
                  ?.displayName || 'Opponent'}
              </p>
              <p className="text-sm opacity-80">{opponentTotalCards} cards</p>
            </div>
            <div className="flex gap-2">
              <Card faceDown size="sm" />
              <Card faceDown size="sm" />
              <Card faceDown size="sm" />
            </div>
          </div>

          {/* Opponent's Current Card */}
          {warData.currentBattle && (
            <div className="flex justify-center mb-4">
              <Card
                card={isPlayer1 ? warData.currentBattle.player2Card : warData.currentBattle.player1Card}
                className="animate-slideIn"
              />
            </div>
          )}
        </div>

        {/* Battle Area */}
        <div className="border-2 border-white border-dashed rounded-lg p-4 mb-8 min-h-[100px] flex items-center justify-center">
          {isGameOver ? (
            <div className="text-center text-white">
              <Trophy className="w-16 h-16 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {iWon ? 'You Win!' : 'You Lose!'}
              </p>
              <p className="mt-2 opacity-80">
                Final Score: You {myTotalCards} - {opponentTotalCards} Opponent
              </p>
            </div>
          ) : warData.currentBattle ? (
            <div className="text-center text-white">
              <p className="text-lg font-semibold mb-2">
                {warData.currentBattle.player1Card.value ===
                warData.currentBattle.player2Card.value
                  ? '⚔️ WAR! ⚔️'
                  : warData.currentBattle.player1Card.value >
                    warData.currentBattle.player2Card.value
                  ? isPlayer1
                    ? 'You won this battle!'
                    : 'Opponent won this battle!'
                  : isPlayer1
                  ? 'Opponent won this battle!'
                  : 'You won this battle!'}
              </p>
              {warData.currentBattle.warPile && (
                <p className="text-sm opacity-80">
                  War pile: {warData.currentBattle.warPile.length} cards
                </p>
              )}
            </div>
          ) : (
            <p className="text-white text-lg">Ready for battle...</p>
          )}
        </div>

        {/* Player's Current Card */}
        {warData.currentBattle && (
          <div className="flex justify-center mb-4">
            <Card
              card={isPlayer1 ? warData.currentBattle.player1Card : warData.currentBattle.player2Card}
              className="animate-slideIn"
            />
          </div>
        )}

        {/* Player Side */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Card faceDown size="sm" />
              <Card faceDown size="sm" />
              <Card faceDown size="sm" />
            </div>
            <div className="text-white text-right">
              <p className="font-semibold">{player?.displayName || 'You'}</p>
              <p className="text-sm opacity-80">{myTotalCards} cards</p>
            </div>
          </div>

          {/* Play Button */}
          {!isGameOver && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={handlePlayCard}
                disabled={isProcessing || gameState.status !== 'IN_PROGRESS'}
                size="lg"
                className="bg-accent-600 hover:bg-accent-700 text-white px-8 py-6 text-lg"
              >
                {isProcessing ? 'Playing...' : 'Play Card'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Game Info */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Your Cards</p>
            <p className="text-2xl font-bold text-primary-600">{myTotalCards}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Battles</p>
            <p className="text-2xl font-bold text-gray-900">{warData.moveCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Opponent Cards</p>
            <p className="text-2xl font-bold text-gray-600">{opponentTotalCards}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
