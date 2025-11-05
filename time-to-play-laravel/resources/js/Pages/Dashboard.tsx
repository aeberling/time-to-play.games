import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { PageProps, Game, GameTypeInfo } from '@/types';

interface OnlineUser {
    id: number;
    name: string;
    display_name: string | null;
    avatar_url: string | null;
    initials: string;
}

export default function Dashboard({ auth }: PageProps) {
    const [myGames, setMyGames] = useState<Game[]>([]);
    const [gameTypes, setGameTypes] = useState<GameTypeInfo[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();

        // Set up heartbeat to mark user as online
        const heartbeat = setInterval(() => {
            window.axios.post('/api/users/heartbeat').catch(console.error);
        }, 60000); // Every minute

        // Refresh online users more frequently
        const refreshOnlineUsers = setInterval(() => {
            fetchOnlineUsers();
        }, 30000); // Every 30 seconds

        // Send initial heartbeat
        window.axios.post('/api/users/heartbeat').catch(console.error);

        return () => {
            clearInterval(heartbeat);
            clearInterval(refreshOnlineUsers);
        };
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [gamesRes, typesRes, usersRes] = await Promise.all([
                window.axios.get('/api/games', {
                    params: {
                        user_id: auth.user.id,
                        exclude_completed: true,
                    },
                }),
                window.axios.get('/api/games/types'),
                window.axios.get('/api/users/online'),
            ]);

            setMyGames(gamesRes.data.data);
            setGameTypes(typesRes.data.games);
            setOnlineUsers(usersRes.data.users.filter((u: OnlineUser) => u.id !== auth.user.id));
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOnlineUsers = async () => {
        try {
            const usersRes = await window.axios.get('/api/users/online');
            setOnlineUsers(usersRes.data.users.filter((u: OnlineUser) => u.id !== auth.user.id));
        } catch (err) {
            console.error('Failed to fetch online users:', err);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Current Games & New Games */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Your Current Games */}
                            <div className="bg-white shadow-sm sm:rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Your Current Games
                                    </h3>
                                    <button
                                        onClick={fetchData}
                                        className="text-sm text-indigo-600 hover:text-indigo-800"
                                    >
                                        Refresh
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Loading...
                                    </div>
                                ) : myGames.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 mb-4">
                                            You're not in any games yet
                                        </p>
                                        <Link
                                            href="/games/lobby"
                                            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
                                        >
                                            Browse Games
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {myGames.map((game) => {
                                            const gameTypeInfo = gameTypes.find(
                                                (gt) => gt.type === game.game_type
                                            );

                                            return (
                                                <div
                                                    key={game.id}
                                                    className="border-2 border-indigo-200 bg-indigo-50 rounded-lg p-4 hover:border-indigo-300 transition-colors cursor-pointer"
                                                    onClick={() => router.visit(`/games/${game.id}`)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-semibold text-gray-900">
                                                                    {gameTypeInfo?.name || game.game_type}
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
                                                            <div className="mt-1 text-sm text-gray-600">
                                                                {game.game_players.length}/{game.max_players} players
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-medium text-indigo-600">
                                                            {game.status === 'IN_PROGRESS' ? 'Play →' : 'View →'}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* New Games to Try */}
                            <div className="bg-white shadow-sm sm:rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Games to Try
                                </h3>

                                {loading ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Loading...
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {gameTypes.map((gameType) => (
                                            <div
                                                key={gameType.type}
                                                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                                            >
                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                    {gameType.name}
                                                </h4>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {gameType.config.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-xs text-gray-500">
                                                        <span className="font-medium">{gameType.config.difficulty}</span>
                                                        <span className="mx-1">•</span>
                                                        <span>
                                                            {gameType.config.minPlayers}-{gameType.config.maxPlayers} players
                                                        </span>
                                                    </div>
                                                    <Link
                                                        href="/games/lobby"
                                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        Play
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Online Players */}
                        <div className="lg:col-span-1">
                            <div className="bg-white shadow-sm sm:rounded-lg p-6 sticky top-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Online Players
                                    </h3>
                                    <span className="flex items-center gap-1 text-sm text-gray-500">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        {onlineUsers.length}
                                    </span>
                                </div>

                                {loading ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Loading...
                                    </div>
                                ) : onlineUsers.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No other players online
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {onlineUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                                    {user.initials}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 truncate">
                                                        {user.display_name || user.name}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-green-600">
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                        Online
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <Link
                                        href="/games/lobby"
                                        className="block w-full bg-indigo-600 text-white text-center px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
                                    >
                                        Go to Lobby
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
