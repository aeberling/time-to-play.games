'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { HelpCircle, X } from 'lucide-react';

export function HowToPlay() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
        aria-label="How to play War"
      >
        <HelpCircle className="w-4 h-4" />
        How to Play
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>How to Play War</CardTitle>
                    <CardDescription>Learn the rules of this classic card game</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close how to play"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="font-semibold text-lg mb-2">Game Setup</h3>
                  <p className="text-gray-700">
                    War is a simple card game for two players. The entire deck is dealt evenly
                    between both players, so each player starts with 26 cards face-down.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">Basic Gameplay</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>
                      Both players simultaneously reveal the top card from their deck by clicking
                      the "Play Card" button.
                    </li>
                    <li>
                      The player with the higher card wins both cards and adds them to their
                      collection pile.
                    </li>
                    <li>
                      Card rankings (from highest to lowest): Ace, King, Queen, Jack, 10, 9, 8, 7,
                      6, 5, 4, 3, 2.
                    </li>
                    <li>Suits (hearts, diamonds, clubs, spades) don't matter in War.</li>
                  </ol>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">War! (Tie Situation)</h3>
                  <p className="text-gray-700 mb-2">
                    When both players reveal cards of the same rank, a "War" begins:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Each player places 3 cards face-down.</li>
                    <li>Then each player reveals one more card face-up.</li>
                    <li>
                      The player with the higher face-up card wins ALL the cards in the war
                      (including the face-down cards).
                    </li>
                    <li>
                      If the face-up cards tie again, another war begins with the same process.
                    </li>
                  </ol>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">Winning the Game</h3>
                  <p className="text-gray-700">
                    The game ends when one player has collected all 52 cards, or when a player
                    runs out of cards during a war (in which case the opponent wins).
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">Game Features</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>
                      <strong>Turn Timer:</strong> Each turn has a time limit. Make your move
                      before time runs out!
                    </li>
                    <li>
                      <strong>Chat:</strong> Use the chat to communicate with your opponent during
                      the game.
                    </li>
                    <li>
                      <strong>Card Counter:</strong> Keep track of how many cards you and your
                      opponent have.
                    </li>
                  </ul>
                </section>

                <div className="pt-4 border-t">
                  <Button onClick={() => setIsOpen(false)} className="w-full">
                    Got it, let's play!
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
