1. Starting Positions & Board Layout

  Looking at the board image, I can see a hex grid
   but I need clarification:
  - What are the exact starting positions for the
  Commander and 4 Troops for each faction?

    >> Referencing reference/games/war-in-heaven/board-notes.md, the Angel faction troops will occupy one side while the Demons occupy the other. On one side, the troops occupy [A3][B3][C3][D3] and the commander is on [B2]. On the other, the troops occupy [A7][B7][C7][D7] and the commander is on [B8].

  - The board shows a vertical diamond layout -
  which hexes specifically are the Deploy spaces
  and Gate/Bridge spaces?

    >> I've added these notes to reference/games/war-in-heaven/board-notes.md. The ends are the deploy spaces, the center 4 hexes are the bridge.

  - Can you describe the coordinate system or
  provide a reference for hex positions?

  >> See reference/games/war-in-heaven/board-notes.md

  2. Combat Mechanics - Critical Clarification

  The current rules say "Declare Battle" is an
  action, but I need to understand:
  - Does moving onto an enemy-occupied hex
  automatically trigger combat, or must you use a
  separate "Declare Battle" action?

>> You can't move onto an enemy-occupied hex. It isn't a valid movement. Declare battle is a separate action.

  - If "Declare Battle" is a separate action, can
  tokens attack enemies they're already adjacent
  to without moving?

>> Yes, when a battle is declared, all adjacent characters on the board from opposing factions will battle automatically as a matter of course.

  - When you attack, do ALL your adjacent tokens
  participate, or do you choose which tokens
  attack?

  >> See last answer -- of of them participate at all locations that they are adjacent.

  3. Damage & Health System

  - Do tokens have persistent health, or is damage
   all-or-nothing (either defeated or unharmed)?

>> All or nothing, not damage is kept

  - The combat example shows "Token C takes 3
  damage but survives (needs 4 to defeat)" - does
  this mean damage carries over between turns, or
  is it resolved instantly?

  >> It is resolved instantly, although if one adjacent token hits an opposing token for some damage, another next to the same token would "finish it off" and remaining damage would go to the next token in order.

  4. Token Piece Images

  Looking at the piece images (angels-front.png,
  demons-front.png, etc.):
  - I see tokens with icons and stats like "5×6",
  "3×2", etc.
  - Are these the Attack × Defense values for each
   character?

>> Yes, attack x defense. See the csv files

  - What do the "angels-troop-front.png" and
  "angels-troop-back.png" represent? Are there 4
  identical Troop tokens or 4 different ones?

  >> Every card has a matching token. The ones you are referencing would be the front and back of the angel troop token for "Heaven's Militia". There are 4 identical tokens.

  5. Special Abilities - Timing & Triggers

  - Jophiel/Belphegor: "opponent's Troops in a
  straight line" - does this mean troops in any 
  one of the 6 hex directions, or all troops in
  straight lines?

>> This would be for opponent's troops in any of the 6 hex directions.

  - Raphael: "Deploy 1 of your ready or depleted
  Troops to the battlefield for free" - does
  "ready or depleted" mean active OR inactive
  tokens? And does this mean Raphael can bring
  eliminated troops back from the dead?

>> It means the same as active or inactive. Yes, Raphael can bring eliminated troops back.

  - Gabriel/Baal: Do the stat boosts apply to
  troops already on the battlefield, or only
  troops deployed after Gabriel/Baal is on the
  field?

  >> All troops as long as they are on the battlefield regardless of when they came on.

  6. Alternative Win Conditions - Timing

  - Zadkiel: "Control the Pearly Gates by
  occupying all 4 spaces" - do you win immediately
   when you occupy all 4, or only at the end of
  your turn/round?

>> End of turn, not round

  - Beelzebub: "All of your Allies are on the
  battlefield" - does this include the 6 Ally
  tokens, or also Commander and Troops (all 11
  tokens)?

  >> No, if you look at the csv files you'll see that ally is a subtype that excludes Commander and troops, although if your commander wasn't on the battlefield you would have lost the game.

  7. Assets - Usage Clarification

  I see several asset folders. Can you clarify:
  - icons/ folder - These appear to be character
  portrait icons. Where are these used in the
  game?

>> These are the icons that will be used on the pieces. We will create the piece object for the game rather than creating a png dof each.

  - card-images/ - These are the full card
  designs. Do we use these as-is or are they
  references?

>> To start, we will use them as-is. In an early phase we will convert these to card objects with various attributes that follow a template, so plan for this next phase.

  - pieces/ - These show token front/back. Do we
  need separate images for when tokens are on the
  battlefield vs on cards?

>> We will actually make a piece object rather than making a separate image for each state. That said, they do look slightly different in the active (front) and inactive (back) state.

  - The refresh.png icon in the icons folder -
  what is this used for?

  >> This is used for the back of the pieces to show they can be flipped over.

  8. Deploy Cost Payment

  - Can you use tokens that are on the battlefield
   to pay deploy costs, or only tokens that are on
   cards (off the battlefield)?

>> Off the battlefield only.

  - If you can use battlefield tokens, what
  happens to them? Do they get flipped in place,
  or returned to their card?

  >> You can't. Also, when a piece is removed from the battlefield it comes off inactive.

  9. Gate/Bridge Control

  - For the control bonus recharge: If there's a
  tie in tokens on Gate/Bridge spaces, does anyone
   get the bonus?

>> No bonus for a tie.

  - Can you clarify: is it control at the "end of
  your turn" or "end of the round"?

  >> End of your turn

  10. Round Tracker & First Player

  - Does the First Player change each round, or
  stay the same throughout the game?

>> It stays the same

  - What does the Round Tracker card look like and
   how is it used?

>> The round tracker card will not be needed for the digital format.