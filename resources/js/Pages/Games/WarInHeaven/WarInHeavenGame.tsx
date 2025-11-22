import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps } from '@/types';
import { useGameStore } from '@/store';
import GameView from './GameView';

interface WarInHeavenProps extends PageProps {
    gameId: number;
}

/**
 * War in Heaven - Main Game Component
 *
 * Asymmetrical hex-based strategy game for 2 players
 * Online multiplayer with turn-based gameplay
 */
export default function WarInHeaven({ auth, gameId }: WarInHeavenProps) {
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

    const [loadTimeout, setLoadTimeout] = useState(false);

    // Fetch game state and subscribe to updates on mount
    useEffect(() => {
        const loadGame = async () => {
            try {
                // Check if URL has ?join=true parameter
                const urlParams = new URLSearchParams(window.location.search);
                const shouldAutoJoin = urlParams.get('join') === 'true';

                if (shouldAutoJoin) {
                    // Try to join the game first
                    try {
                        const response = await fetch(`/api/games/${gameId}/join`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                        });

                        if (response.ok) {
                            // Remove the join parameter from URL after successful join
                            window.history.replaceState({}, '', window.location.pathname);
                        } else {
                            console.log('Auto-join failed, loading game state anyway');
                        }
                    } catch (joinError) {
                        console.error('Error auto-joining game:', joinError);
                    }
                }

                await fetchGameState(gameId, auth.user.id);
                subscribeToGame(gameId);
            } catch (err) {
                console.error('Error loading game:', err);
            }
        };

        loadGame();

        // Set timeout to show helpful message if loading takes too long
        const timeoutId = setTimeout(() => {
            if (!currentGame) {
                setLoadTimeout(true);
            }
        }, 5000); // 5 seconds

        return () => {
            clearTimeout(timeoutId);
            unsubscribeFromGame(gameId);
        };
    }, [gameId, auth.user.id]);

    const handleToggleReady = async () => {
        try {
            await toggleReady(gameId);
        } catch (err) {
            console.error('Error toggling ready:', err);
        }
    };

    const handleCancelGame = async () => {
        try {
            await cancelGame(gameId);
            router.visit('/games/lobby');
        } catch (err) {
            console.error('Error canceling game:', err);
        }
    };

    // Loading state
    if (loading && !currentGame) {
        return (
            <AuthenticatedLayout>
                <Head title="War in Heaven" />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-white text-xl">Loading game...</p>
                        {loadTimeout && (
                            <p className="text-gray-400 mt-2">
                                If this is taking too long, try refreshing the page or{' '}
                                <a href="/games/lobby" className="text-blue-400 hover:underline">
                                    return to lobby
                                </a>
                            </p>
                        )}
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Error state
    if (error) {
        return (
            <AuthenticatedLayout>
                <Head title="War in Heaven - Error" />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="bg-red-900/50 border border-red-500 rounded-lg p-8 max-w-md">
                        <h2 className="text-2xl font-bold text-white mb-4">Error Loading Game</h2>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <button
                            onClick={() => router.visit('/games/lobby')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                            Return to Lobby
                        </button>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Game hasn't started yet - show waiting room
    if (currentGame && currentGame.status === 'WAITING') {
        const gamePlayers = currentGame.game_players || [];
        const maxPlayers = currentGame.max_players || 2;
        const isCreator = gamePlayers.find(p => p.player_index === 0)?.user_id === auth.user.id;

        return (
            <AuthenticatedLayout>
                <Head title="War in Heaven - Waiting" />
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full">
                        <h2 className="text-3xl font-bold text-white mb-6 text-center">
                            War in Heaven
                        </h2>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-white mb-4">
                                Players ({gamePlayers.length}/{maxPlayers})
                            </h3>
                            <div className="space-y-2">
                                {gamePlayers.map((player) => (
                                    <div
                                        key={player.id}
                                        className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {player.user.display_name?.[0] || player.user.username?.[0] || '?'}
                                            </div>
                                            <span className="text-white font-medium">
                                                {player.user.display_name || player.user.username}
                                                {player.user_id === auth.user.id && ' (You)'}
                                                {player.player_index === 0 && ' 👑'}
                                            </span>
                                        </div>
                                        {player.is_ready ? (
                                            <span className="text-green-400 font-semibold">Ready ✓</span>
                                        ) : (
                                            <span className="text-gray-400">Waiting...</span>
                                        )}
                                    </div>
                                ))}
                                {Array.from({ length: maxPlayers - gamePlayers.length }).map((_, i) => (
                                    <div
                                        key={`empty-${i}`}
                                        className="bg-gray-700/50 rounded-lg p-4 border-2 border-dashed border-gray-600"
                                    >
                                        <span className="text-gray-500">Waiting for player...</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleToggleReady}
                                disabled={gamePlayers.length < 2}
                                className={`flex-1 font-bold py-3 px-6 rounded-lg transition-colors ${
                                    isReady
                                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                } disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                                {isReady ? 'Not Ready' : 'Ready'}
                            </button>
                            {isCreator && (
                                <button
                                    onClick={handleCancelGame}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Cancel Game
                                </button>
                            )}
                        </div>

                        {gamePlayers.length < 2 && (
                            <p className="text-center text-gray-400 mt-4">
                                Waiting for another player to join...
                            </p>
                        )}
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Game is ready or in progress - show game view
    return (
        <AuthenticatedLayout>
            <Head title="War in Heaven" />
            <div className="min-h-screen">
                <GameView
                    gameId={gameId}
                    userId={auth.user.id}
                />
            </div>
        </AuthenticatedLayout>
    );
}
