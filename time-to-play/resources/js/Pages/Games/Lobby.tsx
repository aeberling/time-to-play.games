import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Game, GameTypeInfo, GameType } from '@/types';
import { useGameStore } from '@/store';

/**
 * Game Lobby Page
 *
 * Displays available games and allows players to:
 * - Browse available game types
 * - Create new games
 * - Join existing games
 * - View game status
 */

export default function Lobby({ auth }: PageProps) {
    const [gameTypes, setGameTypes] = useState<GameTypeInfo[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [myGames, setMyGames] = useState<Game[]>([]);
    const [selectedGameType, setSelectedGameType] = useState<GameType>('WAR');
    const [maxPlayers, setMaxPlayers] = useState(2);
    const [loading, setLoading] = useState(true);
    const [loadingMyGames, setLoadingMyGames] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Oh Hell specific options
    const [startingHandSize, setStartingHandSize] = useState(10);
    const [endingHandSize, setEndingHandSize] = useState(1);

    // Swoop specific options
    const [scoreLimit, setScoreLimit] = useState(300);
    const [scoringMethod, setScoringMethod] = useState<'beginner' | 'normal'>('beginner');

    const gameStore = useGameStore();
    const hasFetchedOnce = useRef(false);

    // Fetch game types and available games on mount and every time component renders
    // This ensures fresh data when navigating back to lobby
    useEffect(() => {
        if (!hasFetchedOnce.current) {
            fetchGameTypes();
            hasFetchedOnce.current = true;
        }

        // Always refresh game lists when component is visible
        fetchGames();
        fetchMyGames();
    }, []);

    // Also refresh when user switches tabs/windows back to the app
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchGames();
                fetchMyGames();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Update hand sizes when max players changes for Oh Hell
    useEffect(() => {
        if (selectedGameType === 'OH_HELL') {
            const maxPossibleCards = Math.floor(52 / maxPlayers);

            // Adjust starting hand size if it exceeds max
            if (startingHandSize > maxPossibleCards) {
                setStartingHandSize(maxPossibleCards);
            }

            // Adjust ending hand size if it exceeds max
            if (endingHandSize > maxPossibleCards) {
                setEndingHandSize(maxPossibleCards);
            }
        }
    }, [maxPlayers, selectedGameType]);

    const fetchGameTypes = async () => {
        try {
            const response = await window.axios.get('/api/games/types');
            setGameTypes(response.data.games);
        } catch (err: any) {
            console.error('Failed to fetch game types:', err);
            setError('Failed to load game types');
        }
    };

    const fetchGames = async () => {
        setLoading(true);
        try {
            const response = await window.axios.get('/api/games', {
                params: {
                    status: 'WAITING',
                },
            });
            setGames(response.data.data);
        } catch (err: any) {
            console.error('Failed to fetch games:', err);
            setError('Failed to load games');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyGames = async () => {
        setLoadingMyGames(true);
        try {
            const response = await window.axios.get('/api/games', {
                params: {
                    user_id: auth.user.id,
                    exclude_completed: true,
                },
            });
            setMyGames(response.data.data);
        } catch (err: any) {
            console.error('Failed to fetch my games:', err);
        } finally {
            setLoadingMyGames(false);
        }
    };

    const handleCreateGame = async () => {
        try {
            // Build game options based on game type
            let gameOptions = undefined;
            if (selectedGameType === 'OH_HELL') {
                gameOptions = {
                    startingHandSize,
                    endingHandSize,
                };
            } else if (selectedGameType === 'SWOOP') {
                gameOptions = {
                    scoreLimit,
                    scoringMethod,
                };
            }

            await gameStore.createGame(selectedGameType, maxPlayers, gameOptions);
            // Navigate to the game page
            if (gameStore.currentGame) {
                router.visit(`/games/${gameStore.currentGame.id}`);
            }
        } catch (err: any) {
            console.error('Failed to create game:', err);
            setError(err.response?.data?.message || 'Failed to create game');
        }
    };

    const handleJoinGame = async (gameId: number) => {
        try {
            await gameStore.joinGame(gameId);
            router.visit(`/games/${gameId}`);
        } catch (err: any) {
            console.error('Failed to join game:', err);
        }
    };

    const selectedGameTypeInfo = gameTypes.find((gt) => gt.type === selectedGameType);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Game Lobby
                </h2>
            }
        >
            <Head title="Game Lobby" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {/* Error Display */}
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Create New Game Section */}
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Create New Game
                        </h3>

                        <div className="space-y-4">
                            {/* Game Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Game Type
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {gameTypes.map((gameType) => (
                                        <button
                                            key={gameType.type}
                                            onClick={() => {
                                                setSelectedGameType(gameType.type);
                                                setMaxPlayers(gameType.config.minPlayers);
                                            }}
                                            className={`p-4 border-2 rounded-lg text-left transition-all ${
                                                selectedGameType === gameType.type
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <h4 className="font-semibold text-gray-900">
                                                {gameType.name}
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {gameType.config.description}
                                            </p>
                                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                                <span>
                                                    {gameType.config.minPlayers}-
                                                    {gameType.config.maxPlayers} players
                                                </span>
                                                <span className="font-medium">
                                                    {gameType.config.difficulty}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Player Count Selection */}
                            {selectedGameTypeInfo && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Players: {maxPlayers}
                                    </label>
                                    <input
                                        type="range"
                                        min={selectedGameTypeInfo.config.minPlayers}
                                        max={selectedGameTypeInfo.config.maxPlayers}
                                        value={maxPlayers}
                                        onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            )}

                            {/* Oh Hell Specific Options */}
                            {selectedGameType === 'OH_HELL' && (
                                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="font-medium text-gray-900">Game Options</h4>

                                    {/* Starting Hand Size */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Starting Hand Size: {startingHandSize} cards
                                        </label>
                                        <input
                                            type="range"
                                            min={1}
                                            max={Math.floor(52 / maxPlayers)}
                                            value={startingHandSize}
                                            onChange={(e) => setStartingHandSize(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            First round will be dealt {startingHandSize} cards
                                        </p>
                                    </div>

                                    {/* Ending Hand Size */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ending Hand Size: {endingHandSize} cards
                                        </label>
                                        <input
                                            type="range"
                                            min={1}
                                            max={Math.floor(52 / maxPlayers)}
                                            value={endingHandSize}
                                            onChange={(e) => setEndingHandSize(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Last round will be dealt {endingHandSize} cards
                                        </p>
                                    </div>

                                    {/* Game Summary */}
                                    <div className="p-3 bg-white rounded border border-gray-200">
                                        <p className="text-sm text-gray-700">
                                            <strong>Total Rounds:</strong> {Math.abs(endingHandSize - startingHandSize) + 1}
                                        </p>
                                        <p className="text-sm text-gray-700 mt-1">
                                            <strong>Progression:</strong>{' '}
                                            {startingHandSize < endingHandSize
                                                ? `Ascending (${startingHandSize} → ${endingHandSize})`
                                                : startingHandSize > endingHandSize
                                                ? `Descending (${startingHandSize} → ${endingHandSize})`
                                                : `Fixed (${startingHandSize} cards all rounds)`}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Swoop Specific Options */}
                            {selectedGameType === 'SWOOP' && (
                                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="font-medium text-gray-900">Game Options</h4>

                                    {/* Scoring Method */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Scoring Method
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setScoringMethod('beginner')}
                                                className={`p-3 border-2 rounded-lg text-left transition-all ${
                                                    scoringMethod === 'beginner'
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="font-semibold text-sm">Beginner</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    Numbers/Ace: 5 pts<br />
                                                    Face cards: 10 pts<br />
                                                    10s & Jokers: 50 pts
                                                </div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setScoringMethod('normal')}
                                                className={`p-3 border-2 rounded-lg text-left transition-all ${
                                                    scoringMethod === 'normal'
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="font-semibold text-sm">Normal</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    Traditional scoring<br />
                                                    (Face value & bonuses)
                                                </div>
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {scoringMethod === 'beginner'
                                                ? 'Simplified scoring: Numbers (2-9) and Aces are 5 points, face cards (J, Q, K) are 10 points, 10s and Jokers are 50 points.'
                                                : 'Traditional scoring: Numbers worth face value (2-9), Aces and face cards worth 10, 10s and Jokers worth 50.'}
                                        </p>
                                    </div>

                                    {/* Score Limit */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Score Limit: {scoreLimit} points
                                        </label>
                                        <input
                                            type="range"
                                            min={50}
                                            max={500}
                                            step={50}
                                            value={scoreLimit}
                                            onChange={(e) => setScoreLimit(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Game ends when a player reaches {scoreLimit} points. The player with the lowest score wins.
                                        </p>
                                    </div>

                                    {/* Game Summary */}
                                    <div className="p-3 bg-white rounded border border-gray-200">
                                        <p className="text-sm text-gray-700">
                                            <strong>Win Condition:</strong> Lowest score when any player reaches {scoreLimit} points
                                        </p>
                                        <p className="text-sm text-gray-700 mt-1">
                                            <strong>Game Length:</strong>{' '}
                                            {scoreLimit <= 100
                                                ? 'Quick (1-3 rounds)'
                                                : scoreLimit <= 250
                                                ? 'Medium (3-5 rounds)'
                                                : scoreLimit <= 400
                                                ? 'Long (5-8 rounds)'
                                                : 'Extended (8+ rounds)'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Create Button */}
                            <button
                                onClick={handleCreateGame}
                                disabled={gameStore.loading}
                                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {gameStore.loading ? 'Creating...' : 'Create Game'}
                            </button>
                        </div>
                    </div>

                    {/* Your Active Games Section */}
                    {myGames.length > 0 && (
                        <div className="bg-white p-6 shadow sm:rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Your Active Games
                                </h3>
                                <button
                                    onClick={fetchMyGames}
                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                    Refresh
                                </button>
                            </div>

                            {loadingMyGames ? (
                                <div className="text-center py-8 text-gray-500">
                                    Loading your games...
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myGames.map((game) => {
                                        const gameTypeInfo = gameTypes.find(
                                            (gt) => gt.type === game.game_type
                                        );

                                        return (
                                            <div
                                                key={game.id}
                                                className="border-2 border-indigo-200 bg-indigo-50 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="font-semibold text-gray-900">
                                                                {gameTypeInfo?.name || game.game_type} #{game.id}
                                                            </h4>
                                                            <span
                                                                className={`px-2 py-1 text-xs font-medium rounded ${
                                                                    game.status === 'WAITING'
                                                                        ? 'bg-yellow-100 text-yellow-800'
                                                                        : game.status === 'READY'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : game.status === 'IN_PROGRESS'
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                                }`}
                                                            >
                                                                {game.status}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                                            <span>
                                                                Players: {game.game_players.length}/
                                                                {game.max_players}
                                                            </span>
                                                            {game.game_players.length > 0 && (
                                                                <span className="flex items-center gap-1">
                                                                    {game.game_players.map((p) => (
                                                                        <span
                                                                            key={p.id}
                                                                            className={`inline-block w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium ${
                                                                                p.user_id === auth.user.id
                                                                                    ? 'bg-indigo-600 text-white'
                                                                                    : 'bg-gray-300'
                                                                            }`}
                                                                            title={p.user.display_name || p.user.name}
                                                                        >
                                                                            {p.user.display_name?.[0] ||
                                                                                p.user.name[0]}
                                                                        </span>
                                                                    ))}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => router.visit(`/games/${game.id}`)}
                                                        className="px-4 py-2 rounded-md font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                                                    >
                                                        {game.status === 'IN_PROGRESS' ? 'Resume Game' : 'View Game'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Available Games Section */}
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Available Games
                            </h3>
                            <button
                                onClick={fetchGames}
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                            >
                                Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-8 text-gray-500">
                                Loading games...
                            </div>
                        ) : games.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No games available. Create one to get started!
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {games.map((game) => {
                                    const gameTypeInfo = gameTypes.find(
                                        (gt) => gt.type === game.game_type
                                    );
                                    const isFull =
                                        game.game_players.length >= game.max_players;
                                    const isPlayerInGame = game.game_players.some(
                                        (p) => p.user_id === auth.user.id
                                    );

                                    return (
                                        <div
                                            key={game.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-semibold text-gray-900">
                                                            {gameTypeInfo?.name || game.game_type}
                                                        </h4>
                                                        <span
                                                            className={`px-2 py-1 text-xs font-medium rounded ${
                                                                game.status === 'WAITING'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                        >
                                                            {game.status}
                                                        </span>
                                                        {isPlayerInGame && (
                                                            <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                                                You're in this game
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                                        <span>
                                                            Players: {game.game_players.length}/
                                                            {game.max_players}
                                                        </span>
                                                        {game.game_players.length > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                {game.game_players.map((p) => (
                                                                    <span
                                                                        key={p.id}
                                                                        className="inline-block w-6 h-6 rounded-full bg-gray-300 text-xs flex items-center justify-center font-medium"
                                                                    >
                                                                        {p.user.display_name?.[0] ||
                                                                            p.user.name[0]}
                                                                    </span>
                                                                ))}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {isPlayerInGame ? (
                                                    <button
                                                        onClick={() => router.visit(`/games/${game.id}`)}
                                                        className="px-4 py-2 rounded-md font-medium bg-green-600 text-white hover:bg-green-700"
                                                    >
                                                        View Game
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleJoinGame(game.id)}
                                                        disabled={isFull}
                                                        className={`px-4 py-2 rounded-md font-medium ${
                                                            isFull
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                        }`}
                                                    >
                                                        {isFull ? 'Full' : 'Join'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
