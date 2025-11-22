import { useState } from 'react';
import GameInfo from './GameInfo';

export default function OhHellInfo() {
    return (
        <GameInfo
            gameType="OH_HELL"
            title="Oh Hell!"
            description="Bid on how many tricks you'll win. But someone will inevitably miss their target... The object is for each player to bid the number of tricks they think they can take from each hand, then to take exactly that many; no more and no fewer. Points are awarded for making the bid exactly, and are deducted for missing the bid, either over or under."
            minPlayers={3}
            maxPlayers={7}
            difficulty="1 / 5"
            estimatedTime="25 min"
            tags={['Classic', 'Cards', 'Trick-taking']}
            howToPlay={`**Overview:**
Oh Hell! is a trick-taking game where players must predict exactly how many tricks they will win each round.

**Setup:**
• The game uses a standard 52-card deck
• Cards rank from high to low: A, K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2
• The number of cards dealt varies each round

**Gameplay:**
1. **Dealing:** Cards are dealt to each player. The number of cards changes each round.
2. **Trump Card:** The next card after dealing is turned face-up to determine the trump suit.
3. **Bidding:** Starting with the player left of the dealer, each player bids how many tricks they think they'll win.
4. **Playing Tricks:** Players must follow suit if possible. If they can't, they may play any card.
5. **Winning Tricks:** The highest trump card wins. If no trump, the highest card of the led suit wins.

**Scoring:**
• If you make your bid exactly: +10 points + 1 point per trick won
• If you miss your bid: -1 point for each trick over or under

**Strategy Tips:**
• Watch what other players bid
• Remember which high cards have been played
• Trump cards are powerful but limited`}
            renderGameOptions={(maxPlayers, gameOptions, setGameOptions) => {
                const [startingHandSize, setStartingHandSize] = useState(
                    gameOptions.startingHandSize || 10
                );
                const [endingHandSize, setEndingHandSize] = useState(
                    gameOptions.endingHandSize || 1
                );

                const maxPossibleCards = Math.floor(52 / maxPlayers);
                const totalRounds = Math.abs(startingHandSize - endingHandSize) + 1;

                const handleStartingHandChange = (value: number) => {
                    setStartingHandSize(value);
                    setGameOptions({ ...gameOptions, startingHandSize: value, endingHandSize });
                };

                const handleEndingHandChange = (value: number) => {
                    setEndingHandSize(value);
                    setGameOptions({ ...gameOptions, startingHandSize, endingHandSize: value });
                };

                return (
                    <div className="space-y-6 mb-6">
                        {/* Starting Hand Size */}
                        <div>
                            <label className="block text-white mb-3 font-medium">
                                Starting Hand Size: {startingHandSize}
                            </label>
                            <input
                                type="range"
                                min={1}
                                max={maxPossibleCards}
                                value={startingHandSize}
                                onChange={(e) => handleStartingHandChange(Number(e.target.value))}
                                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex justify-between text-white/60 text-sm mt-1">
                                <span>1</span>
                                <span>{maxPossibleCards} (max with {maxPlayers} players)</span>
                            </div>
                        </div>

                        {/* Ending Hand Size */}
                        <div>
                            <label className="block text-white mb-3 font-medium">
                                Ending Hand Size: {endingHandSize}
                            </label>
                            <input
                                type="range"
                                min={1}
                                max={maxPossibleCards}
                                value={endingHandSize}
                                onChange={(e) => handleEndingHandChange(Number(e.target.value))}
                                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex justify-between text-white/60 text-sm mt-1">
                                <span>1</span>
                                <span>{maxPossibleCards}</span>
                            </div>
                        </div>

                        {/* Game Summary */}
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-white/80 text-sm">
                                <div className="mb-2">
                                    <span className="font-semibold">Total Rounds:</span> {totalRounds}
                                </div>
                                <div>
                                    <span className="font-semibold">Hand Progression:</span>{' '}
                                    {startingHandSize} → {endingHandSize}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }}
        />
    );
}
