import React from 'react';
import './GameInfo.css';

export type GamePhase = 'recharge' | 'action' | 'battle' | 'end';

export interface GameInfoProps {
    round: number;
    maxRounds: number;
    actionsRemaining: number;
    maxActions: number;
    currentPhase: GamePhase;
}

const phaseLabels: Record<GamePhase, string> = {
    recharge: 'Recharge',
    action: 'Action',
    battle: 'Battle',
    end: 'End Turn',
};

export const GameInfo: React.FC<GameInfoProps> = ({
    round,
    maxRounds,
    actionsRemaining,
    maxActions,
    currentPhase,
}) => {
    return (
        <div className="game-info">
            <div className="game-info-section">
                <div className="info-label">Round</div>
                <div className="info-value round-display">
                    {round} <span className="round-max">/ {maxRounds}</span>
                </div>
            </div>

            <div className="game-info-divider" />

            <div className="game-info-section">
                <div className="info-label">Phase</div>
                <div className="info-value phase-display">
                    {phaseLabels[currentPhase]}
                </div>
            </div>

            <div className="game-info-divider" />

            <div className="game-info-section">
                <div className="info-label">Actions</div>
                <div className="info-value actions-display">
                    {actionsRemaining} <span className="actions-max">/ {maxActions}</span>
                </div>
                <div className="actions-dots">
                    {Array.from({ length: maxActions }).map((_, i) => (
                        <div
                            key={i}
                            className={`action-dot ${i < actionsRemaining ? 'action-dot-active' : ''}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
