import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/store';
import type { HexCoordinate } from '../types/HexTypes';
import type { WarInHeavenGameState } from '@/types';

/**
 * Main hook for War in Heaven game logic
 *
 * Handles:
 * - Backend state management via useGameStore
 * - UI state (selection, hover, highlighting)
 * - Move submission to backend
 * - WebSocket updates
 */
export function useWarInHeaven(gameId: number, userId: number) {
    const {
        gameState,
        currentGame,
        playerIndex,
        isConnected,
        fetchGameState,
        subscribeToGame,
        unsubscribeFromGame,
        makeMove,
    } = useGameStore();

    // UI State (local only)
    const [selectedHex, setSelectedHex] = useState<HexCoordinate | null>(null);
    const [selectedToken, setSelectedToken] = useState<string | null>(null);
    const [validMoves, setValidMoves] = useState<HexCoordinate[]>([]);
    const [selectedAttackers, setSelectedAttackers] = useState<HexCoordinate[]>([]);
    const [combatTarget, setCombatTarget] = useState<HexCoordinate | null>(null);
    const [hoveredHex, setHoveredHex] = useState<HexCoordinate | null>(null);

    const warState = gameState as WarInHeavenGameState | null;

    // Initialize game connection
    useEffect(() => {
        fetchGameState(gameId, userId);
        subscribeToGame(gameId);

        return () => {
            unsubscribeFromGame(gameId);
        };
    }, [gameId, userId]);

    // Computed values
    const isMyTurn = warState?.currentTurn === playerIndex;
    const currentPhase = warState?.phase || 'recharge';
    const myFaction = warState?.players?.[playerIndex]?.faction || 'angels';

    /**
     * Handle hex click - token selection, movement, recharge, or combat
     */
    const handleHexClick = useCallback((coordinate: HexCoordinate) => {
        if (!warState || !isMyTurn) return;

        const hex = warState.board[coordinate];
        const token = hex?.occupiedBy;

        // RECHARGE PHASE: Click depleted tokens to recharge them
        if (currentPhase === 'recharge') {
            if (token && token.faction === myFaction && !token.isActive) {
                handleRecharge(coordinate);
            }
        }
        // COMBAT PHASE: Select attackers and target
        else if (currentPhase === 'combat') {
            // Click on own token to toggle attacker
            if (token && token.faction === myFaction && token.isActive) {
                toggleAttacker(coordinate);
            }
            // Click on enemy token to set as target
            else if (token && token.faction !== myFaction && selectedAttackers.length > 0) {
                setCombatTarget(coordinate);
            }
            // Click elsewhere to clear target
            else if (!token) {
                setCombatTarget(null);
            }
        }
        // ACTION PHASE: Select token and move
        else if (currentPhase === 'action') {
            // If clicking on own token, select it for movement
            if (token && token.faction === myFaction && token.isActive) {
                setSelectedHex(coordinate);
                setSelectedToken(token.id);
                // TODO: Fetch valid moves from backend
                setValidMoves([]);
            }
            // If clicking on empty hex with token selected, attempt move
            else if (selectedHex && !token && validMoves.includes(coordinate)) {
                handleMove(selectedHex, coordinate);
            }
            // Otherwise deselect
            else {
                clearSelection();
            }
        }
        // OTHER PHASES: Clear selection
        else {
            clearSelection();
        }
    }, [warState, isMyTurn, myFaction, currentPhase, selectedHex, selectedAttackers, validMoves, toggleAttacker, handleMove, handleRecharge]);

    /**
     * Submit move to backend
     */
    const handleMove = useCallback(async (from: HexCoordinate, to: HexCoordinate) => {
        if (!warState || !isMyTurn) return;

        try {
            await makeMove(gameId, playerIndex, {
                type: 'MOVE_PIECE',
                from,
                to,
            });

            clearSelection();
        } catch (error) {
            console.error('Move failed:', error);
        }
    }, [gameId, playerIndex, warState, isMyTurn, makeMove]);

    /**
     * Submit card deployment to backend
     * Deploys a card from hand, creating tokens on the board
     */
    const handleDeployToken = useCallback(async (cardId: string) => {
        if (!warState || !isMyTurn || currentPhase !== 'action') return;

        // Find a valid deploy hex for this faction
        const myDeployHexes = myFaction === 'angels' ? ['A1', 'B1'] : ['A9', 'B9'];
        const availableDeployHex = myDeployHexes.find(coord => {
            const hex = warState.board[coord];
            return hex && !hex.occupiedBy;
        });

        if (!availableDeployHex) {
            console.error('No available deploy hex');
            return;
        }

        try {
            await makeMove(gameId, playerIndex, {
                type: 'DEPLOY_TOKEN',
                cardId,
                to: availableDeployHex,
            });

            clearSelection();
        } catch (error) {
            console.error('Deployment failed:', error);
        }
    }, [gameId, playerIndex, warState, isMyTurn, currentPhase, myFaction, makeMove]);

    /**
     * Submit attack to backend
     */
    const handleAttack = useCallback(async () => {
        if (!warState || !isMyTurn || !combatTarget || selectedAttackers.length === 0) return;

        try {
            await makeMove(gameId, playerIndex, {
                type: 'ATTACK',
                attackers: selectedAttackers,
                target: combatTarget,
            });

            setSelectedAttackers([]);
            setCombatTarget(null);
        } catch (error) {
            console.error('Attack failed:', error);
        }
    }, [gameId, playerIndex, warState, isMyTurn, makeMove, combatTarget, selectedAttackers]);

    /**
     * Submit recharge to backend
     * Recharges a depleted token on the board
     */
    const handleRecharge = useCallback(async (coordinate: HexCoordinate) => {
        if (!warState || !isMyTurn || currentPhase !== 'recharge') return;

        try {
            await makeMove(gameId, playerIndex, {
                type: 'RECHARGE',
                coordinate,
            });
        } catch (error) {
            console.error('Recharge failed:', error);
        }
    }, [gameId, playerIndex, warState, isMyTurn, currentPhase, makeMove]);

    /**
     * End current phase
     */
    const handleEndPhase = useCallback(async () => {
        if (!warState || !isMyTurn) return;

        try {
            await makeMove(gameId, playerIndex, {
                type: 'END_PHASE',
            });
        } catch (error) {
            console.error('End phase failed:', error);
        }
    }, [gameId, playerIndex, warState, isMyTurn, makeMove]);

    /**
     * End turn
     */
    const handleEndTurn = useCallback(async () => {
        if (!warState || !isMyTurn) return;

        try {
            await makeMove(gameId, playerIndex, {
                type: 'END_TURN',
            });

            clearSelection();
        } catch (error) {
            console.error('End turn failed:', error);
        }
    }, [gameId, playerIndex, warState, isMyTurn, makeMove]);

    /**
     * Toggle attacker selection for combat
     */
    const toggleAttacker = useCallback((coordinate: HexCoordinate) => {
        if (!warState || !isMyTurn) return;

        const hex = warState.board[coordinate];
        if (!hex?.occupiedBy || hex.occupiedBy.faction !== myFaction) return;

        setSelectedAttackers(prev =>
            prev.includes(coordinate)
                ? prev.filter(c => c !== coordinate)
                : [...prev, coordinate]
        );
    }, [warState, isMyTurn, myFaction]);

    /**
     * Clear all selections
     */
    const clearSelection = useCallback(() => {
        setSelectedHex(null);
        setSelectedToken(null);
        setValidMoves([]);
        setSelectedAttackers([]);
        setCombatTarget(null);
    }, []);

    return {
        // Backend state
        gameState: warState,
        currentGame,
        playerIndex,
        isConnected,
        isMyTurn,
        currentPhase,
        myFaction,

        // UI state
        selectedHex,
        selectedToken,
        validMoves,
        selectedAttackers,
        combatTarget,
        hoveredHex,
        setHoveredHex,

        // Actions
        handleHexClick,
        handleMove,
        handleDeployToken,
        handleAttack,
        handleRecharge,
        handleEndPhase,
        handleEndTurn,
        toggleAttacker,
        clearSelection,
    };
}
