import React from 'react';
import { Token, TokenData } from '../Token';
import { Faction } from '../../types/HexTypes';
import './Card.css';

export interface CardData {
    id: string;
    name: string;
    cost: number;
    attack: number;
    defense: number;
    subtype: 'commander' | 'troop' | 'ally';
    faction: Faction;
    cardImageUrl: string;
    iconUrl: string;
    specialText: string;
    flavorText: string;
    tokens: TokenData[];
}

interface CardProps {
    card: CardData;
    onTokenClick?: (tokenId: string) => void;
    selectedTokenId?: string | null;
    onClick?: () => void;
    isSelected?: boolean;
    className?: string;
}

export const Card: React.FC<CardProps> = ({
    card,
    onTokenClick,
    selectedTokenId,
    onClick,
    isSelected = false,
    className = '',
}) => {
    return (
        <div
            className={`card ${className} ${isSelected ? 'card-selected' : ''}`}
            onClick={onClick}
        >
            {/* Card Image */}
            <div className="card-image-container">
                <img
                    src={card.cardImageUrl}
                    alt={card.name}
                    className="card-image"
                />
            </div>

            {/* Token Display Area */}
            <div className="card-tokens">
                {card.tokens.map((token, index) => (
                    <div
                        key={token.id}
                        className="card-token-slot"
                        style={{ left: `${10 + index * 45}px` }}
                    >
                        <Token
                            token={token}
                            size="small"
                            onClick={() => onTokenClick?.(token.id)}
                            isSelected={selectedTokenId === token.id}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
