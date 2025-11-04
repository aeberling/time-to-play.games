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

interface HowToPlayProps {
  gameType?: 'WAR' | 'OH_HELL';
}

export function HowToPlay({ gameType = 'WAR' }: HowToPlayProps) {
  const [isOpen, setIsOpen] = useState(false);

  const renderWarRules = () => (
    <>
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
    </>
  );

  const renderOhHellRules = () => (
    <>
      <section>
        <h3 className="font-semibold text-lg mb-2">Game Overview</h3>
        <p className="text-gray-700">
          Oh Hell! (also known as Bugger Your Neighbor) is a strategic trick-taking game for 3-5 players
          where you must bid exactly how many tricks you&apos;ll win each round. The challenge: at least one
          player must fail each round due to the dealer&apos;s bidding restriction!
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg mb-2">Round Structure</h3>
        <p className="text-gray-700 mb-2">
          The game consists of 19 rounds with an "elevator" card progression:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Start with 10 cards per player</li>
          <li>Each round decreases by one card (10, 9, 8... down to 1)</li>
          <li>Then increases back up (2, 3, 4... up to 10)</li>
          <li>Total of 19 rounds</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-lg mb-2">Each Round</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li><strong>Deal:</strong> Cards are dealt to each player</li>
          <li><strong>Trump:</strong> Top card of remaining deck becomes trump suit (or no trump if all cards dealt)</li>
          <li><strong>Bidding:</strong> Each player bids 0-N tricks (where N = cards in hand)</li>
          <li><strong>Playing:</strong> Player left of dealer leads first trick; must follow suit if possible</li>
          <li><strong>Scoring:</strong> Made bid exactly = 10 + bid points; failed bid = 0 points</li>
        </ol>
      </section>

      <section>
        <h3 className="font-semibold text-lg mb-2">The Dealer's Restriction</h3>
        <p className="text-gray-700 mb-2">
          <strong className="text-amber-600">Critical Rule:</strong> The dealer cannot bid a number that would
          make total bids equal total tricks available. This ensures at least one player must fail each round!
        </p>
        <p className="text-sm text-gray-600">
          Example: 4 players, 5 cards each = 5 tricks. If first 3 players bid 2, 1, 1 (total = 4),
          dealer cannot bid 1 (would make total = 5). Dealer must bid 0, 2, 3, 4, or 5.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg mb-2">Trump & Trick-Taking</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Trump cards beat all non-trump cards</li>
          <li>If no trump played, highest card of led suit wins</li>
          <li>Must follow suit if possible</li>
          <li>Card rankings: A (high) {'>'} K {'>'} Q {'>'} J {'>'} 10 {'>'} 9 {'>'} 8 {'>'} 7 {'>'} 6 {'>'} 5 {'>'} 4 {'>'} 3 {'>'} 2 (low)</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-lg mb-2">Winning</h3>
        <p className="text-gray-700">
          Highest cumulative score after all 19 rounds wins!
        </p>
      </section>
    </>
  );

  const gameTitle = gameType === 'OH_HELL' ? 'Oh Hell!' : 'War';
  const gameDescription = gameType === 'OH_HELL'
    ? 'Learn the rules of this strategic trick-taking game'
    : 'Learn the rules of this classic card game';

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
        aria-label={`How to play ${gameTitle}`}
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
                    <CardTitle>How to Play {gameTitle}</CardTitle>
                    <CardDescription>{gameDescription}</CardDescription>
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
                {gameType === 'OH_HELL' ? renderOhHellRules() : renderWarRules()}

                <section>
                  <h3 className="font-semibold text-lg mb-2">Game Features</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>
                      <strong>Turn Timer:</strong> Each turn has a time limit. Make your move
                      before time runs out!
                    </li>
                    <li>
                      <strong>Chat:</strong> Use the chat to communicate with your {gameType === 'OH_HELL' ? 'fellow players' : 'opponent'} during
                      the game.
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
