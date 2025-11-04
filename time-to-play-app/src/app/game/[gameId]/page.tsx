'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { WarGame } from '@/components/game/WarGame';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { GameBoardSkeleton } from '@/components/loading/GameBoardSkeleton';
import { ArrowLeft } from 'lucide-react';

interface GameData {
  id: string;
  gameType: string;
  status: string;
  players: Array<{
    userId: string;
    user: {
      id: string;
      displayName: string;
    };
  }>;
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [game, setGame] = useState<GameData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const gameId = params.gameId as string;

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch game details
    fetch(`/api/games/${gameId}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGame(data.game);
        } else {
          setError(data.error || 'Failed to load game');
        }
      })
      .catch((err) => {
        console.error('Error fetching game:', err);
        setError('Failed to load game');
      });
  }, [gameId, isAuthenticated, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/games')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push('/games')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
          </div>
          <GameBoardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/games')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
        </div>

        {game.gameType === 'WAR' && <WarGame gameId={gameId} userId={user.id} />}
      </div>
    </div>
  );
}
