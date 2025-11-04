'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PlayPage() {
  const router = useRouter();
  const { user, isLoading, loginAsGuest } = useAuth();
  const [isCreatingGuest, setIsCreatingGuest] = useState(false);

  useEffect(() => {
    // If not authenticated and not loading, create guest account
    if (!isLoading && !user) {
      handleGuestLogin();
    }
  }, [isLoading, user]);

  const handleGuestLogin = async () => {
    try {
      setIsCreatingGuest(true);
      await loginAsGuest();
    } catch (error) {
      console.error('Failed to create guest account:', error);
    } finally {
      setIsCreatingGuest(false);
    }
  };

  if (isLoading || isCreatingGuest) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your game...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Unable to Start</CardTitle>
            <CardDescription className="text-center">
              Failed to create guest account. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleGuestLogin} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push('/login')} className="w-full">
              Login Instead
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading mb-2">
            Welcome, {user.displayName}!
          </h1>
          {user.isGuest && (
            <p className="text-gray-600">
              You&apos;re playing as a guest.{' '}
              <button
                onClick={() => router.push('/register')}
                className="text-primary-500 hover:text-primary-600 font-medium underline"
              >
                Create an account
              </button>{' '}
              to save your progress.
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 hover:border-primary-500 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>War</CardTitle>
              <CardDescription>
                Classic card game of chance. Flip cards and the highest wins!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary-500 transition-colors cursor-pointer opacity-60">
            <CardHeader>
              <CardTitle>More Games Coming</CardTitle>
              <CardDescription>
                We&apos;re working on bringing you more classic card games!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                Stay Tuned
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
