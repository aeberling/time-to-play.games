'use client';

import { Card as CardType } from '@/lib/games/core/Game.interface';
import { cn } from '@/lib/utils';

interface CardProps {
  card?: CardType;
  faceDown?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};

const sizes = {
  sm: 'w-16 h-24 text-sm',
  md: 'w-20 h-28 text-base',
  lg: 'w-24 h-36 text-lg',
};

export function Card({ card, faceDown = false, className, size = 'md' }: CardProps) {
  if (faceDown || !card) {
    return (
      <div
        className={cn(
          'rounded-lg border-2 border-gray-300 bg-gradient-to-br from-primary-600 to-primary-800 shadow-lg flex items-center justify-center',
          sizes[size],
          className
        )}
      >
        <div className="w-full h-full p-2 flex items-center justify-center">
          <div className="w-full h-full border-2 border-primary-300 rounded-md opacity-50" />
        </div>
      </div>
    );
  }

  const suitSymbol = suitSymbols[card.suit];
  const suitColor = suitColors[card.suit];

  return (
    <div
      className={cn(
        'rounded-lg border-2 border-gray-300 bg-white shadow-lg relative transition-transform hover:scale-105',
        sizes[size],
        className
      )}
    >
      {/* Top left corner */}
      <div className={cn('absolute top-1 left-1.5 flex flex-col items-center', suitColor)}>
        <span className="font-bold leading-none">{card.rank}</span>
        <span className="text-xl leading-none">{suitSymbol}</span>
      </div>

      {/* Center suit symbol */}
      <div className={cn('absolute inset-0 flex items-center justify-center', suitColor)}>
        <span className="text-5xl opacity-20">{suitSymbol}</span>
      </div>

      {/* Bottom right corner (upside down) */}
      <div
        className={cn(
          'absolute bottom-1 right-1.5 flex flex-col items-center rotate-180',
          suitColor
        )}
      >
        <span className="font-bold leading-none">{card.rank}</span>
        <span className="text-xl leading-none">{suitSymbol}</span>
      </div>
    </div>
  );
}
