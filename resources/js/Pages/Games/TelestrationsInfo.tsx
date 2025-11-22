import GameInfo from './GameInfo';

export default function TelestrationsInfo() {
    return (
        <GameInfo
            gameType="TELESTRATIONS"
            title="Telestrations"
            description="The hilarious drawing and guessing game! Draw what you see, then guess what you saw. As prompts pass from player to player, watch how a simple word transforms through drawings and guesses into something completely unexpected. Laughter guaranteed!"
            minPlayers={4}
            maxPlayers={8}
            difficulty="1 / 5"
            estimatedTime="20-30 min"
            tags={['Party', 'Drawing', 'Guessing', 'Hilarious']}
            howToPlay={`**Overview:**
Telestrations combines the classic games of Telephone and Pictionary. Players alternate between drawing and guessing as prompts are passed around the table.

**Setup:**
• Each player receives a word or phrase to draw
• You'll need your drawing skills (or lack thereof!) and imagination

**How It Works:**

**Round 1 - Draw:**
• You receive a prompt (a word or phrase)
• Draw it in the time allowed
• Pass your drawing to the next player

**Round 2 - Guess:**
• You receive someone else's drawing
• Guess what they were trying to draw
• Write your guess and pass it on

**Round 3 - Draw Again:**
• You receive someone's guess
• Draw what they wrote
• Pass your new drawing on

This continues until your original prompt makes it all the way around!

**The Reveal:**
• At the end, everyone shares their "stories"
• Watch how the original word transformed through drawings and guesses
• Laugh at the hilarious misinterpretations
• Everyone's a winner in this game!

**Tips for Fun:**
• Don't overthink your drawings - bad drawings are funnier!
• Be creative with your guesses
• Time pressure adds to the chaos
• The journey is more fun than the destination
• Stick figures are your friend`}
        />
    );
}
