import React from 'react';
import { Card } from '@/types';

interface GameCardProps {
    card: Card | string;
    faceDown?: boolean;
    small?: boolean;
    onClick?: () => void;
    selected?: boolean;
    borderColor?: string;
    isPlayable?: boolean;
    className?: string;
}

export default function GameCard({
    card,
    faceDown = false,
    small = false,
    onClick,
    selected = false,
    borderColor,
    isPlayable = false,
    className = '',
}: GameCardProps) {
    if (typeof card === 'string' || faceDown || (card as any).hidden) {
        return (
            <div
                className={`${small ? 'w-16 h-24' : 'w-24 h-32'} game-card-back rounded-lg border-2 flex items-center justify-center cursor-default ${className}`}
            >
                <div className={`text-white ${small ? 'text-2xl' : 'text-3xl'} font-bold`}>?</div>
            </div>
        );
    }

    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const isJoker = card.rank === 'Joker';
    const suitColor = isRed ? '#dc2626' : '#1f2937';

    return (
        <div
            onClick={onClick}
            className={`${small ? 'w-12 h-16' : 'w-16 h-24'} game-card rounded-lg border-2 flex items-center justify-center ${isJoker ? 'p-0' : small ? 'p-0.5' : 'p-2'} transition-all ${
                selected
                    ? 'ring-4 -translate-y-2 shadow-lg'
                    : isPlayable && onClick
                    ? 'ring-2 ring-green-300'
                    : ''
            } ${onClick ? 'cursor-pointer hover:shadow-md' : 'cursor-default'} ${className}`}
            style={{
                borderColor: borderColor || (selected ? '#fbbf24' : isPlayable ? '#22c55e' : undefined),
                borderWidth: borderColor && !selected && !isPlayable ? '3px' : undefined,
                ...(selected && { borderColor: '#fbbf24' }),
            }}
        >
            {isJoker ? (
                <div className={small ? 'text-6xl leading-none' : 'text-8xl leading-none'}>
                    🃏
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center">
                    <div
                        className={`${small ? 'text-2xl' : 'text-4xl'} font-bold`}
                        style={{ color: suitColor }}
                    >
                        {card.rank}
                    </div>
                    <div className={small ? 'text-lg mt-0.5' : 'text-3xl mt-1'} style={{ color: suitColor }}>
                        {card.suit === 'hearts' && '♥'}
                        {card.suit === 'diamonds' && '♦'}
                        {card.suit === 'clubs' && '♣'}
                        {card.suit === 'spades' && '♠'}
                    </div>
                </div>
            )}
        </div>
    );
}
