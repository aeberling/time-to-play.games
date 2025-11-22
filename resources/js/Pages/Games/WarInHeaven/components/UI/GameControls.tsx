import React from 'react';
import './GameControls.css';

export interface GameControlsProps {
    phase: 'recharge' | 'action' | 'combat' | 'end';
    isMyTurn: boolean;
    selectedAttackers: string[];
    combatTarget: string | null;
    onClearSelection: () => void;
    onAttack: () => void;
    onEndPhase: () => void;
    onEndTurn: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
    phase,
    isMyTurn,
    selectedAttackers,
    combatTarget,
    onClearSelection,
    onAttack,
    onEndPhase,
    onEndTurn,
}) => {
    const canAttack = selectedAttackers.length > 0 && combatTarget !== null;
    const hasSelection = selectedAttackers.length > 0 || combatTarget !== null;

    return (
        <div className="game-controls">
            {/* Combat Phase Controls */}
            {phase === 'combat' && isMyTurn && (
                <>
                    <button
                        className="game-btn game-btn-attack"
                        onClick={onAttack}
                        disabled={!canAttack}
                        title={!canAttack ? 'Select attackers and a target' : 'Execute attack'}
                    >
                        ⚔️ Resolve Combat
                    </button>
                    {hasSelection && (
                        <button
                            className="game-btn game-btn-secondary"
                            onClick={onClearSelection}
                        >
                            Clear Selection
                        </button>
                    )}
                </>
            )}

            {/* Phase Transition Controls */}
            {isMyTurn && (
                <>
                    {phase !== 'end' && (
                        <button
                            className="game-btn game-btn-primary"
                            onClick={onEndPhase}
                        >
                            End {phase.charAt(0).toUpperCase() + phase.slice(1)} Phase →
                        </button>
                    )}
                    {phase === 'end' && (
                        <button
                            className="game-btn game-btn-end-turn"
                            onClick={onEndTurn}
                        >
                            End Turn →
                        </button>
                    )}
                </>
            )}

            {!isMyTurn && (
                <div className="waiting-indicator">
                    Waiting for opponent...
                </div>
            )}
        </div>
    );
};
