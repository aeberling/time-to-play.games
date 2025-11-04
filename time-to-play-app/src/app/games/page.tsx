'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { GameListSkeleton } from '@/components/loading/GameCardSkeleton';
import { useToast } from '@/hooks/use-toast';
import { Users, Play, Plus, Clock } from 'lucide-react';

interface Game {
  id: string;
  gameType: string;
  status: string;
  isPrivate: boolean;
  createdAt: string;
  players: Array<{
    user: {
      displayName: string;
    };
  }>;
  timerConfig?: {
    type: string;
  };
}

export default function GamesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingGames, setLoadingGames] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchAvailableGames();
  }, [isAuthenticated, isLoading, router]);

  const fetchAvailableGames = async () => {
    try {
      const res = await fetch('/api/games/available', {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setGames(data.games);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error Loading Games',
          description: data.error || 'Failed to load available games. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: 'Unable to connect to server. Please check your internet connection.',
      });
    } finally {
      setLoadingGames(false);
    }
  };

  const handleCreateGame = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          gameType: 'WAR',
          timerConfig: {
            type: 'CASUAL',
          },
          isPrivate: false,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: 'Game Created!',
          description: 'Redirecting to your new game...',
        });
        router.push(`/game/${data.game.id}`);
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to Create Game',
          description: data.error || 'Unable to create game. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error creating game:', error);
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: 'Unable to connect to server. Please check your internet connection.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    try {
      const res = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: 'Joined Game!',
          description: 'Loading game...',
        });
        router.push(`/game/${gameId}`);
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to Join Game',
          description: data.error || 'Unable to join game. It may be full or no longer available.',
        });
      }
    } catch (error) {
      console.error('Error joining game:', error);
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: 'Unable to connect to server. Please check your internet connection.',
      });
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Game</h1>
          <p className="text-gray-600">Join an existing game or create a new one</p>
        </header>

        {/* Create Game Button */}
        <div className="mb-8">
          <Button
            onClick={handleCreateGame}
            disabled={isCreating}
            size="lg"
            className="bg-accent-600 hover:bg-accent-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            {isCreating ? 'Creating...' : 'Create New Game'}
          </Button>
        </div>

        {/* Available Games */}
        <section aria-labelledby="available-games-heading">
          <h2 id="available-games-heading" className="text-xl font-semibold mb-4">Available Games</h2>

          {loadingGames ? (
            <div role="status" aria-live="polite" aria-label="Loading available games">
              <GameListSkeleton />
            </div>
          ) : games.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600 mb-4">No games available right now</p>
                <p className="text-sm text-gray-500">
                  Create a new game to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => (
                <Card key={game.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="w-5 h-5 text-primary-600" />
                      {game.gameType}
                    </CardTitle>
                    <CardDescription>
                      {game.status === 'WAITING' ? 'Waiting for players' : 'In Progress'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>
                          {game.players.length}/2 players
                        </span>
                      </div>

                      {game.timerConfig && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{game.timerConfig.type}</span>
                        </div>
                      )}

                      <div className="text-sm text-gray-600">
                        <p>Host: {game.players[0]?.user.displayName}</p>
                      </div>

                      <Button
                        onClick={() => handleJoinGame(game.id)}
                        className="w-full mt-4"
                        disabled={game.status !== 'WAITING'}
                        aria-label={`Join ${game.gameType} game hosted by ${game.players[0]?.user.displayName}`}
                      >
                        Join Game
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
