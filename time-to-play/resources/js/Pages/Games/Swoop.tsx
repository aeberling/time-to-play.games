import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, SwoopGameState, Card } from '@/types';
import { useGameStore } from '@/store';
import { useTheme } from '@/contexts/ThemeContext';
import GameCard from '@/Components/GameCard';

/**
 * Swoop Game Component
 *
 * Fast-paced card game where players race to get rid of all their cards
 * Features mystery cards, face-up cards, and hand cards
 * Special "swoop" mechanic when 4 equal cards or a 10 is played
 */

interface SwoopProps extends PageProps {
    gameId: number;
}

export default function Swoop({ auth, gameId }: SwoopProps) {
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

    const { theme } = useTheme();
    const [selectedCards, setSelectedCards] = useState<number[]>([]);

    // Fetch game state and subscribe to updates on mount
    useEffect(() => {
        fetchGameState(gameId, auth.user.id);
        subscribeToGame(gameId);

        return () => {
            unsubscribeFromGame(gameId);
        };
    }, [gameId, auth.user.id]);

    const swoopState = gameState as SwoopGameState | null;

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

    const handleCardSelect = (index: number) => {
        if (selectedCards.includes(index)) {
            setSelectedCards(selectedCards.filter(i => i !== index));
        } else {
            setSelectedCards([...selectedCards, index]);
        }
    };

    const handlePlayCards = async () => {
        if (!swoopState || selectedCards.length === 0 || playerIndex === null) return;

        try {
            const myHand = swoopState.playerHands[playerIndex];
            const cards = selectedCards.map(idx => myHand[idx]);

            await makeMove(gameId, {
                action: 'PLAY',
                cards,
                fromHand: true,
            });

            setSelectedCards([]);
        } catch (err: any) {
            console.error('Failed to play cards:', err);
        }
    };

    const handlePickup = async () => {
        try {
            await makeMove(gameId, { action: 'PICKUP' });
        } catch (err) {
            console.error('Failed to pickup:', err);
        }
    };

    const handleSkip = async () => {
        try {
            await makeMove(gameId, { action: 'SKIP' });
        } catch (err) {
            console.error('Failed to skip:', err);
        }
    };

    // Sort cards by suit then rank
    const sortCards = (cards: Card[]) => {
        const suitOrder = { 'clubs': 0, 'diamonds': 1, 'hearts': 2, 'spades': 3 };
        const rankOrder = { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 };

        return [...cards].sort((a, b) => {
            const suitDiff = suitOrder[a.suit as keyof typeof suitOrder] - suitOrder[b.suit as keyof typeof suitOrder];
            if (suitDiff !== 0) return suitDiff;
            return rankOrder[a.rank as keyof typeof rankOrder] - rankOrder[b.rank as keyof typeof rankOrder];
        });
    };

    // Player colors for visual identification
    const playerColors = [
        'rgb(59, 130, 246)',  // blue
        'rgb(239, 68, 68)',   // red
        'rgb(34, 197, 94)',   // green
        'rgb(168, 85, 247)',  // purple
        'rgb(251, 146, 60)',  // orange
    ];

    const getPlayerColor = (pIndex: number) => {
        return playerColors[pIndex % playerColors.length];
    };

    // Player colors for visual identification
    const playerColors = [
        'rgb(59, 130, 246)',  // blue
        'rgb(239, 68, 68)',   // red
        'rgb(34, 197, 94)',   // green
        'rgb(168, 85, 247)',  // purple
        'rgb(251, 146, 60)',  // orange
    ];

    const getPlayerColor = (pIndex: number) => {
        return playerColors[pIndex % playerColors.length];
    };

    const renderCard = (card: Card, onClick?: () => void, selected = false, faceDown = false, borderColor?: string) => {
        return (
            <div
                onClick={onClick}
                className={`transition-all ${
                    selected ? '-translate-y-2 shadow-lg' : ''
                } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
                style={borderColor && !selected ? { borderColor, borderWidth: '3px', borderRadius: '0.5rem' } : {}}
            >
                <GameCard
                    card={card}
                    faceDown={faceDown || (card as any).hidden}
                    size="small"
                />
            </div>
        );
    };

    if (!currentGame) {
        return (
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Swoop
                    </h2>
                }
            >
                <Head title="Swoop - Loading" />
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
    const isMyTurn = swoopState ? swoopState.currentPlayerIndex === playerIndex : false;
    const isGameOver = swoopState ? swoopState.phase === 'GAME_OVER' : false;

    // Get player-specific data (only if game has started and has Swoop properties)
    const myHand = swoopState && swoopState.playerHands && playerIndex !== null ? swoopState.playerHands[playerIndex] : [];
    const myFaceUpCards = swoopState && swoopState.faceUpCards && playerIndex !== null ? swoopState.faceUpCards[playerIndex] : [];
    const myMysteryCards = swoopState && swoopState.mysteryCards && playerIndex !== null ? swoopState.mysteryCards[playerIndex] : [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Swoop - Game #{gameId}
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
            <Head title="Swoop" />

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
                                    <div className="flex gap-2 flex-wrap">
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
                    {!isWaiting && swoopState && (
                        <div className="bg-white p-6 shadow sm:rounded-lg">
                            {/* Game Status */}
                            <div className="text-center mb-6">
                                <div className="text-sm text-gray-600 mb-2">
                                    Round {swoopState.round} | Phase: {swoopState.phase}
                                </div>
                                {isGameOver ? (
                                    <div className="text-xl font-bold text-green-600">
                                        Game Over!
                                    </div>
                                ) : (
                                    <div className="text-lg font-semibold">
                                        {isMyTurn ? "Your Turn" : `Player ${swoopState.currentPlayerIndex + 1}'s Turn`}
                                    </div>
                                )}
                            </div>

                            {/* Scores */}
                            <div className="mb-6 flex justify-center gap-4">
                                {swoopState.scores.map((score, idx) => (
                                    <div
                                        key={idx}
                                        className={`px-3 py-1 rounded ${idx === playerIndex ? 'bg-blue-100' : 'bg-gray-100'}`}
                                        style={{ borderWidth: '2px', borderColor: getPlayerColor(idx) }}
                                    >
                                        <span className="text-sm font-medium">
                                            Player {idx + 1}: {score} pts
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Play Pile */}
                            <div className="mb-8">
                                <div className="text-center mb-2 text-sm text-gray-600 font-medium">
                                    Play Pile ({swoopState.playPile.length} cards)
                                </div>
                                <div className="flex justify-center items-center min-h-[100px] bg-gray-100 rounded-lg p-4">
                                    {swoopState.playPile.length > 0 ? (
                                        <div className="flex gap-2">
                                            {swoopState.playPile.slice(-3).map((card, idx) => (
                                                <div key={idx}>
                                                    {renderCard(card)}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 text-sm">Empty</div>
                                    )}
                                </div>
                            </div>

                            {/* Player's Cards */}
                            <div className="space-y-6">
                                {/* Mystery Cards */}
                                {myMysteryCards.length > 0 && (
                                    <div>
                                        <div className="text-sm text-gray-600 font-medium mb-2">Mystery Cards</div>
                                        <div className="flex gap-2 justify-center">
                                            {myMysteryCards.map((card, idx) => (
                                                <div key={idx}>
                                                    {renderCard(card, undefined, false, true)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Face Up Cards */}
                                {myFaceUpCards.length > 0 && (
                                    <div>
                                        <div className="text-sm text-gray-600 font-medium mb-2">Face-Up Cards</div>
                                        <div className="flex gap-2 justify-center">
                                            {myFaceUpCards.map((card, idx) => (
                                                <div key={idx}>
                                                    {renderCard(card)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Hand */}
                                {myHand.length > 0 && (
                                    <div>
                                        <div className="text-sm text-gray-600 font-medium mb-2">Your Hand</div>
                                        <div className="flex gap-2 justify-center flex-wrap">
                                            {sortCards(myHand).map((card, idx) => {
                                                // Find the original index of this card in the unsorted hand
                                                const originalIdx = myHand.findIndex(c =>
                                                    c.suit === card.suit && c.rank === card.rank
                                                );
                                                return (
                                                    <div key={idx}>
                                                        {renderCard(
                                                            card,
                                                            isMyTurn ? () => handleCardSelect(originalIdx) : undefined,
                                                            selectedCards.includes(originalIdx)
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {!isGameOver && isMyTurn && (
                                <div className="mt-6 text-center space-x-3">
                                    <button
                                        onClick={handlePlayCards}
                                        disabled={selectedCards.length === 0 || loading}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Playing...' : 'Play Selected Cards'}
                                    </button>
                                    {swoopState.playPile.length > 0 && (
                                        <button
                                            onClick={handlePickup}
                                            disabled={loading}
                                            className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50"
                                        >
                                            Pick Up Pile
                                        </button>
                                    )}
                                    <button
                                        onClick={handleSkip}
                                        disabled={loading}
                                        className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50"
                                    >
                                        Skip Turn
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
