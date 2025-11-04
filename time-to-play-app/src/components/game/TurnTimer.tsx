'use client';

import { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TurnTimerProps {
  turnStartedAt?: number;
  timeLimit?: number; // seconds
  isMyTurn: boolean;
  timerType?: 'BLITZ' | 'RAPID' | 'STANDARD' | 'CASUAL' | 'UNTIMED';
}

const TIMER_CONFIGS = {
  BLITZ: { timePerTurn: 5, color: 'text-red-600' },
  RAPID: { timePerTurn: 15, color: 'text-orange-600' },
  STANDARD: { timePerTurn: 30, color: 'text-yellow-600' },
  CASUAL: { timePerTurn: 60, color: 'text-green-600' },
  UNTIMED: { timePerTurn: Infinity, color: 'text-gray-600' },
};

export function TurnTimer({
  turnStartedAt,
  timeLimit,
  isMyTurn,
  timerType = 'CASUAL',
}: TurnTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const config = TIMER_CONFIGS[timerType];
  const limit = timeLimit || config.timePerTurn;

  useEffect(() => {
    if (!turnStartedAt || limit === Infinity) {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      const elapsed = (Date.now() - turnStartedAt) / 1000;
      const remaining = Math.max(0, limit - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0 && isMyTurn) {
        // Time's up - could trigger auto-move or penalty
        console.log('Time expired!');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [turnStartedAt, limit, isMyTurn]);

  if (timerType === 'UNTIMED' || timeRemaining === null) {
    return null;
  }

  const seconds = Math.ceil(timeRemaining);
  const percentage = (timeRemaining / limit) * 100;
  const isLowTime = percentage < 25;
  const isWarning = percentage < 50;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
        isMyTurn
          ? isLowTime
            ? 'bg-red-100 text-red-700'
            : isWarning
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-primary-100 text-primary-700'
          : 'bg-gray-100 text-gray-600'
      )}
    >
      {isLowTime && isMyTurn ? (
        <AlertCircle className="w-4 h-4 animate-pulse" />
      ) : (
        <Clock className="w-4 h-4" />
      )}
      <span className="font-mono font-semibold text-sm">
        {seconds}s
      </span>
      <div className="flex-1 h-2 bg-white/50 rounded-full overflow-hidden min-w-[60px]">
        <div
          className={cn(
            'h-full transition-all duration-100',
            isLowTime
              ? 'bg-red-600'
              : isWarning
              ? 'bg-yellow-600'
              : 'bg-primary-600'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
