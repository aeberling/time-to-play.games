import { useState } from 'react';
import GameInfo from './GameInfo';

export default function SwoopInfo() {
    return (
        <GameInfo
            gameType="SWOOP"
            title="Swoop"
            description="A fast-paced shedding card game where you race to get rid of all your cards! Be the first to empty your hand, face-up cards, and mystery cards. Strategic swoops clear the pile. Avoid accumulating points - the player with the lowest score wins!"
            minPlayers={3}
            maxPlayers={8}
            difficulty="2 / 5"
            estimatedTime="20-40 min"
            tags={['Strategy', 'Cards', 'Shedding', 'Lowest Score Wins']}
            howToPlay={`**Overview:**
Swoop is a fast-paced shedding game where players race to get rid of all their cards. The first player to empty their hand, face-up cards, and mystery cards wins the round. Points accumulate from leftover cards - lowest total score wins the game!

**Setup:**
• Each player receives 19 cards total:
  - 11 cards in hand (visible to you only)
  - 4 face-up cards (visible to everyone)
  - 4 mystery cards (face-down, revealed when played)
• Game uses multiple decks (2-4 depending on player count) with jokers

**Card Values:**
• In Swoop, Aces are LOW (value 1)
• Number cards are their face value (2-9)
• Jack = 10, Queen = 12, King = 13
• 10s and Jokers are SPECIAL WILD CARDS

**Gameplay:**
1. **Play Equal or Lower:** On your turn, play cards equal to or lower than the top card on the pile
2. **Auto-Pickup:** If you play a card HIGHER than the pile top, you must pick up the entire pile (plus your revealed card)
3. **Special Cards:** 10s and Jokers can be played on anything and clear the pile when played from mystery cards
4. **Swoop!** When 4 equal cards are on top of the pile, it swoops - the pile is removed and you go again!
5. **Mystery Cards:** Can only be played when your hand and face-up cards are empty. Reveal before playing!

**Scoring:**
• Round winner (emptied all cards): 0 points
• All other players score points for remaining cards:

**Beginner Scoring:**
• Number cards 2-9: 5 points each
• Aces: 5 points
• Face cards (J, Q, K): 10 points each
• 10s and Jokers: 50 points each

**Normal Scoring:**
• Number cards 2-9: Face value (2-9 points)
• Aces: 10 points
• Face cards (J, Q, K): 10 points each
• 10s and Jokers: 50 points each

**Winning:**
• Game ends when any player reaches the score limit (50-500 points)
• Player with the LOWEST total score wins!

**Strategy Tips:**
• Play your high-value cards (10s, face cards) early to avoid points
• Use 10s and Jokers strategically to trigger swoops
• Watch for opportunities to create 4-of-a-kind swoops
• Mystery cards are risky - you might pick up the pile!
• Sometimes picking up the pile gives you better cards to play`}
            renderGameOptions={(maxPlayers, gameOptions, setGameOptions) => {
                const [scoreLimit, setScoreLimit] = useState(gameOptions.scoreLimit || 300);
                const [scoringMethod, setScoringMethod] = useState<'beginner' | 'normal'>(
                    gameOptions.scoringMethod || 'beginner'
                );

                const handleScoreLimitChange = (value: number) => {
                    setScoreLimit(value);
                    setGameOptions({ ...gameOptions, scoreLimit: value, scoringMethod });
                };

                const handleScoringMethodChange = (method: 'beginner' | 'normal') => {
                    setScoringMethod(method);
                    setGameOptions({ ...gameOptions, scoreLimit, scoringMethod: method });
                };

                const getGameLength = () => {
                    if (scoreLimit <= 100) return 'Quick';
                    if (scoreLimit <= 250) return 'Medium';
                    if (scoreLimit <= 400) return 'Long';
                    return 'Extended';
                };

                return (
                    <div className="space-y-6 mb-6">
                        {/* Scoring Method */}
                        <div>
                            <label className="block text-white mb-3 font-medium">Scoring Method</label>
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleScoringMethodChange('beginner')}
                                    className={`w-full p-4 rounded-lg text-left transition-all ${
                                        scoringMethod === 'beginner'
                                            ? 'bg-blue-500/30 border-2 border-blue-400'
                                            : 'bg-white/5 border-2 border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="font-semibold text-white mb-1">Beginner</div>
                                    <div className="text-white/70 text-sm">
                                        10 points per trick - Simple scoring
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleScoringMethodChange('normal')}
                                    className={`w-full p-4 rounded-lg text-left transition-all ${
                                        scoringMethod === 'normal'
                                            ? 'bg-blue-500/30 border-2 border-blue-400'
                                            : 'bg-white/5 border-2 border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="font-semibold text-white mb-1">Normal</div>
                                    <div className="text-white/70 text-sm">
                                        Points based on card values - Strategic play
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Score Limit */}
                        <div>
                            <label className="block text-white mb-3 font-medium">
                                Score Limit: {scoreLimit}
                            </label>
                            <input
                                type="range"
                                min={50}
                                max={500}
                                step={50}
                                value={scoreLimit}
                                onChange={(e) => handleScoreLimitChange(Number(e.target.value))}
                                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex justify-between text-white/60 text-sm mt-1">
                                <span>50</span>
                                <span>500</span>
                            </div>
                        </div>

                        {/* Game Length */}
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-white/80 text-sm">
                                <div>
                                    <span className="font-semibold">Estimated Length:</span> {getGameLength()}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }}
        />
    );
}
