import GameInfo from '../GameInfo';

export default function WarInHeavenInfo() {
    return (
        <GameInfo
            gameType="WAR_IN_HEAVEN"
            title="War in Heaven"
            description="An asymmetrical two-player strategy game set on a hexagonal battlefield. Command armies of Angels or Demons, each with unique abilities and movement patterns. Deploy troops, control sacred gates, and lead your faction to victory through tactical combat and strategic positioning."
            minPlayers={2}
            maxPlayers={2}
            difficulty="4 / 5"
            estimatedTime="45-60 min"
            tags={['Strategy', 'Hex Grid', 'Asymmetric', 'Tactical Combat', '2-Player']}
            howToPlay={`**Overview:**
War in Heaven is a deep tactical game where Angels and Demons battle for control of the celestial realm. Each faction has unique characters with special abilities, and victory requires careful resource management, strategic positioning, and tactical combat.

**Game Structure:**
• The game is played over multiple rounds (maximum 12)
• Each round consists of 4 phases: Recharge, Action, Combat, and End
• Players alternate between Angels and Demons

**Phases:**

**1. Recharge Phase**
• Click depleted (gray) tokens in your card panel to recharge them
• Base: 1 recharge per turn
• +1 bonus if you control more gate hexes than your opponent
• +1 bonus if Mammon is on the battlefield (Demons only)

**2. Action Phase (3 actions)**
• **Move:** Click a token, then click a valid destination hex
• **Deploy:** Drag a token from a card to your deploy zone (A1/B1 for Angels, A9/B9 for Demons)
• **Special Abilities:** Use character-specific powers

**3. Combat Phase**
• Click "Declare Battle"
• Select your attackers by clicking friendly tokens (yellow highlight)
• Select target by clicking enemy token (red highlight)
• Click "Resolve Combat" to execute
• Total attack vs. defense determines casualties
• Defender strikes back at weakest attackers first

**4. End Phase**
• Click "End Turn" to pass control to your opponent

**Special Movement:**
• **Standard:** Move 1 adjacent hex
• **Uriel/Leviathen:** Move up to 2 hexes, can phase through occupied spaces
• **Camiel/Asmodeus:** Move any distance in straight line (blocked by gates and other tokens)
• **Jophiel:** After moving, pulls all enemy troops in straight lines one space closer
• **Belphegor:** After moving, pushes all enemy troops in straight lines one space away

**Victory Conditions:**
• **Commander Defeat:** Eliminate the enemy commander (Michael or Lucifer)
• **Zadkiel's Triumph:** (Angels) Control all 4 gate hexes with Zadkiel on the board
• **Beelzebub's Horde:** (Demons) Have all demon allies on the battlefield with Beelzebub present
• **Round 12 Tiebreaker:** Player with most tokens on board wins

**Strategic Tips:**
• Control gate hexes for extra recharges
• Protect your commander at all costs
• Use special movement abilities to gain positional advantage
• Coordinate multi-token attacks for maximum damage
• Deploy Gabriel (Angels) or Baal (Demons) to boost your forces in combat
• Save special abilities (Michael/Lucifer teleport) for critical moments

**Resources:**
• Each character card has tokens that can be deployed
• Active tokens (bright) can be used for deployment costs
• Depleted tokens (gray) must be recharged before reuse
• Managing your token economy is key to victory`}
        />
    );
}
