import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, WarGameState, Card } from '@/types';
import { useGameStore } from '@/store';

/**
 * War Game Component
 *
 * Simple two-player card game interface
 * - Displays player decks
 * - Shows cards in play
 * - Handles flip actions
 */

interface WarProps extends PageProps {
    gameId: number;
}

export default function War({ auth, gameId }: WarProps) {
    const {
        gameState,
        currentGame,
        playerIndex,
        isConnected,
        isReady,
        error,
        loading,
        fetchGameState,
        subscribeToGame,
        unsubscribeFromGame,
        toggleReady,
        makeMove,
    } = useGameStore();

    // Fetch game state and subscribe to updates on mount
    useEffect(() => {
        fetchGameState(gameId);
        subscribeToGame(gameId);

        return () => {
            unsubscribeFromGame(gameId);
        };
    }, [gameId]);

    const warState = gameState as WarGameState | null;

    const handleFlip = async () => {
        if (!warState || loading) return;

        try {
            await makeMove(gameId, { action: 'flip' });
        } catch (err) {
            console.error('Failed to make move:', err);
        }
    };

    const handleToggleReady = async () => {
        try {
            await toggleReady(gameId);
        } catch (err) {
            console.error('Failed to toggle ready:', err);
        }
    };

    const handleLeaveGame = () => {
        router.visit('/games/lobby');
    };

    if (!currentGame) {
        return (
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        War
                    </h2>
                }
            >
                <Head title="War - Loading" />
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="bg-white p-6 shadow sm:rounded-lg text-center">
                            Loading game...
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const isWaiting = currentGame.status === 'WAITING' || currentGame.status === 'READY';

    // Only access warState properties if game has started
    const isMyTurn = warState ? (warState.waitingFor === `PLAYER_${(playerIndex ?? 0) + 1}` ||
        warState.waitingFor === 'BOTH') : false;
    const isGameOver = warState ? warState.phase === 'GAME_OVER' : false;

    // Get player decks (only if warState exists)
    const myDeck = warState && playerIndex !== null ? (playerIndex === 0 ? warState.player1Deck : warState.player2Deck) : [];
    const opponentDeck = warState && playerIndex !== null ? (playerIndex === 0 ? warState.player2Deck : warState.player1Deck) : [];
    const myCardsInPlay = warState && playerIndex !== null ? (playerIndex === 0
        ? warState.cardsInPlay.player1
        : warState.cardsInPlay.player2) : [];
    const opponentCardsInPlay = warState && playerIndex !== null ? (playerIndex === 0
        ? warState.cardsInPlay.player2
        : warState.cardsInPlay.player1) : [];

    const renderCard = (card: Card | string, faceDown = false) => {
        if (typeof card === 'string' || faceDown) {
            return (
                <div className="w-24 h-32 bg-blue-800 rounded-lg border-2 border-blue-900 flex items-center justify-center">
                    <div className="text-white text-2xl font-bold">?</div>
                </div>
            );
        }

        return (
            <div className="w-24 h-32 bg-white rounded-lg border-2 border-gray-300 flex flex-col items-center justify-center p-2">
                <div className={`text-3xl font-bold ${
                    card.suit === 'hearts' || card.suit === 'diamonds'
                        ? 'text-red-600'
                        : 'text-gray-900'
                }`}>
                    {card.rank}
                </div>
                <div className="text-2xl mt-1">
                    {card.suit === 'hearts' && '♥'}
                    {card.suit === 'diamonds' && '♦'}
                    {card.suit === 'clubs' && '♣'}
                    {card.suit === 'spades' && '♠'}
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        War - Game #{gameId}
                    </h2>
                    <button
                        onClick={handleLeaveGame}
                        className="text-sm text-red-600 hover:text-red-800"
                    >
                        Leave Game
                    </button>
                </div>
            }
        >
            <Head title="War" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Error Display */}
                    {error && (
                        <div className="mb-4 rounded-md bg-red-50 p-4">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Waiting Room */}
                    {isWaiting && (
                        <div className="bg-white p-6 shadow sm:rounded-lg mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Waiting for Players
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Players: {currentGame.game_players.length}/{currentGame.max_players}
                                    </p>
                                    <div className="flex gap-2">
                                        {currentGame.game_players.map((player) => (
                                            <div
                                                key={player.id}
                                                className={`px-3 py-2 rounded ${
                                                    player.is_ready
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {player.user.display_name || player.user.name}
                                                {player.is_ready && ' ✓'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={handleToggleReady}
                                    className={`px-4 py-2 rounded font-medium ${
                                        isReady
                                            ? 'bg-gray-200 text-gray-800'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                >
                                    {isReady ? 'Not Ready' : 'Ready'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Game Board */}
                    {!isWaiting && warState && (
                        <div className="bg-white p-6 shadow sm:rounded-lg">
                            {/* Game Status */}
                            <div className="text-center mb-6">
                                <div className="text-sm text-gray-600 mb-2">
                                    Turn {warState.turnCount} | Phase: {warState.phase}
                                </div>
                                {isGameOver ? (
                                    <div className="text-xl font-bold text-green-600">
                                        {warState.lastAction.winner === playerIndex
                                            ? 'You Win!'
                                            : 'You Lose!'}
                                    </div>
                                ) : (
                                    <div className="text-lg font-semibold">
                                        {isMyTurn ? "Your Turn - Click 'Flip Card'" : "Opponent's Turn"}
                                    </div>
                                )}
                            </div>

                            {/* Opponent Area */}
                            <div className="mb-8">
                                <div className="text-center mb-2 text-sm text-gray-600">
                                    Opponent ({opponentDeck.length} cards)
                                </div>
                                <div className="flex items-center justify-center gap-4">
                                    {/* Opponent Deck */}
                                    <div className="relative">
                                        {opponentDeck.length > 0 && renderCard(opponentDeck[0], true)}
                                    </div>
                                    {/* Opponent Cards in Play */}
                                    <div className="flex gap-2">
                                        {opponentCardsInPlay.map((card, idx) => (
                                            <div key={idx}>{renderCard(card)}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Play Area */}
                            <div className="py-4 border-y border-gray-200 text-center">
                                <div className="text-xs text-gray-500 mb-2">
                                    War Depth: {warState.warDepth}
                                </div>
                            </div>

                            {/* Player Area */}
                            <div className="mt-8">
                                <div className="flex items-center justify-center gap-4">
                                    {/* Player Cards in Play */}
                                    <div className="flex gap-2">
                                        {myCardsInPlay.map((card, idx) => (
                                            <div key={idx}>{renderCard(card)}</div>
                                        ))}
                                    </div>
                                    {/* Player Deck */}
                                    <div className="relative">
                                        {myDeck.length > 0 && renderCard(myDeck[0], true)}
                                    </div>
                                </div>
                                <div className="text-center mt-2 text-sm text-gray-600">
                                    You ({myDeck.length} cards)
                                </div>
                            </div>

                            {/* Action Button */}
                            {!isGameOver && (
                                <div className="mt-6 text-center">
                                    <button
                                        onClick={handleFlip}
                                        disabled={!isMyTurn || loading}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Flipping...' : 'Flip Card'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
