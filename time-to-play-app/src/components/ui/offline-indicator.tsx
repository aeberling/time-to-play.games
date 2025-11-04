'use client';

import { useEffect } from 'react';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useToast } from '@/hooks/use-toast';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const { toast } = useToast();

  useEffect(() => {
    if (!isOnline) {
      toast({
        variant: 'destructive',
        title: 'You are offline',
        description: 'Check your internet connection. Some features may not work.',
        duration: Infinity, // Don't auto-dismiss
      });
    } else {
      // Show reconnection toast
      toast({
        title: 'Back online',
        description: 'Your connection has been restored.',
        duration: 3000,
      });
    }
  }, [isOnline, toast]);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
      <WifiOff className="w-5 h-5" />
      <span className="font-medium">No Internet Connection</span>
    </div>
  );
}
