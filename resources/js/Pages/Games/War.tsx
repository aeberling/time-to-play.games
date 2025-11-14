import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, WarGameState, Card } from '@/types';
import { useGameStore } from '@/store';
import GameCard from '@/Components/GameCard';

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
        cancelGame,
    } = useGameStore();

    // Animation state
    const [roundWinner, setRoundWinner] = useState<number | null>(null);
    const [showingResult, setShowingResult] = useState(false);
    const [animationCards, setAnimationCards] = useState<{player1: Card[], player2: Card[]} | null>(null);
    const [lastShownTimestamp, setLastShownTimestamp] = useState<string | null>(null);

    // Fetch game state and subscribe to updates on mount
    useEffect(() => {
        fetchGameState(gameId, auth.user.id);
        subscribeToGame(gameId);

        return () => {
            unsubscribeFromGame(gameId);
        };
    }, [gameId, auth.user.id]);

    // Detect when a round is resolved and show animation
    useEffect(() => {
        const warState = gameState as WarGameState | null;
        if (!warState || !warState.lastAction) return;

        // Check if this is a WIN_ROUND action with played cards
        if (warState.lastAction.type === 'WIN_ROUND' &&
            warState.lastAction.playedCards &&
            warState.lastAction.winner !== undefined &&
            warState.lastAction.timestamp &&
            warState.lastAction.timestamp !== lastShownTimestamp) {

            console.log('Showing new round result:', warState.lastAction.timestamp);

            // Mark this action as shown
            setLastShownTimestamp(warState.lastAction.timestamp);

            // Show the cards that were played and the winner
            setAnimationCards(warState.lastAction.playedCards);
            setRoundWinner(warState.lastAction.winner);
            setShowingResult(true);
        }
    }, [gameState, lastShownTimestamp]);

    // Separate effect to clear the animation after a delay
    useEffect(() => {
        if (!showingResult) return;

        console.log('Setting timer to clear animation...');
        const timer = setTimeout(() => {
            console.log('Clearing animation...');
            setShowingResult(false);
            setRoundWinner(null);
            setAnimationCards(null);
        }, 1500);

        return () => {
            console.log('Cleaning up timer...');
            clearTimeout(timer);
        };
    }, [showingResult]);

    const warState = gameState as WarGameState | null;

    const handleFlip = async () => {
        if (!warState || loading) return;

        try {
            await makeMove(gameId, { action: 'flip' });
        } catch (err: any) {
            console.error('Failed to make move:', err);
            console.error('Error response:', err.response?.data);
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

    const handleCancelGame = async () => {
        if (!confirm('Are you sure you want to cancel this game? This action cannot be undone.')) {
            return;
        }

        try {
            await cancelGame(gameId);
            router.visit('/games/lobby');
        } catch (err) {
            console.error('Failed to cancel game:', err);
        }
    };

    const handleSetupWarScenario = async () => {
        try {
            const response = await fetch(`/api/games/${gameId}/test/setup-war`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to setup war scenario:', errorData);
                alert(`Failed: ${errorData.message}`);
            } else {
                const data = await response.json();
                console.log('War scenario setup:', data);
                alert('War scenario ready! Both players now have Kings. Click flip to trigger WAR!');
                // State will be updated via WebSocket broadcast
            }
        } catch (err) {
            console.error('Failed to setup war scenario:', err);
        }
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

    // Get player decks (only if warState exists and has War game properties)
    const myDeck = warState && warState.player1Deck && playerIndex !== null ? (playerIndex === 0 ? warState.player1Deck : warState.player2Deck) : [];
    const opponentDeck = warState && warState.player1Deck && playerIndex !== null ? (playerIndex === 0 ? warState.player2Deck : warState.player1Deck) : [];

    // Show animation cards if available, otherwise show actual cards in play
    // Only show cardsInPlay if we're NOT in the middle of showing results
    const myCardsInPlay = animationCards && playerIndex !== null
        ? (playerIndex === 0 ? animationCards.player1 : animationCards.player2)
        : (!showingResult && warState && warState.cardsInPlay && playerIndex !== null
            ? (playerIndex === 0 ? warState.cardsInPlay.player1 : warState.cardsInPlay.player2)
            : []);

    const opponentCardsInPlay = animationCards && playerIndex !== null
        ? (playerIndex === 0 ? animationCards.player2 : animationCards.player1)
        : (!showingResult && warState && warState.cardsInPlay && playerIndex !== null
            ? (playerIndex === 0 ? warState.cardsInPlay.player2 : warState.cardsInPlay.player1)
            : []);

    const renderCard = (card: Card | string, faceDown = false) => {
        return <GameCard card={card} faceDown={faceDown} />;
    };

    // Check if current user is the game creator
    const isCreator = currentGame?.game_players?.find(p => p.player_index === 0)?.user_id === auth.user.id;
    const canCancelGame = isCreator && (currentGame?.status === 'WAITING' || currentGame?.status === 'READY');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        War - Game #{gameId}
                    </h2>
                    <div className="flex items-center gap-3">
                        {canCancelGame && (
                            <button
                                onClick={handleCancelGame}
                                className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Cancel Game
                            </button>
                        )}
                        <button
                            onClick={handleLeaveGame}
                            className="text-sm text-red-600 hover:text-red-800"
                        >
                            Leave Game
                        </button>
                    </div>
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
                                        {currentGame.game_players.map((player) => {
                                            // Use local isReady state for current user, server state for others
                                            const playerIsReady = player.user_id === auth.user.id ? isReady : player.is_ready;

                                            return (
                                                <div
                                                    key={player.id}
                                                    className={`px-3 py-2 rounded ${
                                                        playerIsReady
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {player.user.display_name || player.user.name}
                                                    {playerIsReady && ' ✓'}
                                                </div>
                                            );
                                        })}
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
                        <div className="game-bg p-6 shadow sm:rounded-lg">
                            {/* Game Status */}
                            <div className="text-center mb-6">
                                <div className="text-sm game-text-secondary mb-2">
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
                            <div className="mb-12">
                                <div className="text-center mb-3 text-sm game-text-secondary font-medium">
                                    Opponent ({opponentDeck.length} cards)
                                    {showingResult && roundWinner !== playerIndex && (
                                        <span className="ml-2 game-winner font-bold text-base animate-pulse">🎉 Wins Round!</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-center">
                                    {/* Opponent Deck */}
                                    <div className="relative">
                                        {opponentDeck.length > 0 && renderCard(opponentDeck[0], true)}
                                    </div>
                                </div>
                            </div>

                            {/* Play Area - Centered Battle Zone */}
                            <div className="relative py-8 my-8 game-bg-secondary rounded-lg border-2 game-border">
                                <div className="flex items-center justify-center gap-8">
                                    {/* Opponent's Card */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="text-xs font-medium game-text-muted uppercase tracking-wide">Opponent's Card</div>
                                        <div className={`transform transition-all duration-500 ${
                                            showingResult && roundWinner !== playerIndex
                                                ? 'scale-125 -translate-y-2'
                                                : showingResult && roundWinner === playerIndex
                                                ? 'scale-90 translate-y-2 opacity-50'
                                                : ''
                                        }`}>
                                            {opponentCardsInPlay.length > 0 ? (
                                                <div className={showingResult && roundWinner !== playerIndex ? 'ring-4 ring-green-400 rounded-lg shadow-xl' : ''}>
                                                    {renderCard(opponentCardsInPlay[opponentCardsInPlay.length - 1])}
                                                </div>
                                            ) : (
                                                <div className="w-24 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">Waiting</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* VS Divider */}
                                    <div className="text-2xl font-bold text-gray-400">VS</div>

                                    {/* Your Card */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="text-xs font-medium game-text-muted uppercase tracking-wide">Your Card</div>
                                        <div className={`transform transition-all duration-500 ${
                                            showingResult && roundWinner === playerIndex
                                                ? 'scale-125 -translate-y-2'
                                                : showingResult && roundWinner !== playerIndex
                                                ? 'scale-90 translate-y-2 opacity-50'
                                                : ''
                                        }`}>
                                            {myCardsInPlay.length > 0 ? (
                                                <div className={showingResult && roundWinner === playerIndex ? 'ring-4 ring-green-400 rounded-lg shadow-xl' : ''}>
                                                    {renderCard(myCardsInPlay[myCardsInPlay.length - 1])}
                                                </div>
                                            ) : (
                                                <div className="w-24 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">Waiting</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Battle Status */}
                                {showingResult && (
                                    <div className="absolute inset-x-0 -bottom-8 text-center">
                                        <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium text-sm animate-bounce">
                                            {roundWinner === playerIndex ? '🎉 You won this round!' : '😔 Opponent won this round'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Player Area */}
                            <div className="mt-12">
                                <div className="flex items-center justify-center">
                                    {/* Player Deck */}
                                    <div className="relative">
                                        {myDeck.length > 0 && renderCard(myDeck[0], true)}
                                    </div>
                                </div>
                                <div className="text-center mt-3 text-sm game-text-secondary font-medium">
                                    You ({myDeck.length} cards)
                                    {showingResult && roundWinner === playerIndex && (
                                        <span className="ml-2 game-winner font-bold text-base animate-pulse">🎉 Wins Round!</span>
                                    )}
                                </div>
                            </div>

                            {/* Action Button */}
                            {!isGameOver && (
                                <div className="mt-6 text-center space-y-3">
                                    <button
                                        onClick={handleFlip}
                                        disabled={!isMyTurn || loading}
                                        className="px-6 py-3 game-btn-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Flipping...' : 'Flip Card'}
                                    </button>

                                    {/* Debug Button - Setup War Scenario */}
                                    <div>
                                        <button
                                            onClick={handleSetupWarScenario}
                                            className="px-4 py-2 bg-yellow-500 text-white text-sm rounded-lg font-medium hover:bg-yellow-600"
                                        >
                                            🧪 Setup War Test Scenario
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
