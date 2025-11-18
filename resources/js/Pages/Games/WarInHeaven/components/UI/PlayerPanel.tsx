import React from 'react';
import { Faction } from '../../types/HexTypes';
import './PlayerPanel.css';

export interface PlayerPanelProps {
    playerName: string;
    faction: Faction;
    tokensOnBoard: number;
    tokensActive: number;
    tokensInactive: number;
    isCurrentPlayer: boolean;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
    playerName,
    faction,
    tokensOnBoard,
    tokensActive,
    tokensInactive,
    isCurrentPlayer,
}) => {
    const factionColor = faction === 'angels' ? '#FFB200' : '#7F0212';

    return (
        <div
            className={`player-panel ${isCurrentPlayer ? 'player-panel-active' : ''}`}
            style={{ borderColor: factionColor }}
        >
            <div className="player-panel-header" style={{ background: factionColor }}>
                <h3 className="player-name">{playerName}</h3>
                <span className="player-faction">{faction.toUpperCase()}</span>
            </div>

            <div className="player-panel-stats">
                <div className="stat-item">
                    <span className="stat-label">On Board</span>
                    <span className="stat-value">{tokensOnBoard}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Active</span>
                    <span className="stat-value stat-active">{tokensActive}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Inactive</span>
                    <span className="stat-value stat-inactive">{tokensInactive}</span>
                </div>
            </div>

            {isCurrentPlayer && (
                <div className="current-player-indicator">
                    YOUR TURN
                </div>
            )}
        </div>
    );
};
