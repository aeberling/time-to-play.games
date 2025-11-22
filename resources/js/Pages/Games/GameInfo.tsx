import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useGameStore } from '@/store/gameStore';
import type { GameType, GameTypeInfo } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface GameInfoProps {
    gameType: GameType;
    title: string;
    description: string;
    minPlayers: number;
    maxPlayers: number;
    difficulty?: string;
    estimatedTime?: string;
    tags?: string[];
    howToPlay?: string;
    renderGameOptions?: (
        maxPlayers: number,
        gameOptions: any,
        setGameOptions: (options: any) => void
    ) => React.ReactNode;
}

export default function GameInfo({
    gameType,
    title,
    description,
    minPlayers,
    maxPlayers: maxPlayersLimit,
    difficulty = 'Medium',
    estimatedTime = '15-30 min',
    tags = [],
    howToPlay = '',
    renderGameOptions,
}: GameInfoProps) {
    const [maxPlayers, setMaxPlayers] = useState(minPlayers);
    const [gameOptions, setGameOptions] = useState<any>({});
    const [error, setError] = useState<string | null>(null);
    const gameStore = useGameStore();

    const handleCreateGame = async () => {
        try {
            const response = await window.axios.post('/api/games', {
                game_type: gameType,
                max_players: maxPlayers,
                game_options: Object.keys(gameOptions).length > 0 ? gameOptions : undefined,
            });

            const game = response.data.game;
            gameStore.setCurrentGame(game);
            router.visit(`/games/${game.id}`);
        } catch (err: any) {
            console.error('Failed to create game:', err);
            setError(err.response?.data?.message || 'Failed to create game');
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Back to Game Room Button */}
                    <button
                        onClick={() => router.visit('/games/lobby')}
                        className="mb-6 text-white/70 hover:text-white flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Game Room
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Game Header - Always First */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/20">
                                <h1 className="text-5xl font-bold text-white mb-4">{title}</h1>

                                {/* Tags */}
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1 bg-blue-500/30 text-blue-200 rounded-full text-sm font-medium"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Game Stats */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-white/5 rounded-lg p-4 text-center">
                                        <div className="text-white/60 text-sm mb-1">Players</div>
                                        <div className="text-white text-lg font-bold">
                                            {minPlayers} - {maxPlayersLimit}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-4 text-center">
                                        <div className="text-white/60 text-sm mb-1">Duration</div>
                                        <div className="text-white text-lg font-bold">{estimatedTime}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-4 text-center">
                                        <div className="text-white/60 text-sm mb-1">Complexity</div>
                                        <div className="text-white text-lg font-bold">{difficulty}</div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="text-white/80 text-lg leading-relaxed">
                                    {description}
                                </div>
                            </div>
                        </div>

                        {/* Create Game - Second on Mobile, Right Column on Desktop */}
                        <div className="lg:col-span-1 lg:row-start-1 lg:col-start-3">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20 lg:sticky lg:top-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Create New Game</h2>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Max Players */}
                                <div className="mb-6">
                                    <label className="block text-white mb-3 font-medium">
                                        Max Players: {maxPlayers}
                                    </label>
                                    <input
                                        type="range"
                                        min={minPlayers}
                                        max={maxPlayersLimit}
                                        value={maxPlayers}
                                        onChange={(e) => setMaxPlayers(Number(e.target.value))}
                                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                    <div className="flex justify-between text-white/60 text-sm mt-1">
                                        <span>{minPlayers}</span>
                                        <span>{maxPlayersLimit}</span>
                                    </div>
                                </div>

                                {/* Game-Specific Options */}
                                {renderGameOptions && renderGameOptions(maxPlayers, gameOptions, setGameOptions)}

                                {/* Create Game Button */}
                                <button
                                    onClick={handleCreateGame}
                                    disabled={gameStore.loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    {gameStore.loading ? 'Creating...' : 'Create Game'}
                                </button>

                                <div className="mt-4 text-center text-white/60 text-sm">
                                    You'll be taken to the game room after creation
                                </div>
                            </div>
                        </div>

                        {/* How to Play - Third on Mobile, Below Header on Desktop */}
                        {howToPlay && (
                            <div className="lg:col-span-2">
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/20">
                                    <h2 className="text-3xl font-bold text-white mb-4">How to Play</h2>
                                    <div className="text-white/80 leading-relaxed whitespace-pre-line">
                                        {howToPlay}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
