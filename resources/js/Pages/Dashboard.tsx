import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { PageProps, Game } from '@/types';

interface OnlineUser {
    id: number;
    name: string;
    display_name: string | null;
    avatar_url: string | null;
    initials: string;
}

export default function Dashboard({ auth }: PageProps) {
    const [myGames, setMyGames] = useState<Game[]>([]);
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
            const [gamesRes, usersRes] = await Promise.all([
                window.axios.get('/api/games', {
                    params: {
                        user_id: auth.user.id,
                        exclude_completed: true,
                    },
                }),
                window.axios.get('/api/users/online'),
            ]);

            setMyGames(gamesRes.data.data);
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
                <h2 className="text-4xl font-black leading-tight text-adventure-900 drop-shadow-md">
                    Player's Corner
                </h2>
            }
        >
            <Head title="Player's Corner" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Current Games */}
                        <div className="lg:col-span-2">
                            {/* Your Current Games */}
                            <div className="bg-white shadow-2xl rounded-3xl p-8 border-8 border-adventure-300">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-3xl font-black text-adventure-900">
                                        Your Current Games 🎮
                                    </h3>
                                    <button
                                        onClick={fetchData}
                                        className="text-base font-bold text-adventure-700 hover:text-adventure-900 hover:scale-110 transition transform px-4 py-2 rounded-full border-4 border-adventure-300 bg-adventure-50"
                                    >
                                        Refresh
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="text-center py-8 text-adventure-700 font-bold text-xl">
                                        Loading adventures...
                                    </div>
                                ) : myGames.length === 0 ? (
                                    <div className="text-center py-12 bg-gradient-to-br from-quest-100 to-adventure-100 rounded-3xl border-4 border-dashed border-adventure-400">
                                        <div className="text-6xl mb-4">🎲</div>
                                        <p className="text-xl font-bold text-adventure-800 mb-6">
                                            No active quests yet!
                                        </p>
                                        <Link
                                            href="/games/lobby"
                                            className="inline-block bg-gradient-to-br from-quest-500 to-quest-600 text-white px-8 py-4 rounded-full hover:scale-110 transition transform font-black text-lg shadow-lg border-4 border-white"
                                        >
                                            Go to Game Room!
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myGames.map((game) => {
                                            return (
                                                <div
                                                    key={game.id}
                                                    className="border-6 border-coral-600 bg-gradient-to-br from-coral-50 via-white to-quest-50 rounded-2xl p-6 hover:border-coral-700 hover:scale-105 hover:shadow-2xl transition-all transform cursor-pointer shadow-xl ring-4 ring-coral-200 hover:ring-coral-300"
                                                    onClick={() => router.visit(`/games/${game.id}`)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <h4 className="font-black text-2xl text-adventure-900">
                                                                    {game.name || game.game_type.replace(/_/g, ' ')}
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
                                                            </div>
                                                            <div className="mt-2 text-base font-bold text-adventure-700">
                                                                {game.game_players.length}/{game.max_players} players
                                                            </div>
                                                        </div>
                                                        <div className="text-xl font-black text-coral-600">
                                                            {game.status === 'IN_PROGRESS' ? 'Play →' : 'View →'}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Online Players */}
                        <div className="lg:col-span-1">
                            <div className="bg-white shadow-2xl rounded-3xl p-8 sticky top-6 border-8 border-cyan-300">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-black text-adventure-900">
                                        Online Players
                                    </h3>
                                    <span className="flex items-center gap-2 text-base font-black text-treasure-700 bg-treasure-100 px-4 py-2 rounded-full border-4 border-treasure-400">
                                        <span className="w-3 h-3 bg-treasure-500 rounded-full animate-pulse"></span>
                                        {onlineUsers.length}
                                    </span>
                                </div>

                                {loading ? (
                                    <div className="text-center py-8 text-adventure-700 font-bold text-xl">
                                        Loading...
                                    </div>
                                ) : onlineUsers.length === 0 ? (
                                    <div className="text-center py-12 bg-gradient-to-br from-cyan-100 to-adventure-100 rounded-2xl border-4 border-dashed border-cyan-300">
                                        <div className="text-5xl mb-3">👥</div>
                                        <p className="text-base font-bold text-adventure-700">
                                            No other adventurers online
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {onlineUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-adventure-50 transition-all border-4 border-transparent hover:border-cyan-300 hover:scale-105 transform"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center text-white font-black text-lg shadow-lg border-4 border-white">
                                                    {user.initials}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-base font-black text-adventure-900 truncate">
                                                        {user.display_name || user.name}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm text-treasure-700 font-bold">
                                                        <span className="w-2 h-2 bg-treasure-500 rounded-full"></span>
                                                        Online
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t-4 border-adventure-200">
                                    <Link
                                        href="/games/lobby"
                                        className="block w-full bg-gradient-to-br from-quest-500 to-quest-600 text-white text-center px-6 py-4 rounded-full hover:scale-105 transition transform font-black text-lg shadow-lg border-4 border-white"
                                    >
                                        Go to Game Room 🎲
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
