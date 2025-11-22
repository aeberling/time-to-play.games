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
    const [loading, setLoading] = useState(true);
    const [loadingMyGames, setLoadingMyGames] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    // Listen for real-time lobby updates via WebSocket
    useEffect(() => {
        // Subscribe to the lobby channel
        const channel = window.Echo.channel('lobby');

        // Listen for new game creation
        channel.listen('.game.created', (e: { game: Game; timestamp: string }) => {
            console.log('New game created:', e.game);
            setGames((prevGames) => [e.game, ...prevGames]);
        });

        // Listen for game updates (e.g., player joins, game starts)
        channel.listen('.game.updated', (e: { game: Game; timestamp: string }) => {
            console.log('Game updated:', e.game);

            // Check if current user is now in the game
            const userInGame = e.game.game_players?.some(p => p.user_id === auth.user.id);

            // Update or remove from available games list based on status
            setGames((prevGames) => {
                // Remove game if it's no longer waiting
                if (e.game.status !== 'WAITING') {
                    return prevGames.filter((game) => game.id !== e.game.id);
                }
                // Update existing game
                return prevGames.map((game) => (game.id === e.game.id ? e.game : game));
            });

            // Update or add to my games list if user is in the game
            setMyGames((prevGames) => {
                const existingGameIndex = prevGames.findIndex((game) => game.id === e.game.id);
                if (existingGameIndex >= 0) {
                    // Update existing game
                    return prevGames.map((game) => (game.id === e.game.id ? e.game : game));
                } else if (userInGame) {
                    // Add new game to my games
                    return [e.game, ...prevGames];
                }
                return prevGames;
            });
        });

        // Cleanup on unmount
        return () => {
            channel.stopListening('.game.created');
            channel.stopListening('.game.updated');
            window.Echo.leave('lobby');
        };
    }, []);

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

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-4xl font-black leading-tight text-adventure-900 drop-shadow-md">
                    Game Room 🎲
                </h2>
            }
        >
            <Head title="Game Room" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Error Display */}
                    {error && (
                        <div className="rounded-3xl bg-gradient-to-r from-coral-200 to-coral-300 p-6 border-4 border-coral-500 shadow-lg mb-6">
                            <p className="text-base font-bold text-adventure-900">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Choose Game & Your Games */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Choose a Game Section */}
                            <div className="bg-white p-8 shadow-2xl rounded-3xl border-8 border-quest-300">
                        <h3 className="text-3xl font-black text-adventure-900 mb-6">
                            Choose a Game ⚔️
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {gameTypes.map((gameType, index) => {
                                const colors = [
                                    { border: 'border-coral-700', bg: 'bg-gradient-to-br from-coral-600 to-coral-700', hover: 'hover:scale-105 hover:shadow-2xl' },
                                    { border: 'border-treasure-700', bg: 'bg-gradient-to-br from-treasure-600 to-treasure-700', hover: 'hover:scale-105 hover:shadow-2xl' },
                                    { border: 'border-adventure-700', bg: 'bg-gradient-to-br from-adventure-600 to-adventure-700', hover: 'hover:scale-105 hover:shadow-2xl' },
                                    { border: 'border-quest-700', bg: 'bg-gradient-to-br from-quest-600 to-quest-700', hover: 'hover:scale-105 hover:shadow-2xl' }
                                ];
                                const colorClass = colors[index % colors.length];

                                const infoRoutes: Record<string, string> = {
                                    'SWOOP': '/games/swoop/info',
                                    'OH_HELL': '/games/oh-hell/info',
                                    'TELESTRATIONS': '/games/telestrations/info',
                                    'WAR_IN_HEAVEN': '/games/war-in-heaven/info',
                                };

                                return (
                                    <button
                                        key={gameType.type}
                                        onClick={() => router.visit(infoRoutes[gameType.type])}
                                        className={`p-6 border-6 rounded-2xl text-left transition-all transform ${colorClass.border} ${colorClass.bg} ${colorClass.hover} shadow-xl`}
                                    >
                                        <h4 className="font-black text-2xl text-white drop-shadow-lg mb-3">
                                            {gameType.name}
                                        </h4>
                                        <p className="text-base font-bold text-white/90 drop-shadow-md leading-relaxed mb-4">
                                            {gameType.config.description}
                                        </p>
                                        <div className="flex items-center justify-between text-sm font-bold text-white drop-shadow-md">
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
                                                                {game.name || `${gameTypeInfo?.name || game.game_type} #${game.id}`}
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
                        </div>

                        {/* Right Column: Available Games */}
                        <div className="lg:col-span-1">
                            {/* Available Games Section */}
                            <div className="bg-white p-8 shadow-2xl rounded-3xl border-8 border-treasure-300 sticky top-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-adventure-900">
                                Available Games 🌟
                            </h3>
                            <button
                                onClick={fetchGames}
                                className="text-sm font-bold text-adventure-700 hover:text-adventure-900 hover:scale-110 transition transform px-3 py-1 rounded-full border-4 border-adventure-300 bg-adventure-50"
                            >
                                ↻
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
                                                            {game.name || `${gameTypeInfo?.name || game.game_type} #${game.id}`}
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
