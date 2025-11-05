import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
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
    const [selectedGameType, setSelectedGameType] = useState<GameType>('WAR');
    const [maxPlayers, setMaxPlayers] = useState(2);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const gameStore = useGameStore();

    // Fetch game types and available games on mount
    useEffect(() => {
        fetchGameTypes();
        fetchGames();
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

    const handleCreateGame = async () => {
        try {
            await gameStore.createGame(selectedGameType, maxPlayers);
            // Navigate to the game page
            if (gameStore.currentGame) {
                router.visit(`/games/${gameStore.currentGame.id}`);
            }
        } catch (err: any) {
            console.error('Failed to create game:', err);
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
