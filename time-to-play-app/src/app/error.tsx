'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertTriangle className="w-6 h-6" />
            <CardTitle>Something Went Wrong</CardTitle>
          </div>
          <CardDescription>
            We encountered an unexpected error. Don't worry, your progress has been saved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-xs font-semibold text-red-800 mb-1">Error Details:</p>
              <p className="text-sm font-mono text-red-800">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              onClick={reset}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
