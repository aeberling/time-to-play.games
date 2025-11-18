import React from 'react';
import { Faction } from '../../types/HexTypes';
import './Token.css';

export interface TokenData {
    id: string;
    name: string;
    faction: Faction;
    subtype: 'commander' | 'troop' | 'ally';
    attack: number;
    defense: number;
    icon: string; // URL to icon image
    isActive: boolean; // true = face up, false = face down
}

interface TokenProps {
    token: TokenData;
    size?: 'small' | 'medium' | 'large';
    onClick?: () => void;
    isSelected?: boolean;
    isDragging?: boolean;
    className?: string;
}

export const Token: React.FC<TokenProps> = ({
    token,
    size = 'medium',
    onClick,
    isSelected = false,
    isDragging = false,
    className = '',
}) => {
    const sizeMap = {
        small: 28,
        medium: 32,
        large: 36,
    };

    const radius = sizeMap[size];
    const factionColor = token.faction === 'angels' ? '#FFB200' : '#7F0212';
    const factionColorDark = token.faction === 'angels' ? '#CC8E00' : '#5A0000';

    return (
        <div
            className={`token ${className} ${isSelected ? 'token-selected' : ''} ${isDragging ? 'token-dragging' : ''}`}
            onClick={onClick}
            style={{ width: radius * 2, height: radius * 2 }}
        >
            <svg
                width={radius * 2}
                height={radius * 2}
                viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                xmlns="http://www.w3.org/2000/svg"
            >
                {token.isActive ? (
                    // Active (face up) - show character
                    <g className="token-face-active">
                        {/* Outer circle (border) */}
                        <circle
                            cx={radius}
                            cy={radius}
                            r={radius - 1}
                            fill={factionColorDark}
                        />

                        {/* Inner circle (background) */}
                        <circle
                            cx={radius}
                            cy={radius}
                            r={radius - 3}
                            fill={factionColor}
                        />

                        {/* Top half - character icon area */}
                        <clipPath id={`clip-top-${token.id}`}>
                            <rect x="0" y="0" width={radius * 2} height={radius} />
                        </clipPath>
                        <circle
                            cx={radius}
                            cy={radius}
                            r={radius - 4}
                            fill="#FFF"
                            clipPath={`url(#clip-top-${token.id})`}
                        />

                        {/* Character icon (would be an image in real implementation) */}
                        <g transform={`translate(${radius}, ${radius * 0.5})`}>
                            <text
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={radius * 0.5}
                                fill="#333"
                                fontWeight="bold"
                            >
                                {token.name.charAt(0)}
                            </text>
                        </g>

                        {/* Bottom half - stats area */}
                        <g transform={`translate(${radius}, ${radius * 1.5})`}>
                            {/* Attack (left side) */}
                            <g transform={`translate(${-radius * 0.4}, 0)`}>
                                <text
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize={radius * 0.35}
                                    fill="#FFF"
                                    fontWeight="bold"
                                >
                                    {token.attack}
                                </text>
                                <text
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize={radius * 0.2}
                                    fill="#FFF"
                                    y={radius * 0.25}
                                >
                                    ⚔
                                </text>
                            </g>

                            {/* Defense (right side) */}
                            <g transform={`translate(${radius * 0.4}, 0)`}>
                                <text
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize={radius * 0.35}
                                    fill="#FFF"
                                    fontWeight="bold"
                                >
                                    {token.defense}
                                </text>
                                <text
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize={radius * 0.2}
                                    fill="#FFF"
                                    y={radius * 0.25}
                                >
                                    🛡
                                </text>
                            </g>
                        </g>

                        {/* Selection ring */}
                        {isSelected && (
                            <circle
                                cx={radius}
                                cy={radius}
                                r={radius - 1}
                                fill="none"
                                stroke="#FFD700"
                                strokeWidth="3"
                                className="selection-ring"
                            />
                        )}
                    </g>
                ) : (
                    // Inactive (face down) - show "Flip to Recharge"
                    <g className="token-face-inactive">
                        {/* Outer circle (border) */}
                        <circle
                            cx={radius}
                            cy={radius}
                            r={radius - 1}
                            fill={factionColorDark}
                            opacity="0.6"
                        />

                        {/* Inner circle (background) - desaturated */}
                        <circle
                            cx={radius}
                            cy={radius}
                            r={radius - 3}
                            fill={factionColor}
                            opacity="0.4"
                        />

                        {/* Gray overlay */}
                        <circle
                            cx={radius}
                            cy={radius}
                            r={radius - 3}
                            fill="#666"
                            opacity="0.7"
                        />

                        {/* Refresh icon area */}
                        <circle
                            cx={radius}
                            cy={radius}
                            r={radius * 0.5}
                            fill="#888"
                        />

                        {/* Refresh icon (simplified) */}
                        <g transform={`translate(${radius}, ${radius})`}>
                            <text
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={radius * 0.5}
                                fill="#FFF"
                            >
                                ↻
                            </text>
                        </g>

                        {/* "Flip to Recharge" text */}
                        <text
                            x={radius}
                            y={radius * 1.7}
                            textAnchor="middle"
                            fontSize={radius * 0.2}
                            fill="#CCC"
                        >
                            Recharge
                        </text>
                    </g>
                )}
            </svg>
        </div>
    );
};
