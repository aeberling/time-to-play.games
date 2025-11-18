import React from 'react';
import './GameControls.css';

export interface GameControlsProps {
    onEndTurn: () => void;
    onDeclareAttack?: () => void;
    canEndTurn: boolean;
    canDeclareAttack: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
    onEndTurn,
    onDeclareAttack,
    canEndTurn,
    canDeclareAttack,
}) => {
    return (
        <div className="game-controls">
            {onDeclareAttack && (
                <button
                    className="game-btn game-btn-attack"
                    onClick={onDeclareAttack}
                    disabled={!canDeclareAttack}
                >
                    ⚔️ Declare Attack
                </button>
            )}

            <button
                className="game-btn game-btn-end-turn"
                onClick={onEndTurn}
                disabled={!canEndTurn}
            >
                End Turn →
            </button>
        </div>
    );
};
