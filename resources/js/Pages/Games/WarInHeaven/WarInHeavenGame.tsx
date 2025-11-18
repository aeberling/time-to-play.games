import { Head } from '@inertiajs/react';
import { useWarInHeavenGame } from './hooks/useWarInHeavenGame';
// import { HexBoard } from './components/HexBoard';
// import { CardDisplay } from './components/CardDisplay';
// import { GameInfo } from './components/GameInfo';
// import { FactionPanel } from './components/FactionPanel';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps } from '@/types';

interface WarInHeavenProps extends PageProps {
    gameId: number;
}

/**
 * War in Heaven - Main Game Component
 *
 * Asymmetrical hex-based strategy game for 2 players
 */
export default function WarInHeavenGame({ auth, gameId }: WarInHeavenProps) {
    const {
        gameState,
        selectedHex,
        validMoves,
        selectedCard,
        isMyTurn,
        handleHexClick,
        handleCardPlay,
        handleEndTurn,
    } = useWarInHeavenGame(gameId);

    if (!gameState) {
        return (
            <AuthenticatedLayout>
                <Head title="War in Heaven" />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Loading game...</h2>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="War in Heaven" />

            <div className="war-in-heaven-container min-h-screen bg-gray-900 text-white p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Main Board Area */}
                        <div className="lg:col-span-3">
                            <div className="bg-gray-800 rounded-lg p-4 mb-4">
                                <h1 className="text-3xl font-bold mb-2">War in Heaven</h1>
                                <p className="text-gray-400">
                                    Turn {gameState.round} - {isMyTurn ? 'Your Turn' : "Opponent's Turn"}
                                </p>
                            </div>

                            {/* TODO: HexBoard Component */}
                            <div className="bg-gray-800 rounded-lg p-8">
                                <div className="text-center text-gray-400">
                                    <p className="text-xl mb-4">Hex Board Component</p>
                                    <p className="text-sm">
                                        Game State: {gameState.status}
                                    </p>
                                    <p className="text-sm">
                                        Phase: {gameState.turnPhase}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-4">
                            {/* TODO: GameInfo Component */}
                            <div className="bg-gray-800 rounded-lg p-4">
                                <h3 className="text-lg font-bold mb-2">Game Info</h3>
                                <div className="text-sm text-gray-400">
                                    <p>Round: {gameState.round}</p>
                                    <p>Phase: {gameState.turnPhase}</p>
                                </div>
                            </div>

                            {/* TODO: FactionPanel Component */}
                            <div className="bg-gray-800 rounded-lg p-4">
                                <h3 className="text-lg font-bold mb-2">Faction Panel</h3>
                                <div className="text-sm text-gray-400">
                                    <p>Your Faction: {gameState.players[0]?.faction}</p>
                                    <p>VP: {gameState.resources?.FACTION1?.victoryPoints || 0}</p>
                                </div>
                            </div>

                            {/* TODO: CardDisplay Component */}
                            <div className="bg-gray-800 rounded-lg p-4">
                                <h3 className="text-lg font-bold mb-2">Cards</h3>
                                <div className="text-sm text-gray-400">
                                    <p>Hand: {gameState.cards?.FACTION1?.hand?.length || 0} cards</p>
                                </div>
                            </div>

                            {/* End Turn Button */}
                            {isMyTurn && (
                                <button
                                    onClick={handleEndTurn}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                                >
                                    End Turn
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
