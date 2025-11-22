import React from 'react';
import { Faction } from '../../types/HexTypes';
import { FactionCards } from '../../types/CardTypes';
import './PlayerPanel.css';

export interface PlayerPanelProps {
    faction: Faction;
    cards: FactionCards;
    isCurrentPlayer: boolean;
    isMe: boolean;
    onDeployCard?: (cardId: string) => void;
    phase?: 'recharge' | 'action' | 'combat' | 'end';
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
    faction,
    cards,
    isCurrentPlayer,
    isMe,
    onDeployCard,
    phase = 'action',
}) => {
    const factionColor = faction === 'angels' ? '#FFB200' : '#7F0212';

    // Calculate stats
    const totalDeployed = cards.deployed.reduce((sum, card) => sum + card.tokenCount, 0);
    const cardsInHand = cards.hand.length;
    const cardsInDeck = cards.deck.length;

    return (
        <div
            className={`player-panel ${isCurrentPlayer ? 'player-panel-active' : ''}`}
            style={{ borderColor: factionColor }}
        >
            <div className="player-panel-header" style={{ background: factionColor }}>
                <h3 className="player-name">{isMe ? 'You' : 'Opponent'}</h3>
                <span className="player-faction">{faction.toUpperCase()}</span>
            </div>

            <div className="player-panel-stats">
                <div className="stat-item">
                    <span className="stat-label">Tokens</span>
                    <span className="stat-value">{totalDeployed}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Hand</span>
                    <span className="stat-value stat-active">{cardsInHand}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Deck</span>
                    <span className="stat-value stat-inactive">{cardsInDeck}</span>
                </div>
            </div>

            {/* Card List - only show for current player */}
            {isMe && (
                <div className="player-cards">
                    <h4 className="cards-section-title">Hand</h4>
                    {cards.hand.length === 0 && (
                        <p className="cards-empty">No cards in hand</p>
                    )}
                    {cards.hand.map(card => (
                        <div key={card.id} className="card-item">
                            <div className="card-header">
                                <span className="card-name">{card.name}</span>
                                <span className="card-stats">{card.attack}/{card.defense}</span>
                            </div>
                            <div className="card-details">
                                <span className="card-cost">Cost: {card.cost}</span>
                                <span className="card-tokens">{card.tokenCount} token{card.tokenCount > 1 ? 's' : ''}</span>
                            </div>
                            {phase === 'action' && isCurrentPlayer && onDeployCard && (
                                <button
                                    className="card-deploy-button"
                                    onClick={() => onDeployCard(card.id)}
                                >
                                    Deploy
                                </button>
                            )}
                        </div>
                    ))}

                    {cards.deployed.length > 0 && (
                        <>
                            <h4 className="cards-section-title">Deployed</h4>
                            {cards.deployed.map(card => (
                                <div key={card.id} className="card-item card-deployed">
                                    <div className="card-header">
                                        <span className="card-name">{card.name}</span>
                                        <span className="card-stats">{card.attack}/{card.defense}</span>
                                    </div>
                                    <div className="card-details">
                                        <span className="card-tokens">{card.tokenCount} on board</span>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}

            {isCurrentPlayer && (
                <div className="current-player-indicator">
                    YOUR TURN
                </div>
            )}
        </div>
    );
};
