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

            const response = await window.axios.post('/api/games', {
                game_type: selectedGameType,
                max_players: maxPlayers,
                game_options: gameOptions,
            });

            const game = response.data.game;

            // Update the store
            gameStore.setCurrentGame(game);

            // Navigate to the game page immediately
            router.visit(`/games/${game.id}`);
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

    const handleArchiveGame = async (gameId: number) => {
        if (!confirm('Are you sure you want to end this game? This action cannot be undone and the game will be moved to the archive.')) {
            return;
        }

        try {
            await window.axios.post(`/api/games/${gameId}/archive`);
            // Refresh the games list to remove the archived game
            fetchMyGames();
            setError(null);
        } catch (err: any) {
            console.error('Failed to archive game:', err);
            setError(err.response?.data?.message || 'Failed to archive game');
        }
    };

    const selectedGameTypeInfo = gameTypes.find((gt) => gt.type === selectedGameType);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-4xl font-black leading-tight text-adventure-900 drop-shadow-md">
                    Game Lobby 🎲
                </h2>
            }
        >
            <Head title="Game Lobby" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {/* Error Display */}
                    {error && (
                        <div className="rounded-3xl bg-gradient-to-r from-coral-200 to-coral-300 p-6 border-4 border-coral-500 shadow-lg">
                            <p className="text-base font-bold text-adventure-900">{error}</p>
                        </div>
                    )}

                    {/* Create New Game Section */}
                    <div className="bg-white p-8 shadow-2xl rounded-3xl border-8 border-quest-300">
                        <h3 className="text-3xl font-black text-adventure-900 mb-6">
                            Create New Game ⚔️
                        </h3>

                        <div className="space-y-4">
                            {/* Game Type Selection */}
                            <div>
                                <label className="block text-xl font-black text-adventure-900 mb-4">
                                    Choose Your Game
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {gameTypes.map((gameType, index) => {
                                        const colors = [
                                            { border: 'border-coral-700', bg: 'bg-gradient-to-br from-coral-600 to-coral-700', selectedBg: 'bg-gradient-to-br from-coral-600 to-coral-700', hover: 'hover:scale-105 hover:shadow-2xl' },
                                            { border: 'border-treasure-700', bg: 'bg-gradient-to-br from-treasure-600 to-treasure-700', selectedBg: 'bg-gradient-to-br from-treasure-600 to-treasure-700', hover: 'hover:scale-105 hover:shadow-2xl' },
                                            { border: 'border-adventure-700', bg: 'bg-gradient-to-br from-adventure-600 to-adventure-700', selectedBg: 'bg-gradient-to-br from-adventure-600 to-adventure-700', hover: 'hover:scale-105 hover:shadow-2xl' }
                                        ];
                                        const colorClass = colors[index % colors.length];

                                        return (
                                            <button
                                                key={gameType.type}
                                                onClick={() => {
                                                    setSelectedGameType(gameType.type);
                                                    setMaxPlayers(gameType.config.minPlayers);
                                                }}
                                                className={`p-6 border-6 rounded-2xl text-left transition-all transform ${
                                                    selectedGameType === gameType.type
                                                        ? `${colorClass.border} ${colorClass.selectedBg} scale-105 shadow-2xl`
                                                        : 'border-gray-300 bg-white hover:border-gray-400'
                                                } ${colorClass.hover}`}
                                            >
                                                <h4 className={`font-black text-2xl ${selectedGameType === gameType.type ? 'text-white drop-shadow-lg' : 'text-adventure-900'}`}>
                                                    {gameType.name}
                                                </h4>
                                                <p className={`text-base font-bold mt-2 leading-relaxed ${selectedGameType === gameType.type ? 'text-white drop-shadow-md' : 'text-adventure-700'}`}>
                                                    {gameType.config.description}
                                                </p>
                                                <div className={`mt-3 flex items-center gap-4 text-sm font-bold ${selectedGameType === gameType.type ? 'text-white drop-shadow-md' : 'text-adventure-800'}`}>
                                                    <span>
                                                        {gameType.config.minPlayers}-
                                                        {gameType.config.maxPlayers} players
                                                    </span>
                                                    <span className="font-black">
                                                        {gameType.config.difficulty}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Player Count Selection */}
                            {selectedGameTypeInfo && (
                                <div className="bg-gradient-to-r from-adventure-50 to-quest-50 rounded-2xl p-6 border-4 border-adventure-300">
                                    <label className="block text-lg font-black text-adventure-900 mb-3">
                                        Max Players: <span className="text-quest-600">{maxPlayers}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min={selectedGameTypeInfo.config.minPlayers}
                                        max={selectedGameTypeInfo.config.maxPlayers}
                                        value={maxPlayers}
                                        onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                                        className="w-full h-3 bg-adventure-300 rounded-lg appearance-none cursor-pointer"
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
                                className="w-full bg-gradient-to-br from-quest-500 to-quest-600 text-white py-5 px-8 rounded-full hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-black text-2xl shadow-2xl border-6 border-white transition transform"
                            >
                                {gameStore.loading ? 'Creating...' : 'Create Game! 🎉'}
                            </button>
                        </div>
                    </div>

                    {/* Your Active Games Section */}
                    {myGames.length > 0 && (
                        <div className="bg-white p-8 shadow-2xl rounded-3xl border-8 border-coral-300">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-3xl font-black text-adventure-900">
                                    Your Active Games 🎮
                                </h3>
                                <button
                                    onClick={fetchMyGames}
                                    className="text-base font-bold text-adventure-700 hover:text-adventure-900 hover:scale-110 transition transform px-4 py-2 rounded-full border-4 border-adventure-300 bg-adventure-50"
                                >
                                    Refresh
                                </button>
                            </div>

                            {loadingMyGames ? (
                                <div className="text-center py-8 text-adventure-700 font-bold text-xl">
                                    Loading your games...
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myGames.map((game) => {
                                        const gameTypeInfo = gameTypes.find(
                                            (gt) => gt.type === game.game_type
                                        );
                                        // Check if current user is the creator (player_index 0)
                                        const isCreator = game.game_players.some(
                                            (p) => p.player_index === 0 && p.user_id === auth.user.id
                                        );

                                        return (
                                            <div
                                                key={game.id}
                                                className="border-6 border-coral-600 bg-gradient-to-br from-coral-50 via-white to-quest-50 rounded-2xl p-6 hover:border-coral-700 hover:scale-105 hover:shadow-2xl transition-all transform shadow-xl ring-4 ring-coral-200 hover:ring-coral-300"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            <h4 className="font-black text-2xl text-adventure-900">
                                                                {gameTypeInfo?.name || game.game_type} #{game.id}
                                                            </h4>
                                                            <span
                                                                className={`px-3 py-1 text-sm font-black rounded-full border-4 ${
                                                                    game.status === 'WAITING'
                                                                        ? 'bg-quest-500 text-white border-quest-700'
                                                                        : game.status === 'READY'
                                                                        ? 'bg-treasure-600 text-white border-treasure-800'
                                                                        : game.status === 'IN_PROGRESS'
                                                                        ? 'bg-cyan-600 text-white border-cyan-800 animate-pulse'
                                                                        : 'bg-gray-400 text-white border-gray-600'
                                                                }`}
                                                            >
                                                                {game.status}
                                                            </span>
                                                            {isCreator && (
                                                                <span className="px-3 py-1 text-sm font-black rounded-full bg-adventure-600 text-white border-4 border-adventure-800">
                                                                    Host
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-3 flex items-center gap-4 text-base text-adventure-800 font-bold">
                                                            <span>
                                                                Players: {game.game_players.length}/
                                                                {game.max_players}
                                                            </span>
                                                            {game.game_players.length > 0 && (
                                                                <span className="flex items-center gap-1">
                                                                    {game.game_players.map((p) => (
                                                                        <span
                                                                            key={p.id}
                                                                            className={`inline-block w-8 h-8 rounded-full text-sm flex items-center justify-center font-black border-2 ${
                                                                                p.user_id === auth.user.id
                                                                                    ? 'bg-gradient-to-br from-adventure-500 to-adventure-700 text-white border-white shadow-md'
                                                                                    : 'bg-gray-300 border-gray-400'
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
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <button
                                                            onClick={() => router.visit(`/games/${game.id}`)}
                                                            className="px-6 py-3 rounded-full font-black bg-gradient-to-br from-quest-500 to-quest-600 text-white hover:scale-105 transition transform shadow-lg border-4 border-white"
                                                        >
                                                            {game.status === 'IN_PROGRESS' ? 'Resume Game' : 'View Game'}
                                                        </button>
                                                        {isCreator && (
                                                            <button
                                                                onClick={() => handleArchiveGame(game.id)}
                                                                className="px-6 py-3 rounded-full font-black bg-gradient-to-br from-coral-500 to-coral-600 text-white hover:scale-105 transition transform shadow-lg border-4 border-white"
                                                                title="End and archive this game"
                                                            >
                                                                End Game
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Available Games Section */}
                    <div className="bg-white p-8 shadow-2xl rounded-3xl border-8 border-treasure-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-3xl font-black text-adventure-900">
                                Available Games 🌟
                            </h3>
                            <button
                                onClick={fetchGames}
                                className="text-base font-bold text-adventure-700 hover:text-adventure-900 hover:scale-110 transition transform px-4 py-2 rounded-full border-4 border-adventure-300 bg-adventure-50"
                            >
                                Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-8 text-adventure-700 font-bold text-xl">
                                Loading games...
                            </div>
                        ) : games.length === 0 ? (
                            <div className="text-center py-12 bg-gradient-to-br from-treasure-100 to-adventure-100 rounded-3xl border-4 border-dashed border-treasure-400">
                                <div className="text-6xl mb-4">🎯</div>
                                <p className="text-xl font-bold text-adventure-800">
                                    No games available. Create one to get started!
                                </p>
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
                                            className="border-6 border-adventure-400 bg-white rounded-2xl p-6 hover:border-adventure-600 hover:scale-105 hover:shadow-2xl transition-all transform shadow-lg"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <h4 className="font-black text-2xl text-adventure-900">
                                                            {gameTypeInfo?.name || game.game_type}
                                                        </h4>
                                                        <span
                                                            className={`px-3 py-1 text-sm font-black rounded-full border-4 ${
                                                                game.status === 'WAITING'
                                                                    ? 'bg-quest-500 text-white border-quest-700'
                                                                    : 'bg-gray-400 text-white border-gray-600'
                                                            }`}
                                                        >
                                                            {game.status}
                                                        </span>
                                                        {isPlayerInGame && (
                                                            <span className="px-3 py-1 text-sm font-black rounded-full bg-cyan-600 text-white border-4 border-cyan-800">
                                                                You're in!
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-3 flex items-center gap-4 text-base text-adventure-800 font-bold">
                                                        <span>
                                                            Players: {game.game_players.length}/
                                                            {game.max_players}
                                                        </span>
                                                        {game.game_players.length > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                {game.game_players.map((p) => (
                                                                    <span
                                                                        key={p.id}
                                                                        className="inline-block w-8 h-8 rounded-full bg-gradient-to-br from-treasure-400 to-treasure-600 text-white text-sm flex items-center justify-center font-black border-2 border-white shadow-md"
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
                                                        className="px-6 py-3 rounded-full font-black bg-gradient-to-br from-treasure-500 to-treasure-600 text-white hover:scale-105 transition transform shadow-lg border-4 border-white"
                                                    >
                                                        View Game
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleJoinGame(game.id)}
                                                        disabled={isFull}
                                                        className={`px-6 py-3 rounded-full font-black shadow-lg border-4 transition transform ${
                                                            isFull
                                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400'
                                                                : 'bg-gradient-to-br from-quest-500 to-quest-600 text-white hover:scale-105 border-white'
                                                        }`}
                                                    >
                                                        {isFull ? 'Full' : 'Join!'}
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
