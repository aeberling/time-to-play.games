import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function GameBoardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Game board area */}
      <div className="lg:col-span-2">
        <Card className="bg-gradient-to-br from-green-700 to-green-900">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Opponent section */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 bg-white/20" />
                  <Skeleton className="h-4 w-24 bg-white/20" />
                </div>
                <Skeleton className="h-24 w-16 bg-white/20 rounded-lg" />
              </div>

              {/* Battle area */}
              <div className="flex items-center justify-center gap-4 py-12">
                <Skeleton className="h-32 w-24 bg-white/20 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-full bg-white/20" />
                <Skeleton className="h-32 w-24 bg-white/20 rounded-lg" />
              </div>

              {/* Player section */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-24 w-16 bg-white/20 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 bg-white/20" />
                  <Skeleton className="h-4 w-24 bg-white/20" />
                </div>
              </div>

              {/* Action button */}
              <div className="flex justify-center">
                <Skeleton className="h-12 w-40 bg-white/20" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat sidebar */}
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
