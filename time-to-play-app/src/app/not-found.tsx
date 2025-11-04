import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl font-bold text-primary-600">404</div>
          </div>
          <CardTitle className="text-center">Page Not Found</CardTitle>
          <CardDescription className="text-center">
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/games">
                <Search className="w-4 h-4 mr-2" />
                Browse Games
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
