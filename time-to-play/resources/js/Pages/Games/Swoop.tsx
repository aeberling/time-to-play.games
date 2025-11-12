import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps, SwoopGameState, Card } from '@/types/index';
import { useGameStore } from '@/store';
import { useTheme } from '@/contexts/ThemeContext';
import GameCard from '@/Components/GameCard';

/**
 * Swoop Game Component
 *
 * Fast-paced card game where players race to get rid of all their cards
 * Features mystery cards, face-up cards, and hand cards
 * Special "swoop" mechanic when 4 equal cards or a 10 is played
 */

interface SwoopProps extends PageProps {
    gameId: number;
}

export default function Swoop({ auth, gameId }: SwoopProps) {
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

    const { theme } = useTheme();
    const [selectedCards, setSelectedCards] = useState<{source: 'hand' | 'faceup' | 'mystery', index: number}[]>([]);
    const [showSwoopAnimation, setShowSwoopAnimation] = useState(false);
    const [revealedMystery, setRevealedMystery] = useState<{index: number, card: Card} | null>(null);

    const swoopState = gameState as SwoopGameState | null;

    // Get point value for a card in Swoop
    const getCardPoints = (card: Card): number => {
        const cardPoints: { [key: string]: number } = {
            'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
            'J': 10, 'Q': 10, 'K': 10, '10': 50
        };
        return cardPoints[card.rank] || 0;
    };

    // Fetch game state and subscribe to updates on mount
    useEffect(() => {
        fetchGameState(gameId, auth.user.id);
        subscribeToGame(gameId);

        return () => {
            unsubscribeFromGame(gameId);
        };
    }, [gameId, auth.user.id]);

    // Watch for swoop events
    useEffect(() => {
        if (swoopState?.recentSwoop) {
            setShowSwoopAnimation(true);
            const timer = setTimeout(() => setShowSwoopAnimation(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [swoopState?.recentSwoop]);

    // Clear revealed mystery card when it's no longer in the mystery cards array
    useEffect(() => {
        if (revealedMystery !== null && swoopState && playerIndex !== null) {
            const myMysteryCards = swoopState.mysteryCards[playerIndex];
            // Check if the revealed mystery card still exists at that index
            if (!myMysteryCards[revealedMystery.index]) {
                // Card was removed (played or picked up), clear the revealed state
                setRevealedMystery(null);
            }
        }
    }, [swoopState?.mysteryCards, playerIndex, revealedMystery]);

    const handleToggleReady = async () => {
        try {
            await toggleReady(gameId);
        } catch (err) {
            console.error('Failed to toggle ready:', err);
        }
    };

    const handleLeaveGame = () => {
        router.visit('/games/lobby');
    };

    const handleCancelGame = async () => {
        if (!confirm('Are you sure you want to cancel this game? This action cannot be undone.')) {
            return;
        }

        try {
            await cancelGame(gameId);
            router.visit('/games/lobby');
        } catch (err) {
            console.error('Failed to cancel game:', err);
        }
    };

    const handleContinueToNextRound = async () => {
        try {
            const response = await fetch(`/api/games/${gameId}/continue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to continue to next round');
            }

            // State will be updated via WebSocket broadcast
        } catch (err) {
            console.error('Failed to continue to next round:', err);
            alert(err instanceof Error ? err.message : 'Failed to continue to next round');
        }
    };

    const handleCopyGameState = () => {
        if (!swoopState || playerIndex === null) {
            alert('Game state not available');
            return;
        }

        // Format card array for display
        const formatCards = (cards: Card[]) => {
            if (cards.length === 0) return 'None';
            return cards.map(c => `${c.rank}${c.suit.charAt(0).toUpperCase()}`).join(', ');
        };

        // Build game state text
        let stateText = '=== SWOOP GAME STATE ===\n\n';

        // Game info
        stateText += `Round: ${swoopState.round}\n`;
        stateText += `Phase: ${swoopState.phase}\n`;
        stateText += `Score Limit: ${swoopState.scoreLimit}\n`;
        stateText += `Scoring Method: ${swoopState.scoringMethod}\n\n`;

        // Current turn
        const currentPlayer = swoopState.players[swoopState.currentPlayerIndex];
        stateText += `Current Turn: ${currentPlayer.name} (Player ${swoopState.currentPlayerIndex + 1})\n\n`;

        // Play pile
        stateText += `Play Pile (${swoopState.playPile.length} cards):\n`;
        if (swoopState.playPile.length > 0) {
            const lastAction = swoopState.lastAction?.cardsPlayed || 1;
            const recentCards = swoopState.playPile.slice(-lastAction);
            const olderCards = swoopState.playPile.slice(0, -lastAction);

            stateText += `  Recent: ${formatCards(recentCards as Card[])}\n`;
            if (olderCards.length > 0) {
                stateText += `  Older: ${formatCards(olderCards as Card[])}\n`;
            }
        } else {
            stateText += '  Empty\n';
        }
        stateText += '\n';

        // All players
        stateText += '=== PLAYERS ===\n\n';
        swoopState.players.forEach((player, idx) => {
            const isMe = idx === playerIndex;
            const isActive = idx === swoopState.currentPlayerIndex;

            stateText += `Player ${idx + 1}: ${player.name}${isMe ? ' (ME)' : ''}${isActive ? ' [ACTIVE]' : ''}\n`;
            stateText += `  Score: ${swoopState.scores[idx]} pts\n`;
            stateText += `  Hand: ${swoopState.playerHands[idx].length} cards`;

            if (isMe) {
                const myHandCards = swoopState.playerHands[idx] as Card[];
                stateText += ` - ${formatCards(sortCards(myHandCards))}`;
            }
            stateText += '\n';

            stateText += `  Face-up: ${swoopState.faceUpCards[idx].length} cards`;
            if (isMe && swoopState.faceUpCards[idx].length > 0) {
                const myFaceUpCards = swoopState.faceUpCards[idx] as Card[];
                stateText += ` - ${formatCards(myFaceUpCards)}`;
            }
            stateText += '\n';

            stateText += `  Mystery: ${swoopState.mysteryCards[idx].length} cards\n`;
            stateText += '\n';
        });

        // Last action
        if (swoopState.lastAction) {
            stateText += '=== LAST ACTION ===\n';
            stateText += `Type: ${swoopState.lastAction.type}\n`;
            if (swoopState.lastAction.playerIndex !== null && swoopState.lastAction.playerIndex !== undefined) {
                stateText += `Player: ${swoopState.players[swoopState.lastAction.playerIndex].name}\n`;
            }
            if (swoopState.lastAction.cardsPlayed) {
                stateText += `Cards Played: ${swoopState.lastAction.cardsPlayed}\n`;
            }
            if (swoopState.lastAction.swoopTriggered) {
                stateText += `Swoop Triggered: Yes\n`;
            }
            stateText += '\n';
        }

        // Round results if available
        if (swoopState.roundResults) {
            stateText += '=== ROUND RESULTS ===\n\n';
            swoopState.roundResults.forEach((result: any) => {
                const player = swoopState.players[result.playerIndex];
                stateText += `${player.name}: +${result.pointsThisRound} pts (Total: ${result.totalScore})\n`;
                if (result.remainingCards.length > 0) {
                    const remainingCards = result.remainingCards as Card[];
                    stateText += `  Remaining: ${formatCards(remainingCards)}\n`;
                }
            });
        }

        // Copy to clipboard
        navigator.clipboard.writeText(stateText).then(() => {
            alert('Game state copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy to clipboard:', err);
            alert('Failed to copy to clipboard. See console for details.');
        });
    };

    const handleCardSelect = (source: 'hand' | 'faceup' | 'mystery', index: number) => {
        if (!swoopState || playerIndex === null) return;

        // Cannot deselect revealed mystery card
        if (source === 'mystery' && revealedMystery?.index === index) {
            return;
        }

        // If a mystery card is revealed, only allow selecting matching rank or wild cards
        if (revealedMystery !== null && source !== 'mystery') {
            const myHand = swoopState.playerHands[playerIndex];
            const myFaceUpCards = swoopState.faceUpCards[playerIndex];
            const card = source === 'hand' ? myHand[index] : myFaceUpCards[index];

            // Check if card matches revealed mystery card's rank or is wild
            const isWild = card.rank === '10' || card.value === 0; // 10s and Jokers
            const matchesRank = card.rank === revealedMystery.card.rank;

            if (!isWild && !matchesRank) {
                return; // Cannot select non-matching, non-wild cards
            }
        }

        const selectedIndex = selectedCards.findIndex(s => s.source === source && s.index === index);
        if (selectedIndex >= 0) {
            setSelectedCards(selectedCards.filter((_, i) => i !== selectedIndex));
        } else {
            setSelectedCards([...selectedCards, { source, index }]);
        }
    };

    const handleMysteryCardClick = (index: number) => {
        if (!swoopState || playerIndex === null || !isMyTurn) return;

        // Once a mystery card is revealed, cannot reveal another one
        if (revealedMystery !== null && revealedMystery.index !== index) {
            return;
        }

        const card = swoopState.mysteryCards[playerIndex][index];

        // Reveal the card and auto-select it
        setRevealedMystery({ index, card });
        setSelectedCards([{ source: 'mystery', index }]);
    };

    const handlePlayCards = async () => {
        if (!swoopState || selectedCards.length === 0 || playerIndex === null) return;

        try {
            const myHand = swoopState.playerHands[playerIndex];
            const myFaceUpCards = swoopState.faceUpCards[playerIndex];
            const myMysteryCards = swoopState.mysteryCards[playerIndex];

            // Collect cards from all sources
            const cards: Card[] = [];
            const handCards = selectedCards.filter(s => s.source === 'hand').map(s => myHand[s.index]);
            const faceUpCards = selectedCards.filter(s => s.source === 'faceup').map(s => myFaceUpCards[s.index]);
            const mysteryCards = selectedCards.filter(s => s.source === 'mystery').map(s => myMysteryCards[s.index]);

            cards.push(...handCards, ...faceUpCards, ...mysteryCards);

            console.log('Playing cards:', {
                handCards,
                faceUpCards,
                mysteryCards,
                allCards: cards,
                fromHand: handCards.length > 0,
                fromFaceUp: faceUpCards.length > 0,
                fromMystery: mysteryCards.length > 0,
            });

            console.log('Current play pile before move:', swoopState.playPile);

            await makeMove(gameId, {
                action: 'PLAY',
                cards,
                fromHand: handCards.length > 0,
                fromFaceUp: faceUpCards.length > 0,
                fromMystery: mysteryCards.length > 0,
            });

            console.log('Play pile after move:', gameState?.playPile);

            // Clear selections - the revealed mystery will be cleared when game state updates
            setSelectedCards([]);
            // Don't clear revealedMystery here - it will be cleared by the useEffect below
        } catch (err: any) {
            console.error('Failed to play cards:', err);
            console.error('Error response:', err.response?.data);
        }
    };

    // Get description of selected cards
    const getSelectedCardsDescription = () => {
        if (!swoopState || playerIndex === null || selectedCards.length === 0) return null;

        const myHand = swoopState.playerHands[playerIndex];
        const myFaceUpCards = swoopState.faceUpCards[playerIndex];
        const myMysteryCards = swoopState.mysteryCards[playerIndex];

        const cards: Card[] = [];
        selectedCards.forEach(s => {
            let card: Card | undefined;
            if (s.source === 'hand') {
                card = myHand[s.index];
            } else if (s.source === 'faceup') {
                card = myFaceUpCards[s.index];
            } else if (s.source === 'mystery') {
                card = myMysteryCards[s.index];
            }
            // Only add if card exists (index might be invalid after cards are played)
            if (card) {
                cards.push(card);
            }
        });

        // Group by rank
        const rankCounts: { [rank: string]: number } = {};
        cards.forEach(card => {
            if (card && card.rank) {
                rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
            }
        });

        // Build description
        const parts = Object.entries(rankCounts).map(([rank, count]) => {
            if (count === 1) return rank;
            return `${count} ${rank}s`;
        });

        return parts.join(' + ');
    };

    const handlePickup = async () => {
        try {
            await makeMove(gameId, { action: 'PICKUP' });
        } catch (err) {
            console.error('Failed to pickup:', err);
        }
    };

    // Sort cards by rank (lowest to highest), with 10s and Jokers at the end since they're wild
    const sortCards = (cards: Card[]) => {
        const rankOrder: { [key: string]: number } = {
            'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
            'J': 11, 'Q': 12, 'K': 13,
            '10': 100, // Wild cards go to the end
            'Joker': 101
        };

        return [...cards].sort((a, b) => {
            return rankOrder[a.rank] - rankOrder[b.rank];
        });
    };

    // Player colors for visual identification
    const playerColors = [
        'rgb(59, 130, 246)',  // blue
        'rgb(239, 68, 68)',   // red
        'rgb(34, 197, 94)',   // green
        'rgb(168, 85, 247)',  // purple
        'rgb(251, 146, 60)',  // orange
    ];

    const getPlayerColor = (pIndex: number) => {
        return playerColors[pIndex % playerColors.length];
    };

    const renderCard = (card: Card, onClick?: () => void, selected = false, faceDown = false, borderColor?: string) => {
        const isFaceDown = faceDown || (card as any).hidden;
        return (
            <div
                onClick={onClick}
                className={`transition-all ${
                    selected ? '-translate-y-2 shadow-lg' : ''
                } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
                style={borderColor && !selected ? { borderColor, borderWidth: '3px', borderRadius: '0.5rem' } : {}}
            >
                <GameCard
                    card={card}
                    faceDown={isFaceDown}
                    small={isFaceDown}
                />
            </div>
        );
    };

    if (!currentGame) {
        return (
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Swoop
                    </h2>
                }
            >
                <Head title="Swoop - Loading" />
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="bg-white p-6 shadow sm:rounded-lg text-center">
                            Loading game...
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const isWaiting = currentGame.status === 'WAITING' || currentGame.status === 'READY';
    const isMyTurn = swoopState ? swoopState.currentPlayerIndex === playerIndex : false;
    const isGameOver = swoopState ? swoopState.phase === 'GAME_OVER' : false;

    // Get player-specific data (only if game has started and has Swoop properties)
    const myHand = swoopState && swoopState.playerHands && playerIndex !== null ? swoopState.playerHands[playerIndex] : [];
    const myFaceUpCards = swoopState && swoopState.faceUpCards && playerIndex !== null ? swoopState.faceUpCards[playerIndex] : [];
    const myMysteryCards = swoopState && swoopState.mysteryCards && playerIndex !== null ? swoopState.mysteryCards[playerIndex] : [];

    // Check if current user is the game creator
    const isCreator = currentGame?.game_players?.find(p => p.player_index === 0)?.user_id === auth.user.id;
    const canCancelGame = isCreator && (currentGame?.status === 'WAITING' || currentGame?.status === 'READY');

    return (
        <AuthenticatedLayout>
            <Head title="Swoop" />

            <div className="py-2 min-h-screen">
                <div className="mx-auto max-w-full px-4">
                    {/* Action Buttons - Top Right Corner */}
                    <div className="flex justify-end gap-3 mb-2">
                        {canCancelGame && (
                            <button
                                onClick={handleCancelGame}
                                className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                            >
                                Cancel Game
                            </button>
                        )}
                        <button
                            onClick={handleCopyGameState}
                            className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                        >
                            Copy Game State
                        </button>
                        <button
                            onClick={handleLeaveGame}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                            Leave Game →
                        </button>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-4 rounded-md bg-red-50 p-4">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Waiting Room */}
                    {isWaiting && (
                        <div className="bg-white p-6 shadow sm:rounded-lg mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Waiting for Players
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Players: {currentGame.game_players.length}/{currentGame.max_players}
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        {currentGame.game_players.map((player) => {
                                            // Use local isReady state for current user, server state for others
                                            const playerIsReady = player.user_id === auth.user.id ? isReady : player.is_ready;

                                            return (
                                                <div
                                                    key={player.id}
                                                    className={`px-3 py-2 rounded ${
                                                        playerIsReady
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {player.user.display_name || player.user.name}
                                                    {playerIsReady && ' ✓'}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <button
                                    onClick={handleToggleReady}
                                    className={`px-4 py-2 rounded font-medium ${
                                        isReady
                                            ? 'bg-gray-200 text-gray-800'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                >
                                    {isReady ? 'Not Ready' : 'Ready'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Game Board - Two Column Layout */}
                    {!isWaiting && swoopState && (
                        <div className="flex gap-4">
                            {/* Left Column: Play Area (75%) */}
                            <div className="w-3/4">
                                <div className="game-bg p-4 shadow sm:rounded-lg relative">
                                {isGameOver ? (
                                <div className="py-8">
                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Game Complete!</h2>
                                        <p className="text-gray-600">Final Results</p>
                                    </div>

                                    {/* Winner and Rankings */}
                                    <div className="max-w-2xl mx-auto space-y-3">
                                        {swoopState.players
                                            .map((player, idx) => ({
                                                player,
                                                idx,
                                                score: swoopState.scores[idx]
                                            }))
                                            .sort((a, b) => a.score - b.score) // Lower score wins in Swoop
                                            .map((item, rank) => {
                                                const isWinner = rank === 0;
                                                return (
                                                    <div
                                                        key={item.idx}
                                                        className={`p-6 rounded-lg flex items-center justify-between transition-all ${
                                                            isWinner
                                                                ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400 shadow-lg scale-105'
                                                                : 'bg-white border-2 border-gray-200'
                                                        }`}
                                                        style={{ borderLeft: `6px solid ${getPlayerColor(item.idx)}` }}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`text-2xl font-bold ${
                                                                isWinner ? 'text-yellow-600' : 'text-gray-400'
                                                            }`}>
                                                                #{rank + 1}
                                                            </div>
                                                            <div>
                                                                <div className={`font-bold flex items-center gap-2 ${
                                                                    isWinner ? 'text-2xl text-gray-900' : 'text-xl text-gray-700'
                                                                }`}>
                                                                    {item.player.name}
                                                                    {isWinner && <span className="text-3xl">👑</span>}
                                                                </div>
                                                                {item.idx === playerIndex && (
                                                                    <div className="text-sm text-blue-600 font-medium">You</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className={`font-bold ${
                                                            isWinner ? 'text-3xl text-yellow-700' : 'text-2xl text-gray-700'
                                                        }`}>
                                                            {item.score} pts
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>

                                    {/* Return to Lobby Button */}
                                    <div className="text-center mt-8">
                                        <button
                                            onClick={handleLeaveGame}
                                            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium text-lg hover:bg-blue-700 shadow-lg"
                                        >
                                            Return to Lobby
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                            {/* Turn Indicator */}
                            {isMyTurn && swoopState.phase === 'PLAYING' && (
                                <div className="mb-4 p-3 game-bg-secondary rounded-lg">
                                    <div className="text-center text-base font-semibold text-blue-600 animate-pulse">
                                        Your Turn
                                    </div>
                                    {selectedCards.length > 0 && (
                                        <div className="text-center text-sm text-gray-700 mt-2">
                                            Selected: <span className="font-bold">{getSelectedCardsDescription()}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Round Over Summary */}
                            {swoopState.phase === 'ROUND_OVER' && swoopState.roundResults && (
                                <div className="mb-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                                    <h3 className="text-xl font-bold text-center text-gray-900 mb-4">
                                        Round {swoopState.round} Complete!
                                    </h3>

                                    <div className="mb-6 space-y-3">
                                        {swoopState.roundResults.map((result: any) => {
                                            const player = swoopState.players[result.playerIndex];
                                            const isWinner = result.remainingCards.length === 0;

                                            return (
                                                <div
                                                    key={result.playerIndex}
                                                    className={`p-4 rounded-lg ${
                                                        isWinner ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'
                                                    } border-2`}
                                                >
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="font-semibold text-gray-900">
                                                            {player?.name || `Player ${result.playerIndex + 1}`}
                                                            {isWinner && <span className="ml-2 text-green-600">🏆 Winner!</span>}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold">+{result.pointsThisRound} pts</div>
                                                            <div className="text-sm text-gray-600">Total: {result.totalScore}</div>
                                                        </div>
                                                    </div>

                                                    {result.remainingCards.length > 0 && (
                                                        <div className="mt-2 pt-2 border-t border-gray-300">
                                                            <div className="text-xs text-gray-600 mb-1">Remaining cards:</div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {result.remainingCards.map((card: any, idx: number) => {
                                                                    const points = getCardPoints(card);
                                                                    return (
                                                                        <div key={idx} className="relative inline-block scale-50 origin-top-left">
                                                                            {renderCard(card)}
                                                                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white">
                                                                                +{points}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="text-center">
                                        <button
                                            onClick={handleContinueToNextRound}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                        >
                                            Continue to Next Round
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Play Pile */}
                            <div className="mb-8">
                                <div className="text-center mb-2 text-sm text-gray-600 font-medium">
                                    Play Pile ({swoopState.playPile.length} cards)
                                </div>
                                <div className="bg-gray-100 rounded-lg p-4">
                                    {swoopState.playPile.length > 0 ? (
                                        <div className="space-y-3">
                                            {/* Most Recent Play (highlighted) */}
                                            <div className="flex justify-center items-center">
                                                <div className="flex gap-2">
                                                    {(() => {
                                                        // Get the number of cards played in the last action
                                                        // Default to 1 if not available (most recent card only)
                                                        const cardsInLastPlay = swoopState.lastAction?.cardsPlayed || 1;
                                                        const recentCards = swoopState.playPile.slice(-cardsInLastPlay);
                                                        return recentCards.map((card, idx) => (
                                                            <div key={idx}>
                                                                {renderCard(card)}
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>
                                            </div>

                                            {/* Previous cards (all cards except the most recent play) */}
                                            {(() => {
                                                // Get the number of cards played in the last action
                                                // Default to 1 if not available (most recent card only)
                                                const cardsInLastPlay = swoopState.lastAction?.cardsPlayed || 1;
                                                const previousCards = swoopState.playPile.slice(0, -cardsInLastPlay);
                                                if (previousCards.length === 0) return null;

                                                return (
                                                    <div className="flex justify-center items-center pt-2 border-t border-gray-300">
                                                        <div className="flex gap-1 opacity-60 scale-75">
                                                            {previousCards.map((card, idx) => (
                                                                <div key={idx}>
                                                                    {renderCard(card)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 text-sm text-center py-4">Empty</div>
                                    )}
                                </div>
                            </div>

                            {/* Player's Cards */}
                            <div className="space-y-6">
                                {/* Mystery Cards with Face-Up Cards Stacked On Top */}
                                {(myMysteryCards.length > 0 || myFaceUpCards.length > 0) && (
                                    <div>
                                        <div className="text-sm text-gray-600 font-medium mb-2">
                                            Table Cards
                                            {myFaceUpCards.length > 0 && (
                                                <span className="text-xs ml-2">(Face-up cards must be played first)</span>
                                            )}
                                        </div>
                                        <div className="flex gap-6 justify-center">
                                            {/* Show each position with mystery card at bottom and face-up on top if present */}
                                            {Array.from({ length: Math.max(myMysteryCards.length, myFaceUpCards.length) }).map((_, idx) => (
                                                <div key={idx} className="relative" style={{ paddingBottom: myFaceUpCards[idx] ? '15px' : '0' }}>
                                                    {/* Mystery card (bottom) */}
                                                    {myMysteryCards[idx] && (
                                                        <div className="relative">
                                                            {revealedMystery?.index === idx ? (
                                                                // Show revealed card
                                                                renderCard(
                                                                    revealedMystery.card,
                                                                    undefined, // Cannot click again
                                                                    true, // Always shown as selected
                                                                    false,
                                                                    theme.colors.active // Special border color
                                                                )
                                                            ) : (
                                                                // Show face-down card with click handler
                                                                // Only clickable if no face-up card is on top of it
                                                                renderCard(
                                                                    myMysteryCards[idx],
                                                                    isMyTurn && !myFaceUpCards[idx] ? () => handleMysteryCardClick(idx) : undefined,
                                                                    false,
                                                                    true
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                    {/* Face-up card (on top) - positioned absolutely over mystery card with slight offset */}
                                                    {myFaceUpCards[idx] && (() => {
                                                        const isPlayable = !revealedMystery || myFaceUpCards[idx].rank === revealedMystery.card.rank;
                                                        const isSelected = selectedCards.some(s => s.source === 'faceup' && s.index === idx);

                                                        return (
                                                            <div className={`absolute top-0 left-0 transform -translate-y-3 translate-x-1 shadow-lg ${!isPlayable ? 'opacity-40' : ''}`}>
                                                                {renderCard(
                                                                    myFaceUpCards[idx],
                                                                    isMyTurn && isPlayable ? () => handleCardSelect('faceup', idx) : undefined,
                                                                    isSelected,
                                                                    false,
                                                                    isPlayable && !isSelected && revealedMystery ? theme.colors.success : undefined
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Hand */}
                                {myHand.length > 0 && (
                                    <div>
                                        <div className="text-sm text-gray-600 font-medium mb-2">
                                            Your Hand
                                            {revealedMystery && (
                                                <span className="text-xs ml-2 text-blue-600">
                                                    (Select matching {revealedMystery.card.rank}s to play together)
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2 justify-center flex-wrap">
                                            {(() => {
                                                const sortedHand = sortCards(myHand);
                                                const usedIndices = new Set<number>();

                                                return sortedHand.map((card, idx) => {
                                                    // Find the original index of this card in the unsorted hand
                                                    // Skip indices that have already been used for previous duplicate cards
                                                    const originalIdx = myHand.findIndex((c, i) =>
                                                        c.suit === card.suit &&
                                                        c.rank === card.rank &&
                                                        !usedIndices.has(i)
                                                    );

                                                    // Mark this index as used
                                                    if (originalIdx !== -1) {
                                                        usedIndices.add(originalIdx);
                                                    }

                                                    // If a mystery card is revealed, only allow matching rank cards
                                                    const isPlayable = !revealedMystery || card.rank === revealedMystery.card.rank;
                                                    const isSelected = selectedCards.some(s => s.source === 'hand' && s.index === originalIdx);

                                                    return (
                                                        <div key={idx} className={!isPlayable ? 'opacity-40' : ''}>
                                                            {renderCard(
                                                                card,
                                                                isMyTurn && isPlayable ? () => handleCardSelect('hand', originalIdx) : undefined,
                                                                isSelected,
                                                                false,
                                                                isPlayable && !isSelected && revealedMystery ? theme.colors.success : undefined
                                                            )}
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {isMyTurn && (
                                <div className="mt-6 text-center space-x-3">
                                    <button
                                        onClick={handlePlayCards}
                                        disabled={selectedCards.length === 0 || loading}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Playing...' : 'Play Selected Cards'}
                                    </button>
                                    {swoopState.playPile.length > 0 && (
                                        <button
                                            onClick={handlePickup}
                                            disabled={loading}
                                            className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50"
                                        >
                                            Pick Up Pile
                                        </button>
                                    )}
                                </div>
                            )}
                                </>
                            )}
                                </div>
                            </div>

                            {/* Right Column: Game Info & Players (25%) */}
                            <div className="w-1/4">
                                <div className="game-bg p-4 shadow sm:rounded-lg space-y-4">
                                    {/* Game Status */}
                                    <div className="space-y-2">
                                        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Game Info</div>
                                        <div className="text-sm">
                                            <div className="font-medium">Round {swoopState.round}</div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                Score Limit: {swoopState.scoreLimit || 300}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                Scoring: {swoopState.scoringMethod === 'normal' ? 'Normal' : 'Beginner'}
                                            </div>
                                        </div>

                                        {/* Game Over Status */}
                                        {isGameOver && (
                                            <div className="pt-2 border-t">
                                                <div className="text-base font-bold text-green-600">
                                                    Game Over!
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Player Stats */}
                                    <div className="space-y-2">
                                        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Players</div>
                                        {swoopState.players.map((player, idx) => {
                                            const isActivePlayer = idx === swoopState.currentPlayerIndex && !isGameOver;

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`p-3 rounded ${
                                                        idx === playerIndex
                                                            ? 'bg-blue-50'
                                                            : 'bg-gray-50'
                                                    }`}
                                                    style={{ borderLeft: `4px solid ${getPlayerColor(idx)}` }}
                                                >
                                                    <div className="font-medium text-sm mb-1 flex items-center justify-between">
                                                        <span>
                                                            {player.name}
                                                        </span>
                                                        {isActivePlayer && (
                                                            <span className="text-lg animate-pulse">🤔</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-600 space-y-0.5">
                                                        <div>Hand: {swoopState.playerHands[idx].length}</div>
                                                        <div>Face-up: {swoopState.faceUpCards[idx].length}</div>
                                                        <div>Mystery: {swoopState.mysteryCards[idx].length}</div>
                                                        <div className="font-semibold">Score: {swoopState.scores[idx]}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
