import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps, TelestrationsGameState } from '@/types/index';
import { useGameStore } from '@/store';
import DrawingCanvas from '@/Components/DrawingCanvas';

/**
 * Telestrations Game Component
 *
 * A simultaneous party game where players alternate between drawing prompts and guessing drawings.
 * Features phase-based gameplay with sketchbook rotation and reveal gallery.
 */

interface TelestrationsProps extends PageProps {
    gameId: number;
}

export default function Telestrations({ auth, gameId }: TelestrationsProps) {
    const {
        gameState,
        currentGame,
        playerIndex,
        isConnected,
        isReady,
        error,
        loading,
        gameCancelled,
        fetchGameState,
        subscribeToGame,
        unsubscribeFromGame,
        toggleReady,
        makeMove,
        cancelGame,
        leaveGame,
    } = useGameStore();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loadTimeout, setLoadTimeout] = useState(false);

    const teleState = gameState as TelestrationsGameState | null;

    // Initialize game on mount
    useEffect(() => {
        const loadGame = async () => {
            try {
                // Check for ?join=true parameter
                const urlParams = new URLSearchParams(window.location.search);
                const shouldAutoJoin = urlParams.get('join') === 'true';

                if (shouldAutoJoin) {
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
                            window.history.replaceState({}, '', window.location.pathname);
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

        const timeoutId = setTimeout(() => {
            if (!currentGame) {
                setLoadTimeout(true);
            }
        }, 5000);

        return () => {
            clearTimeout(timeoutId);
            unsubscribeFromGame(gameId);
        };
    }, [gameId, auth.user.id]);

    // Auto-collapse sidebar on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarCollapsed(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Render phase-specific content
    const renderGameContent = () => {
        if (!teleState || playerIndex === null) return null;

        switch (teleState.phase) {
            case 'INITIAL_PROMPT':
                return <InitialPromptPhase />;
            case 'DRAWING':
                return <DrawingPhase />;
            case 'GUESSING':
                return <GuessingPhase />;
            case 'REVEAL':
                return <RevealPhase />;
            case 'ROUND_OVER':
                return <RoundOverPhase />;
            case 'GAME_OVER':
                return <GameOverPhase />;
            default:
                return <div>Unknown phase: {teleState.phase}</div>;
        }
    };

    // Initial Prompt Phase Component
    const InitialPromptPhase = () => {
        const [prompt, setPrompt] = useState('');
        const hasSubmitted = teleState!.submittedThisTurn[playerIndex!];

        const handleSubmit = async () => {
            if (prompt.trim().length === 0) return;

            try {
                await makeMove(gameId, {
                    action: 'SUBMIT_PROMPT',
                    prompt: prompt.trim()
                });
                setPrompt('');
            } catch (err) {
                console.error('Error submitting prompt:', err);
            }
        };

        return (
            <div className="initial-prompt-phase p-6">
                <h2 className="text-3xl font-bold mb-4 text-center">Choose Your Starting Prompt</h2>
                <p className="text-gray-600 text-center mb-6">Round {teleState!.currentRound} of {teleState!.rounds}</p>

                {hasSubmitted ? (
                    <div className="text-center">
                        <p className="text-xl mb-4">Waiting for other players...</p>
                        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-4">
                            {teleState!.players.map((player, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                    <span className={idx === playerIndex ? 'font-bold' : ''}>{player.name}</span>
                                    <span className={teleState!.submittedThisTurn[idx] ? 'text-green-600' : 'text-gray-400'}>
                                        {teleState!.submittedThisTurn[idx] ? '✓ Ready' : 'Waiting...'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Enter a prompt to draw (e.g., 'A cat playing piano')"
                                maxLength={100}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            />
                            <div className="mt-2 text-sm text-gray-500 text-right">
                                {prompt.length}/100
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={prompt.trim().length === 0}
                                className="mt-4 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold text-lg transition-colors"
                            >
                                Submit Prompt
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Drawing Phase Component
    const DrawingPhase = () => {
        const hasSubmitted = teleState!.submittedThisTurn[playerIndex!];
        const currentSketchbook = teleState!.sketchbooks.find(sb => sb.currentHolderId === playerIndex);
        const lastPage = currentSketchbook?.pages[currentSketchbook.pages.length - 1];
        const promptText = lastPage?.text || 'Unknown prompt';

        const handleSubmitDrawing = async (imageData: string) => {
            try {
                await makeMove(gameId, {
                    action: 'SUBMIT_DRAWING',
                    imageData
                });
            } catch (err) {
                console.error('Error submitting drawing:', err);
            }
        };

        return (
            <div className="drawing-phase p-6">
                <h2 className="text-3xl font-bold mb-2 text-center">Draw This:</h2>
                <p className="text-2xl mb-6 font-semibold text-blue-600 text-center">"{promptText}"</p>
                <p className="text-gray-600 text-center mb-6">
                    Round {teleState!.currentRound} - Turn {teleState!.currentTurn} of {teleState!.maxTurns}
                </p>

                {hasSubmitted ? (
                    <div className="text-center">
                        <p className="text-xl mb-4">Waiting for other players to finish drawing...</p>
                        <div className="text-lg text-gray-600">
                            {teleState!.submittedThisTurn.filter(Boolean).length} / {teleState!.playerCount} complete
                        </div>
                    </div>
                ) : (
                    <DrawingCanvas onComplete={handleSubmitDrawing} />
                )}
            </div>
        );
    };

    // Guessing Phase Component
    const GuessingPhase = () => {
        const [guess, setGuess] = useState('');
        const hasSubmitted = teleState!.submittedThisTurn[playerIndex!];
        const currentSketchbook = teleState!.sketchbooks.find(sb => sb.currentHolderId === playerIndex);
        const lastPage = currentSketchbook?.pages[currentSketchbook.pages.length - 1];
        const drawingImage = lastPage?.imageData || '';

        const handleSubmitGuess = async () => {
            if (guess.trim().length === 0) return;

            try {
                await makeMove(gameId, {
                    action: 'SUBMIT_GUESS',
                    guess: guess.trim()
                });
                setGuess('');
            } catch (err) {
                console.error('Error submitting guess:', err);
            }
        };

        return (
            <div className="guessing-phase p-6">
                <h2 className="text-3xl font-bold mb-4 text-center">What is this drawing?</h2>
                <p className="text-gray-600 text-center mb-6">
                    Round {teleState!.currentRound} - Turn {teleState!.currentTurn} of {teleState!.maxTurns}
                </p>

                <div className="mb-6 flex justify-center">
                    <img
                        src={drawingImage}
                        alt="Drawing to guess"
                        className="max-w-2xl w-full border-2 border-gray-400 rounded-lg shadow-lg"
                    />
                </div>

                {hasSubmitted ? (
                    <div className="text-center">
                        <p className="text-xl mb-4">Waiting for other players...</p>
                        <div className="text-lg text-gray-600">
                            {teleState!.submittedThisTurn.filter(Boolean).length} / {teleState!.playerCount} complete
                        </div>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <input
                                type="text"
                                value={guess}
                                onChange={(e) => setGuess(e.target.value)}
                                placeholder="What do you think this is?"
                                maxLength={100}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmitGuess()}
                            />
                            <div className="mt-2 text-sm text-gray-500 text-right">
                                {guess.length}/100
                            </div>
                            <button
                                onClick={handleSubmitGuess}
                                disabled={guess.trim().length === 0}
                                className="mt-4 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold text-lg transition-colors"
                            >
                                Submit Guess
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Reveal Phase Component (Gallery)
    const RevealPhase = () => {
        const [activeSketchbookId, setActiveSketchbookId] = useState(0);
        const [pageIndex, setPageIndex] = useState(0);

        const currentSketchbook = teleState!.sketchbooks[activeSketchbookId];
        const currentPage = currentSketchbook.pages[pageIndex];

        const nextPage = () => {
            if (pageIndex < currentSketchbook.pages.length - 1) {
                setPageIndex(pageIndex + 1);
            } else if (activeSketchbookId < teleState!.sketchbooks.length - 1) {
                setActiveSketchbookId(activeSketchbookId + 1);
                setPageIndex(0);
            }
        };

        const prevPage = () => {
            if (pageIndex > 0) {
                setPageIndex(pageIndex - 1);
            } else if (activeSketchbookId > 0) {
                setActiveSketchbookId(activeSketchbookId - 1);
                setPageIndex(teleState!.sketchbooks[activeSketchbookId - 1].pages.length - 1);
            }
        };

        const handleContinue = async () => {
            try {
                await makeMove(gameId, { action: 'CONTINUE_ROUND' });
            } catch (err) {
                console.error('Error continuing:', err);
            }
        };

        return (
            <div className="reveal-phase p-6">
                <h2 className="text-3xl font-bold mb-4 text-center">Round {teleState!.currentRound} Results</h2>

                <div className="sketchbook-navigation mb-6 flex justify-center items-center gap-4">
                    <button
                        onClick={prevPage}
                        disabled={activeSketchbookId === 0 && pageIndex === 0}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg font-medium"
                    >
                        ← Previous
                    </button>
                    <span className="text-lg font-medium">
                        Sketchbook {activeSketchbookId + 1} of {teleState!.sketchbooks.length}
                        {' • '}
                        Page {pageIndex + 1} of {currentSketchbook.pages.length}
                    </span>
                    <button
                        onClick={nextPage}
                        disabled={
                            activeSketchbookId === teleState!.sketchbooks.length - 1 &&
                            pageIndex === currentSketchbook.pages.length - 1
                        }
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg font-medium"
                    >
                        Next →
                    </button>
                </div>

                <div className="page-content bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
                    {currentPage.type === 'prompt' && (
                        <div className="text-center">
                            <h3 className="text-2xl font-semibold mb-4">Original Prompt</h3>
                            <p className="text-3xl my-6">"{currentPage.text}"</p>
                            <p className="text-sm text-gray-600">
                                by {teleState!.players[currentPage.authorId!].name}
                            </p>
                        </div>
                    )}

                    {currentPage.type === 'drawing' && (
                        <div className="text-center">
                            <h3 className="text-2xl font-semibold mb-4">Drawing</h3>
                            <img
                                src={currentPage.imageData}
                                alt="Drawing"
                                className="max-w-full mx-auto mt-4 border-2 border-gray-300 rounded-lg"
                            />
                            <p className="text-sm text-gray-600 mt-4">
                                by {teleState!.players[currentPage.artistId!].name}
                            </p>
                        </div>
                    )}

                    {currentPage.type === 'guess' && (
                        <div className="text-center">
                            <h3 className="text-2xl font-semibold mb-4">Guess</h3>
                            <p className="text-3xl my-6">"{currentPage.text}"</p>
                            <p className="text-sm text-gray-600">
                                by {teleState!.players[currentPage.guesserId!].name}
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={handleContinue}
                        disabled={teleState!.playersReadyToContinue[playerIndex!]}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold text-lg"
                    >
                        {teleState!.playersReadyToContinue[playerIndex!]
                            ? 'Waiting for others...'
                            : 'Continue'}
                    </button>
                </div>
            </div>
        );
    };

    // Round Over Phase Component
    const RoundOverPhase = () => {
        const handleContinue = async () => {
            try {
                await makeMove(gameId, { action: 'CONTINUE_ROUND' });
            } catch (err) {
                console.error('Error continuing:', err);
            }
        };

        return (
            <div className="round-over-phase p-6">
                <h2 className="text-4xl font-bold mb-4 text-center">Round {teleState!.currentRound} Complete!</h2>

                {teleState!.scoringEnabled && (
                    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h3 className="text-2xl font-bold mb-4 text-center">Scores</h3>
                        {teleState!.players
                            .map((player, idx) => ({ player, idx, score: teleState!.scores[idx] }))
                            .sort((a, b) => b.score - a.score)
                            .map(({ player, idx, score }, rank) => (
                                <div
                                    key={idx}
                                    className={`flex justify-between items-center py-3 border-b last:border-b-0 ${
                                        idx === playerIndex ? 'bg-blue-50 font-bold' : ''
                                    }`}
                                >
                                    <span className="text-lg">
                                        #{rank + 1} {player.name}
                                    </span>
                                    <span className="text-xl font-bold text-blue-600">{score} pts</span>
                                </div>
                            ))}
                    </div>
                )}

                <div className="text-center">
                    <button
                        onClick={handleContinue}
                        disabled={teleState!.playersReadyToContinue[playerIndex!]}
                        className="px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold text-xl"
                    >
                        {teleState!.currentRound < teleState!.rounds
                            ? teleState!.playersReadyToContinue[playerIndex!]
                                ? 'Waiting for others...'
                                : 'Start Next Round'
                            : teleState!.playersReadyToContinue[playerIndex!]
                            ? 'Waiting for others...'
                            : 'View Final Results'}
                    </button>
                </div>
            </div>
        );
    };

    // Game Over Phase Component
    const GameOverPhase = () => {
        return (
            <div className="game-over-phase p-6">
                <h2 className="text-5xl font-bold mb-6 text-center">Game Complete!</h2>

                {teleState!.scoringEnabled && (
                    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h3 className="text-3xl font-bold mb-6 text-center">Final Standings</h3>
                        {teleState!.players
                            .map((player, idx) => ({ player, idx, score: teleState!.scores[idx] }))
                            .sort((a, b) => b.score - a.score)
                            .map(({ player, idx, score }, rank) => (
                                <div
                                    key={idx}
                                    className={`flex justify-between items-center py-4 border-b last:border-b-0 ${
                                        rank === 0 ? 'bg-yellow-100' : ''
                                    } ${idx === playerIndex ? 'font-bold' : ''}`}
                                >
                                    <span className="text-2xl">
                                        {rank === 0 && '🏆 '}
                                        #{rank + 1} {player.name}
                                    </span>
                                    <span className="text-2xl font-bold text-blue-600">{score} pts</span>
                                </div>
                            ))}
                    </div>
                )}

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => router.visit('/dashboard')}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xl"
                    >
                        Return to Lobby
                    </button>
                </div>
            </div>
        );
    };

    // Sidebar Component
    const Sidebar = () => {
        if (!teleState) return null;

        return (
            <div className="sidebar bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-xl font-bold mb-4">Game Info</h3>

                <div className="game-info mb-4 text-sm space-y-1">
                    <p><span className="font-semibold">Round:</span> {teleState.currentRound} / {teleState.rounds}</p>
                    {teleState.phase !== 'INITIAL_PROMPT' && teleState.phase !== 'REVEAL' && teleState.phase !== 'ROUND_OVER' && teleState.phase !== 'GAME_OVER' && (
                        <p><span className="font-semibold">Turn:</span> {teleState.currentTurn} / {teleState.maxTurns}</p>
                    )}
                    <p><span className="font-semibold">Phase:</span> {teleState.phase}</p>
                </div>

                <h3 className="text-lg font-bold mb-2">Players</h3>
                <div className="players-list space-y-2">
                    {teleState.players.map((player, idx) => (
                        <div key={idx} className="player-card p-2 bg-gray-50 rounded">
                            <div className="flex items-center justify-between">
                                <span className={`font-medium ${idx === playerIndex ? 'text-blue-600' : ''}`}>
                                    {player.name}
                                    {idx === playerIndex && ' (You)'}
                                </span>
                            </div>
                            {teleState.scoringEnabled && (
                                <p className="text-xs text-gray-600 mt-1">
                                    Score: {teleState.scores[idx]}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Waiting Room Component
    const WaitingRoom = () => {
        if (!currentGame) return null;

        return (
            <div className="waiting-room p-6 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4 text-center">{currentGame.name || 'Telestrations Game'}</h2>
                <p className="text-gray-600 text-center mb-6">Waiting for players...</p>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4">Players ({currentGame.game_players.length}/{currentGame.max_players})</h3>
                    {currentGame.game_players.map((gp, idx) => (
                        <div key={gp.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                            <span className={gp.user_id === auth.user.id ? 'font-bold' : ''}>{gp.user.display_name || gp.user.username || gp.user.name}</span>
                            <span className={gp.is_ready ? 'text-green-600' : 'text-gray-400'}>
                                {gp.is_ready ? '✓ Ready' : 'Not ready'}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => toggleReady(gameId)}
                        className={`px-6 py-3 rounded-lg font-semibold ${
                            isReady
                                ? 'bg-gray-400 hover:bg-gray-500'
                                : 'bg-green-600 hover:bg-green-700'
                        } text-white`}
                    >
                        {isReady ? 'Not Ready' : 'Ready'}
                    </button>

                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to leave?')) {
                                leaveGame(gameId);
                                router.visit('/dashboard');
                            }
                        }}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                    >
                        Leave Game
                    </button>
                </div>
            </div>
        );
    };

    // Main render
    if (loading && !currentGame) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Telestrations" />
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-xl">Loading game...</p>
                        {loadTimeout && (
                            <p className="text-sm text-gray-600 mt-2">
                                This is taking longer than expected. Please refresh if the game doesn't load.
                            </p>
                        )}
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (error) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Error" />
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <p className="text-xl text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => router.visit('/dashboard')}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                            Return to Lobby
                        </button>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const isWaiting = currentGame?.status === 'WAITING' || currentGame?.status === 'READY';

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Telestrations" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Game Cancelled Overlay */}
                    {gameCancelled && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">⚠️</div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Game Cancelled
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        This game was cancelled by {gameCancelled.by}.
                                    </p>
                                    <button
                                        onClick={() => router.visit('/dashboard')}
                                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg"
                                    >
                                        Back to Game Room
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isWaiting ? (
                        <WaitingRoom />
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Main Game Area */}
                            <div className={`flex-1 ${sidebarCollapsed ? 'w-full' : 'lg:w-3/4'}`}>
                                <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg">
                                    {renderGameContent()}
                                </div>
                            </div>

                            {/* Sidebar */}
                            {!sidebarCollapsed && (
                                <div className="lg:w-1/4">
                                    <Sidebar />
                                </div>
                            )}

                            {/* Sidebar Toggle (Mobile) */}
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="lg:hidden fixed bottom-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg"
                            >
                                {sidebarCollapsed ? 'Show Info' : 'Hide Info'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
