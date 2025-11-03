import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Shield, Users, Palette, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600 text-white py-32 px-4">
        <div className="text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-heading">
            Time to Play
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Classic card games with friends, anytime, anywhere
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
              <Link href="/play">Play as Guest</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 hover:bg-white/20 text-white border-white" asChild>
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/80">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" /> No signup required
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" /> Never lose progress
            </span>
            <span className="flex items-center gap-2">
              <Palette className="w-4 h-4" /> Beautiful themes
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-4 font-heading">
            Why Time to Play?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            A modern platform for classic games, built with the latest web technologies
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary-500" />
                </div>
                <CardTitle>Instant Play</CardTitle>
                <CardDescription>
                  No downloads, no waiting. Jump into a game in seconds as a guest.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary-500" />
                </div>
                <CardTitle>Robust Reconnection</CardTitle>
                <CardDescription>
                  Dropped connection? No problem. Refresh and continue where you left off.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary-500" />
                </div>
                <CardTitle>Play with Anyone</CardTitle>
                <CardDescription>
                  Invite friends or match with players from around the world.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary-500" />
                </div>
                <CardTitle>Flexible Timers</CardTitle>
                <CardDescription>
                  Choose your pace with configurable time controls for every game.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-primary-500" />
                </div>
                <CardTitle>In-Game Chat</CardTitle>
                <CardDescription>
                  Talk with your opponents using real-time chat and emoji reactions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <Palette className="w-6 h-6 text-primary-500" />
                </div>
                <CardTitle>Personalized Themes</CardTitle>
                <CardDescription>
                  Choose from 5 vibrant color themes to match your style.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-4 font-heading">
            Ready to Play?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of players enjoying classic card games online
          </p>
          <Button size="lg" className="text-lg px-12" asChild>
            <Link href="/play">Start Playing Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
