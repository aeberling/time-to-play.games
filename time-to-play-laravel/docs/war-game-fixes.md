# War Game Fixes - Session Documentation

This document details all fixes applied to the War game during the debugging session. These patterns should be applied to all other games (Swoop, Oh Hell, etc.).

## Critical Fixes Applied

### 1. WebSocket Port Conflict

**Problem**: WebSocket connection failures on port 8080
```
WebSocket connection to 'ws://localhost:8080/app/...' failed
```

**Root Cause**: Port 8080 was occupied by another application ("Schnitzel Sprechen")

**Fix**: Changed Reverb port to 8081
- Updated `.env`:
  ```env
  REVERB_PORT=8081
  VITE_REVERB_PORT=8081
  ```
- Restarted Reverb: `php artisan reverb:start --host=0.0.0.0 --port=8081`
- Restarted Vite dev server

---

### 2. Player Index Calculation (CRITICAL - APPLY TO ALL GAMES)

**Problem**: Players showed "Not your turn" errors and 0 cards despite API returning correct data

**Root Cause**: Frontend calculated `playerIndex` using array position instead of the database `player_index` field
```typescript
// WRONG - array position can differ from database player_index
playerIndex = game.game_players.findIndex((p) => p.user_id === userId);
```

**Database Reality**:
- User 2 → `player_index: 0`
- User 3 → `player_index: 1`
- Array positions don't match database indices

**Fix**: Use database `player_index` field directly

**File**: `resources/js/store/gameStore.ts`

```typescript
// In fetchGameState function (lines 195-239)

// OLD CODE (WRONG):
const playerIndex = game.game_players.findIndex(
    (p) => p.user_id === userId
);

// NEW CODE (CORRECT):
let playerIndex = -1;
let isReady = false;

if (userId) {
    // Find the current player's game_player record
    const currentPlayer = game.game_players.find(
        (p) => p.user_id === userId
    );

    if (currentPlayer) {
        // Use the player_index from the database, not array position
        playerIndex = currentPlayer.player_index;
        isReady = currentPlayer.is_ready || false;
    }
}

set({
    currentGame: game,
    gameState: state,
    playerIndex: playerIndex >= 0 ? playerIndex : null,
    currentUserId: userId ?? null,
    isReady,
    loading: false
});
```

**⚠️ IMPORTANT**: This fix MUST be applied to Swoop and Oh Hell games!

---

### 3. Auth Data Access (CRITICAL - APPLY TO ALL GAMES)

**Problem**: `currentUserId` was undefined, showing as `currentUserId: undefined` in logs

**Root Cause**: Attempted to access `window.auth` which doesn't exist in Inertia.js
```typescript
// WRONG - Inertia doesn't use window.auth
const currentUserId = (window as any).auth?.user?.id;
```

**Fix**: Accept `currentUserId` as parameter from Inertia page props

**File**: `resources/js/store/gameStore.ts`

```typescript
// Add to interface (line 195)
fetchGameState: (gameId: number, currentUserId?: number) => Promise<void>;

// Add to state
currentUserId: number | null;

// Modified function signature
fetchGameState: async (gameId, currentUserId) => {
    // Use provided currentUserId or fall back to stored value
    const userId = currentUserId ?? get().currentUserId;

    // ... rest of function
}
```

**File**: `resources/js/Pages/Games/War.tsx`

```typescript
// Pass auth.user.id from Inertia props (line 44)
useEffect(() => {
    fetchGameState(gameId, auth.user.id);
    subscribeToGame(gameId);

    return () => {
        unsubscribeFromGame(gameId);
    };
}, [gameId, auth.user.id]);
```

**⚠️ IMPORTANT**: All games must pass `auth.user.id` to `fetchGameState()`!

---

### 4. Queue Worker Required for Real-Time Updates

**Problem**: "I have to refresh on both sides to see the game state. Nothing is getting pushed automatically in real time."

**Root Cause**: Laravel broadcasts were being queued but never processed - no queue worker was running

**Fix**: Start Laravel queue worker
```bash
php artisan queue:work --tries=3
```

**Why This Matters**:
- Laravel Reverb broadcasts are queued by default
- Without a queue worker, WebSocket events never get sent
- This is REQUIRED for real-time gameplay

**Development Setup**:
Add this to your development workflow - the queue worker must be running alongside:
1. `php artisan serve`
2. `php artisan reverb:start`
3. `php artisan queue:work` ← Often forgotten!
4. `npm run dev`

---

### 5. Game Engine - Preserve Played Cards for Animation

**Problem**: Backend immediately cleared `cardsInPlay` after round resolution, preventing frontend animation

**Fix**: Store played cards in `lastAction` before clearing

**File**: `app/Games/Engines/WarEngine.php`

```php
private function playerWinsRound(array $state, int $winnerIndex): array
{
    // Collect all cards in play
    $allCards = array_merge(
        $state['cardsInPlay']['player1'],
        $state['cardsInPlay']['player2']
    );

    // Store the played cards before clearing them (for frontend animation)
    $playedCards = [
        'player1' => $state['cardsInPlay']['player1'],
        'player2' => $state['cardsInPlay']['player2'],
    ];

    // Add to winner's deck (at bottom)
    $deckKey = $winnerIndex === 0 ? 'player1Deck' : 'player2Deck';
    $state[$deckKey] = array_merge($state[$deckKey], $allCards);

    // Clear cards in play
    $state['cardsInPlay'] = [
        'player1' => [],
        'player2' => [],
    ];

    $state['lastAction'] = [
        'type' => 'WIN_ROUND',
        'winner' => $winnerIndex,  // Number, not string
        'winnerName' => $winnerIndex === 0 ? 'PLAYER_1' : 'PLAYER_2',
        'cardsWon' => count($allCards),
        'playedCards' => $playedCards,  // NEW - preserved for animation
        'timestamp' => now()->toISOString(),
    ];

    // Check if game is over
    if (empty($state['player1Deck']) || empty($state['player2Deck'])) {
        $state = $this->endGame($state, $winnerIndex);
    }

    return $state;
}
```

**Pattern**: Any game that shows "what just happened" needs to preserve action data in `lastAction`

---

### 6. Two-Effect Animation Pattern (Advanced)

**Problem**: Animation either showed multiple times or got stuck and never cleared

**Root Causes**:
1. Effect depending on `gameState` re-ran constantly, triggering animation repeatedly
2. Timer cleanup being called when `gameState` changed, canceling the clear timer

**Solution**: Split into TWO separate effects with different dependencies

**File**: `resources/js/Pages/Games/War.tsx`

```typescript
// Animation state (lines 37-40)
const [roundWinner, setRoundWinner] = useState<number | null>(null);
const [showingResult, setShowingResult] = useState(false);
const [animationCards, setAnimationCards] = useState<{player1: Card[], player2: Card[]} | null>(null);
const [lastShownTimestamp, setLastShownTimestamp] = useState<string | null>(null);

// Effect 1: Detect when a round is resolved (lines 52-74)
useEffect(() => {
    const warState = gameState as WarGameState | null;
    if (!warState || !warState.lastAction) return;

    // Check if this is a WIN_ROUND action with played cards
    if (warState.lastAction.type === 'WIN_ROUND' &&
        warState.lastAction.playedCards &&
        warState.lastAction.winner !== undefined &&
        warState.lastAction.timestamp &&
        warState.lastAction.timestamp !== lastShownTimestamp) {

        console.log('Showing new round result:', warState.lastAction.timestamp);

        // Mark this action as shown (prevents duplicates)
        setLastShownTimestamp(warState.lastAction.timestamp);

        // Show the cards that were played and the winner
        setAnimationCards(warState.lastAction.playedCards);
        setRoundWinner(warState.lastAction.winner);
        setShowingResult(true);
    }
}, [gameState, lastShownTimestamp]);

// Effect 2: Clear the animation after a delay (lines 76-92)
useEffect(() => {
    if (!showingResult) return;

    console.log('Setting timer to clear animation...');
    const timer = setTimeout(() => {
        console.log('Clearing animation...');
        setShowingResult(false);
        setRoundWinner(null);
        setAnimationCards(null);
    }, 1500);

    return () => {
        console.log('Cleaning up timer...');
        clearTimeout(timer);
    };
}, [showingResult]);  // Only depends on showingResult, NOT gameState!
```

**Why This Works**:
- Effect 1 detects new actions and starts the animation
- Effect 2 manages the timer independently
- Timer won't be canceled by unrelated gameState changes
- Timestamp tracking prevents showing the same action twice

**Card Display Logic** (prevents stale cards):
```typescript
// Show animation cards if available, otherwise show actual cards in play
// Only show cardsInPlay if we're NOT in the middle of showing results
const myCardsInPlay = animationCards && playerIndex !== null
    ? (playerIndex === 0 ? animationCards.player1 : animationCards.player2)
    : (!showingResult && warState && playerIndex !== null
        ? (playerIndex === 0 ? warState.cardsInPlay.player1 : warState.cardsInPlay.player2)
        : []);
```

---

### 7. UI/UX Improvements

**Layout Changes**:
- Removed "War Depth" display (confusing to users)
- Centered cards in battle zone with gradient background
- Added "VS" divider between cards
- Added small labels "Your Card" and "Opponent's Card"
- Winner's card scales up 125% with green ring
- Loser's card scales down 90% with reduced opacity
- Bouncing status message shows who won

**Battle Zone Layout**:
```tsx
<div className="relative py-8 my-8 bg-gradient-to-b from-gray-50 to-white rounded-lg border-2 border-gray-200">
    <div className="flex items-center justify-center gap-8">
        {/* Opponent's Card */}
        <div className="flex flex-col items-center gap-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Opponent's Card</div>
            <div className={`transform transition-all duration-500 ${
                showingResult && roundWinner !== playerIndex
                    ? 'scale-125 -translate-y-2'
                    : showingResult && roundWinner === playerIndex
                    ? 'scale-90 translate-y-2 opacity-50'
                    : ''
            }`}>
                {/* Card rendering with conditional green ring */}
            </div>
        </div>

        {/* VS Divider */}
        <div className="text-2xl font-bold text-gray-400">VS</div>

        {/* Your Card */}
        <div className="flex flex-col items-center gap-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Your Card</div>
            {/* Similar structure with opposite conditions */}
        </div>
    </div>

    {/* Battle Status */}
    {showingResult && (
        <div className="absolute inset-x-0 -bottom-8 text-center">
            <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium text-sm animate-bounce">
                {roundWinner === playerIndex ? '🎉 You won this round!' : '😔 Opponent won this round'}
            </div>
        </div>
    )}
</div>
```

---

## Checklist for Applying Fixes to Other Games

### Swoop Game
- [ ] Check `playerIndex` calculation - use `currentPlayer.player_index` from database
- [ ] Ensure `fetchGameState()` accepts `currentUserId` parameter
- [ ] Verify Swoop.tsx passes `auth.user.id` to `fetchGameState()`
- [ ] Add `currentUserId` to store state
- [ ] Check if animations need two-effect pattern
- [ ] Verify WebSocket subscriptions work with queue worker

### Oh Hell Game
- [ ] Check `playerIndex` calculation - use `currentPlayer.player_index` from database
- [ ] Ensure `fetchGameState()` accepts `currentUserId` parameter
- [ ] Verify OhHell.tsx passes `auth.user.id` to `fetchGameState()`
- [ ] Add `currentUserId` to store state
- [ ] Check if animations need two-effect pattern
- [ ] Verify WebSocket subscriptions work with queue worker

### General
- [ ] Document that queue worker must be running for real-time updates
- [ ] Add queue worker to development startup instructions
- [ ] Consider adding timestamp-based deduplication for all game actions
- [ ] Review all game engines for preserving action data in `lastAction`

---

## Key Takeaways

1. **Database is source of truth**: Always use `player_index` from database, never array position
2. **Inertia props, not window**: Auth data comes from page props, not global window object
3. **Queue worker is required**: Real-time updates don't work without it
4. **Separate effect concerns**: Split detection and timer logic into separate useEffects
5. **Preserve action data**: Backend should save relevant data in `lastAction` before clearing state
6. **Timestamp deduplication**: Track `lastShownTimestamp` to prevent duplicate animations

---

## Development Environment Requirements

Required processes for full functionality:
```bash
# Terminal 1 - Laravel server
php artisan serve

# Terminal 2 - Reverb WebSocket server
php artisan reverb:start --host=0.0.0.0 --port=8081

# Terminal 3 - Queue worker (CRITICAL - often forgotten!)
php artisan queue:work --tries=3

# Terminal 4 - Vite dev server
npm run dev
```

All four processes must be running for real-time multiplayer to work correctly.
