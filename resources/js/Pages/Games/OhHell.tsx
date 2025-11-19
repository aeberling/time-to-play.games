import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, OhHellGameState, Card } from '@/types';
import { useGameStore } from '@/store';
import GameCard from '@/Components/GameCard';

/**
 * Oh Hell! Game Component
 *
 * Strategic trick-taking game where players bid on how many tricks they'll win
 * Features dealer restriction ensuring game balance
 * Progresses through 19 rounds with changing hand sizes
 */

interface OhHellProps extends PageProps {
    gameId: number;
}

export default function OhHell({ auth, gameId }: OhHellProps) {
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

    const [selectedCard, setSelectedCard] = useState<number | null>(null);
    const [bidAmount, setBidAmount] = useState<number>(0);
    const [showTrickWinner, setShowTrickWinner] = useState<{ winner: number; cards: any[] } | null>(null);
    const [lastShownTrickCount, setLastShownTrickCount] = useState<number>(0);

    const ohHellState = gameState as OhHellGameState | null;

    // Fetch game state and subscribe to updates on mount
    useEffect(() => {
        fetchGameState(gameId, auth.user.id);
        subscribeToGame(gameId);

        return () => {
            unsubscribeFromGame(gameId);
        };
    }, [gameId, auth.user.id]);

    // Watch for trick completion and show winner
    useEffect(() => {
        if (!ohHellState || ohHellState.phase !== 'PLAYING') {
            setShowTrickWinner(null);
            setLastShownTrickCount(0);
            return;
        }

        // Check if a new trick was just completed
        const completedCount = ohHellState.completedTricks.length;
        if (completedCount > lastShownTrickCount && ohHellState.currentTrick.cards.length === 0) {
            const lastTrick = ohHellState.completedTricks[completedCount - 1];

            setShowTrickWinner({
                winner: lastTrick.winner,
                cards: lastTrick.cards,
            });
            setLastShownTrickCount(completedCount);
        }
    }, [ohHellState?.completedTricks?.length, ohHellState?.currentTrick?.cards?.length, lastShownTrickCount]);

    // Separate effect to auto-clear the trick winner after 2 seconds
    useEffect(() => {
        if (!showTrickWinner) return;

        const timer = setTimeout(() => {
            setShowTrickWinner(null);
        }, 2000);

        return () => clearTimeout(timer);
    }, [showTrickWinner]);

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

    const handleBid = async () => {
        try {
            await makeMove(gameId, {
                action: 'BID',
                bid: bidAmount,
            });
        } catch (err: any) {
            console.error('Failed to make bid:', err);
        }
    };

    const handlePlayCard = async (cardIndex: number) => {
        if (!ohHellState || playerIndex === null) return;

        try {
            const myHand = ohHellState.playerHands[playerIndex];
            const card = myHand[cardIndex];

            await makeMove(gameId, {
                action: 'PLAY_CARD',
                card,
            });

            setSelectedCard(null);
        } catch (err: any) {
            console.error('Failed to play card:', err);
        }
    };

    const handleContinueRound = async () => {
        try {
            await makeMove(gameId, {
                action: 'CONTINUE_ROUND',
            });
        } catch (err: any) {
            console.error('Failed to continue to next round:', err);
        }
    };

    // Sort and organize cards by suit
    const sortCards = (cards: Card[]) => {
        // Alternating red and black: Hearts (red), Clubs (black), Diamonds (red), Spades (black)
        const suitOrder = { 'hearts': 0, 'clubs': 1, 'diamonds': 2, 'spades': 3 };
        const rankOrder = { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 };

        return [...cards].sort((a, b) => {
            const suitDiff = suitOrder[a.suit as keyof typeof suitOrder] - suitOrder[b.suit as keyof typeof suitOrder];
            if (suitDiff !== 0) return suitDiff;
            return rankOrder[a.rank as keyof typeof rankOrder] - rankOrder[b.rank as keyof typeof rankOrder];
        });
    };

    // Check if a card can be legally played
    const isCardPlayable = (card: Card): boolean => {
        if (!ohHellState || !isMyTurnToPlay || !myHand) return false;

        const leadSuit = ohHellState.currentTrick.leadSuit;

        // If this is the first card of the trick (no lead suit yet)
        if (!leadSuit) {
            // Check trump breaking rule
            if (ohHellState.trumpSuit && card.suit === ohHellState.trumpSuit && !ohHellState.trumpBroken) {
                // Can only lead trump if you have no other cards
                const hasNonTrump = myHand.some(c => c.suit !== ohHellState.trumpSuit);
                return !hasNonTrump;
            }
            return true; // Can lead any non-trump card, or trump if no choice
        }

        // If there's a lead suit, must follow if possible
        const hasLeadSuit = myHand.some(c => c.suit === leadSuit);
        if (hasLeadSuit) {
            return card.suit === leadSuit;
        }

        // If can't follow suit, can play any card
        return true;
    };

    // Player colors
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

    const renderCard = (card: Card, onClick?: () => void, selected = false, faceDown = false, small = false, borderColor?: string, isPlayable = false) => {
        return (
            <GameCard
                card={card}
                onClick={onClick}
                selected={selected}
                faceDown={faceDown}
                small={small}
                borderColor={borderColor}
                isPlayable={isPlayable}
            />
        );
    };

    const getSuitSymbol = (suit: string) => {
        switch (suit) {
            case 'hearts': return '♥';
            case 'diamonds': return '♦';
            case 'clubs': return '♣';
            case 'spades': return '♠';
            default: return '';
        }
    };

    if (!currentGame) {
        return (
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {currentGame?.name || 'Oh Hell!'}
                    </h2>
                }
            >
                <Head title="Oh Hell! - Loading" />
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
    const isGameOver = ohHellState ? ohHellState.phase === 'GAME_OVER' : false;
    const isMyTurnToBid = ohHellState ? ohHellState.currentBidder === playerIndex : false;
    const isMyTurnToPlay = ohHellState && ohHellState.phase === 'PLAYING'
        ? ohHellState.currentTrick.currentPlayer === playerIndex
        : false;

    // Get player-specific data (only if game has started and has Oh Hell properties)
    const myHand = ohHellState && ohHellState.playerHands && playerIndex !== null ? ohHellState.playerHands[playerIndex] : [];
    const myBid = ohHellState && ohHellState.bids && playerIndex !== null ? ohHellState.bids[playerIndex] : null;
    const myTricksWon = ohHellState && ohHellState.tricksWon && playerIndex !== null ? ohHellState.tricksWon[playerIndex] : 0;
    const myScore = ohHellState && ohHellState.scores && playerIndex !== null ? ohHellState.scores[playerIndex] : 0;

    // Calculate dealer restriction
    const forbiddenBid = ohHellState && playerIndex === ohHellState.dealerIndex && isMyTurnToBid
        ? (() => {
            const totalBids = ohHellState.bids.reduce((sum, bid) => sum + (bid ?? 0), 0);
            const forbidden = ohHellState.cardsThisRound - totalBids;
            return forbidden >= 0 && forbidden <= ohHellState.cardsThisRound ? forbidden : null;
        })()
        : null;

    // Check if current user is the game creator
    const isCreator = currentGame?.game_players?.find(p => p.player_index === 0)?.user_id === auth.user.id;
    const canCancelGame = isCreator && (currentGame?.status === 'WAITING' || currentGame?.status === 'READY');

    return (
        <AuthenticatedLayout>
            <Head title="Oh Hell!" />

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
                    {!isWaiting && ohHellState && (
                        <div className="flex gap-4">
                            {/* Left Column: Play Area (75%) */}
                            <div className="w-3/4">
                                <div className="game-bg p-4 shadow sm:rounded-lg">

                            {/* Game Complete Screen */}
                            {isGameOver ? (
                                <div className="py-8">
                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Game Complete!</h2>
                                        <p className="text-gray-600">Final Results</p>
                                    </div>

                                    {/* Winner and Rankings */}
                                    <div className="max-w-2xl mx-auto space-y-3">
                                        {ohHellState.players
                                            .map((player, idx) => ({
                                                player,
                                                idx,
                                                score: ohHellState.scores[idx]
                                            }))
                                            .sort((a, b) => b.score - a.score)
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
                            {/* Bidding Phase */}
                            {ohHellState.phase === 'BIDDING' && isMyTurnToBid && (
                                <div className="mb-6 p-4 game-bg-secondary rounded-lg">
                                    <div className="text-center mb-4">
                                        <div className="text-base font-semibold text-blue-600 mb-2 animate-pulse">
                                            Your Turn to Bid
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Make Your Bid</h4>
                                        {forbiddenBid !== null && (
                                            <p className="text-sm text-red-600 mb-2">
                                                As dealer, you cannot bid {forbiddenBid}
                                            </p>
                                        )}
                                        <div className="flex justify-center gap-2 flex-wrap">
                                            {Array.from({ length: ohHellState.cardsThisRound + 1 }, (_, i) => i).map((bid) => (
                                                <button
                                                    key={bid}
                                                    onClick={() => setBidAmount(bid)}
                                                    disabled={bid === forbiddenBid}
                                                    className={`px-4 py-2 rounded font-medium transition-colors ${
                                                        bidAmount === bid
                                                            ? 'bg-blue-600 text-white'
                                                            : bid === forbiddenBid
                                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                            : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                                                    }`}
                                                >
                                                    {bid}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <button
                                            onClick={handleBid}
                                            disabled={loading}
                                            className="px-6 py-2 game-btn-success text-white rounded-lg font-medium disabled:opacity-50"
                                        >
                                            {loading ? 'Bidding...' : `Bid ${bidAmount}`}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Current Trick */}
                            {ohHellState.phase === 'PLAYING' && (
                                <div className="mb-6">
                                    <div className="text-center mb-2 text-sm game-text-secondary font-medium">
                                        Current Trick
                                        {(showTrickWinner ? showTrickWinner.cards[0] : ohHellState.currentTrick).leadSuit && (
                                            <span> (Lead: <span className={
                                                (showTrickWinner ? showTrickWinner.cards[0] : ohHellState.currentTrick).leadSuit === 'hearts' ||
                                                (showTrickWinner ? showTrickWinner.cards[0] : ohHellState.currentTrick).leadSuit === 'diamonds'
                                                    ? 'text-red-600'
                                                    : 'text-gray-900'
                                            }>{getSuitSymbol((showTrickWinner ? showTrickWinner.cards[0] : ohHellState.currentTrick).leadSuit)}</span>)</span>
                                        )}
                                    </div>
                                    <div className="relative flex justify-center items-center gap-4 min-h-[120px] game-bg-secondary rounded-lg p-4">
                                        {/* Show current trick cards (whether ongoing or completed trick) */}
                                        {showTrickWinner ? (
                                            showTrickWinner.cards.map((cardPlay: any, idx: number) => (
                                                <div key={idx} className="flex flex-col items-center gap-2">
                                                    <div className="text-xs text-gray-600">
                                                        P{cardPlay.playerIndex + 1}
                                                    </div>
                                                    {renderCard(cardPlay.card, undefined, false, false, false, getPlayerColor(cardPlay.playerIndex))}
                                                </div>
                                            ))
                                        ) : ohHellState.currentTrick.cards.length > 0 ? (
                                            ohHellState.currentTrick.cards.map((cardPlay, idx) => (
                                                <div key={idx} className="flex flex-col items-center gap-2">
                                                    <div className="text-xs text-gray-600">
                                                        P{cardPlay.playerIndex + 1}
                                                    </div>
                                                    {renderCard(cardPlay.card, undefined, false, false, false, getPlayerColor(cardPlay.playerIndex))}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-400 text-sm">Waiting for first card</div>
                                        )}

                                        {/* Trick winner notification (positioned below cards) */}
                                        {showTrickWinner && (
                                            <div className="absolute inset-x-0 -bottom-8 text-center">
                                                <div className="inline-block px-4 py-2 rounded-full font-medium text-sm animate-bounce"
                                                     style={{
                                                         backgroundColor: `${getPlayerColor(showTrickWinner.winner)}20`,
                                                         color: getPlayerColor(showTrickWinner.winner)
                                                     }}>
                                                    🎉 {ohHellState.players[showTrickWinner.winner].name} wins the trick!
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Player's Hand */}
                            {myHand.length > 0 && (
                                <div className="mb-6">
                                    <div className="text-center mb-3">
                                        <div className="mb-1">
                                            <span className="text-sm text-gray-600 font-medium">
                                                Your Hand
                                            </span>
                                            {myBid !== null && (
                                                <span className="ml-4 text-sm">
                                                    Bid: <span className="font-semibold">{myBid}</span> |
                                                    Won: <span className="font-semibold">{myTricksWon}</span>
                                                </span>
                                            )}
                                        </div>
                                        {ohHellState.phase === 'PLAYING' && isMyTurnToPlay && (
                                            <div className="text-base font-semibold text-blue-600 animate-pulse">
                                                Your Turn to Play
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 justify-center flex-wrap">
                                        {sortCards(myHand).map((card, idx) => {
                                            // Find the original index of this card in the unsorted hand
                                            const originalIdx = myHand.findIndex(c =>
                                                c.suit === card.suit && c.rank === card.rank
                                            );
                                            const playable = isCardPlayable(card);
                                            return (
                                                <div key={idx}>
                                                    {renderCard(
                                                        card,
                                                        isMyTurnToPlay ? () => handlePlayCard(originalIdx) : undefined,
                                                        false,
                                                        false,
                                                        false,
                                                        undefined,
                                                        playable
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Round Over Summary */}
                            {ohHellState.phase === 'ROUND_OVER' && (
                                <div className="mb-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                                    <h3 className="text-xl font-bold text-center text-gray-900 mb-4">
                                        Round {ohHellState.currentRound} Complete!
                                    </h3>

                                    {/* Round Results */}
                                    <div className="mb-6 space-y-3">
                                        {ohHellState.players.map((player, idx) => {
                                            const made = ohHellState.bids[idx] === ohHellState.tricksWon[idx];
                                            const isReady = ohHellState.playersReadyToContinue?.[idx] ?? false;
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`p-3 rounded ${
                                                        made ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                                                    } border-2`}
                                                    style={{ borderColor: getPlayerColor(idx), borderWidth: '3px' }}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold">{player.name}</span>
                                                            {isReady && (
                                                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded">
                                                                    Ready
                                                                </span>
                                                            )}
                                                            <span className="text-sm text-gray-600">
                                                                Bid: {ohHellState.bids[idx]}, Won: {ohHellState.tricksWon[idx]}
                                                            </span>
                                                        </div>
                                                        <div className={`text-lg font-bold ${made ? 'text-green-700' : 'text-red-700'}`}>
                                                            {made ? '😄🙌 ✓' : '🤜🤛 ✗'} +{ohHellState.roundScores[idx]} pts
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Ready Status */}
                                    <div className="mb-4 text-center text-sm text-gray-600">
                                        {(ohHellState.playersReadyToContinue || []).filter(Boolean).length} / {ohHellState.playerCount} players ready
                                    </div>

                                    {/* Continue Button */}
                                    <div className="text-center">
                                        {playerIndex !== null && ohHellState.playersReadyToContinue?.[playerIndex] ? (
                                            <div className="px-8 py-3 bg-gray-200 text-gray-600 rounded-lg font-medium text-lg">
                                                Waiting for other players...
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleContinueRound}
                                                disabled={loading}
                                                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                            >
                                                {loading ? 'Continuing...' : 'Ready to Continue'}
                                            </button>
                                        )}
                                    </div>
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
                                            <div className="font-medium">Round {ohHellState.currentRound}/{ohHellState.totalRounds}</div>
                                            <div className="text-gray-600">Cards: {ohHellState.cardsThisRound}</div>
                                        </div>

                                        {/* Trump */}
                                        {ohHellState.trumpSuit && (
                                            <div className="pt-2 border-t">
                                                <div className="text-sm flex items-center gap-2">
                                                    <span className="font-bold">Trump</span>
                                                    <span className={`text-2xl ${
                                                        ohHellState.trumpSuit === 'hearts' || ohHellState.trumpSuit === 'diamonds'
                                                            ? 'text-red-600'
                                                            : 'text-gray-900'
                                                    }`}>
                                                        {getSuitSymbol(ohHellState.trumpSuit)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

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
                                        {ohHellState.players.map((player, idx) => {
                                            const isThinking = (ohHellState.phase === 'BIDDING' && ohHellState.currentBidder === idx) ||
                                                             (ohHellState.phase === 'PLAYING' && ohHellState.currentTrick.currentPlayer === idx);

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
                                                            {idx === ohHellState.dealerIndex && ' 🫳'}
                                                        </span>
                                                        {isThinking && (
                                                            <span className="text-lg animate-pulse">🤔</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-600 space-y-0.5">
                                                        <div>Bid: {ohHellState.bids[idx] ?? '-'}</div>
                                                        <div>Won: {ohHellState.tricksWon[idx]}</div>
                                                        <div className="font-semibold">Score: {ohHellState.scores[idx]}</div>
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
