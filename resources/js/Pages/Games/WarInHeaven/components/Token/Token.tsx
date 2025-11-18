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
                            fill="#000"
                        />

                        {/* Inner circle (background) */}
                        <circle
                            cx={radius}
                            cy={radius}
                            r={radius - 3}
                            fill={factionColor}
                        />

                        {/* Top three-fifths - character icon area */}
                        <clipPath id={`clip-top-${token.id}`}>
                            <rect x="0" y="0" width={radius * 2} height={radius * 1.2} />
                        </clipPath>
                        <circle
                            cx={radius}
                            cy={radius}
                            r={radius - 4}
                            fill={factionColor}
                            clipPath={`url(#clip-top-${token.id})`}
                        />

                        {/* Character icon */}
                        <image
                            href={token.icon}
                            x={radius * 0.55}
                            y={radius * 0.2}
                            width={radius * 0.9}
                            height={radius * 0.9}
                            clipPath={`url(#clip-top-${token.id})`}
                            preserveAspectRatio="xMidYMid meet"
                        />

                        {/* Drop shadow filter for stats */}
                        <defs>
                            <filter id={`stat-shadow-${token.id}`}>
                                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.8" floodColor="#000"/>
                            </filter>
                        </defs>

                        {/* Bottom two-fifths - grey-blue background */}
                        <clipPath id={`clip-bottom-${token.id}`}>
                            <rect x="0" y={radius * 1.2} width={radius * 2} height={radius * 0.8} />
                        </clipPath>
                        <circle
                            cx={radius}
                            cy={radius}
                            r={radius - 3}
                            fill="#5A6C7D"
                            clipPath={`url(#clip-bottom-${token.id})`}
                        />

                        {/* Bottom third - stats area */}
                        <g transform={`translate(${radius + 3}, ${radius * 1.55})`}>
                            {/* Attack number */}
                            <text
                                x={-radius * 0.45}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={radius * 0.425}
                                fill="#FFF"
                                fontWeight="bold"
                                filter={`url(#stat-shadow-${token.id})`}
                            >
                                {token.attack}
                            </text>
                            {/* Attack icon */}
                            <image
                                href="/assets/games/war-in-heaven/icons/attack-icon.png"
                                x={-radius * 0.35}
                                y={-radius * 0.175}
                                width={radius * 0.35}
                                height={radius * 0.35}
                                preserveAspectRatio="xMidYMid meet"
                            />

                            {/* Defense number */}
                            <text
                                x={radius * 0.15}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={radius * 0.425}
                                fill="#FFF"
                                fontWeight="bold"
                                filter={`url(#stat-shadow-${token.id})`}
                            >
                                {token.defense}
                            </text>
                            {/* Defense icon */}
                            <image
                                href="/assets/games/war-in-heaven/icons/defense-icon.png"
                                x={radius * 0.25}
                                y={-radius * 0.175}
                                width={radius * 0.35}
                                height={radius * 0.35}
                                preserveAspectRatio="xMidYMid meet"
                            />
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
                            fill="#000"
                        />

                        {/* Inner circle (background) */}
                        <circle
                            cx={radius}
                            cy={radius}
                            r={radius - 3}
                            fill="#D2D2D2"
                        />

                        {/* Top three-fifths - character icon area */}
                        <clipPath id={`clip-top-inactive-${token.id}`}>
                            <rect x="0" y="0" width={radius * 2} height={radius * 1.2} />
                        </clipPath>
                        <circle
                            cx={radius}
                            cy={radius}
                            r={radius - 4}
                            fill="#D2D2D2"
                            clipPath={`url(#clip-top-inactive-${token.id})`}
                        />

                        {/* Character icon */}
                        <image
                            href={token.icon}
                            x={radius * 0.55}
                            y={radius * 0.2}
                            width={radius * 0.9}
                            height={radius * 0.9}
                            clipPath={`url(#clip-top-inactive-${token.id})`}
                            preserveAspectRatio="xMidYMid meet"
                        />

                        {/* Bottom two-fifths - grey-blue background */}
                        <clipPath id={`clip-bottom-inactive-${token.id}`}>
                            <rect x="0" y={radius * 1.2} width={radius * 2} height={radius * 0.8} />
                        </clipPath>
                        <circle
                            cx={radius}
                            cy={radius}
                            r={radius - 3}
                            fill="#5A6C7D"
                            clipPath={`url(#clip-bottom-inactive-${token.id})`}
                        />

                        {/* Refresh icon centered in bottom section */}
                        <image
                            href="/assets/games/war-in-heaven/icons/refresh-icon.png"
                            x={radius * 0.72}
                            y={radius * 1.42 - 5}
                            width={radius * 0.56}
                            height={radius * 0.56}
                            preserveAspectRatio="xMidYMid meet"
                        />
                    </g>
                )}
            </svg>
        </div>
    );
};
