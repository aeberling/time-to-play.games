# Telestrations - Phased Implementation Checklist

This document breaks down the Telestrations implementation into manageable phases with clear completion criteria. Each phase builds upon the previous one, allowing for incremental testing and validation.

---

## Overview

**Total Phases:** 6
**Estimated Timeline:** 10-14 development days
**Deployment Target:** Production-ready party game

---

## Phase 1: Foundation & Type Definitions

**Goal:** Set up the basic type system and project structure
**Duration:** 0.5 days
**Dependencies:** None

### TypeScript Types

- [ ] Add `'TELESTRATIONS'` to `GameType` union in `/resources/js/types/index.d.ts`
- [ ] Create `TelestrationsPage` interface
  - [ ] Define `type: 'prompt' | 'drawing' | 'guess'`
  - [ ] Add author/artist/guesser ID fields
  - [ ] Add text and imageData optional fields
  - [ ] Add timestamp field
- [ ] Create `TelestrationsSketchbook` interface
  - [ ] Define `ownerId` and `currentHolderId`
  - [ ] Add `pages: TelestrationsPage[]`
- [ ] Create `TelestrationsGameState` interface
  - [ ] Player and game info fields
  - [ ] Round tracking fields
  - [ ] Phase enum definition
  - [ ] Sketchbooks array
  - [ ] Submission tracking arrays
  - [ ] Scoring fields
  - [ ] History and action tracking
- [ ] Add `TelestrationsGameState` to `GameState` union type

### Verification
- [ ] Run `npm run build` - no TypeScript errors
- [ ] Commit with message: "feat: Add TypeScript types for Telestrations game"

---

## Phase 2: Backend Game Engine (Core Logic)

**Goal:** Implement the complete game engine with all validation and state management
**Duration:** 2-3 days
**Dependencies:** Phase 1

### Engine File Setup

- [ ] Create `/app/Games/Engines/TelestrationEngine.php`
- [ ] Implement `GameEngineInterface`
- [ ] Add class-level documentation

### Basic Configuration Methods

- [ ] Implement `getGameType()` - return `'TELESTRATIONS'`
- [ ] Implement `getName()` - return `'Telestrations'`
- [ ] Implement `getConfig()` - return min/max players, description, etc.
  - [ ] Min players: 4
  - [ ] Max players: 8
  - [ ] Description
  - [ ] Difficulty: Medium
  - [ ] Estimated duration: 20-40 minutes
  - [ ] Requires strategy: true

### State Initialization

- [ ] Implement `initializeGame(array $players, array $options = []): array`
  - [ ] Validate player count (4-8)
  - [ ] Extract options: rounds (default 3), scoring enabled (default true)
  - [ ] Initialize player array
  - [ ] Calculate `maxTurns` (= playerCount)
  - [ ] Create sketchbook structure for each player
  - [ ] Initialize all tracking arrays (submitted, ready, scores)
  - [ ] Set initial phase to `'INITIAL_PROMPT'`
  - [ ] Initialize empty play history
  - [ ] Return complete state array

### Move Validation

- [ ] Implement `validateMove(array $state, array $move, int $playerIndex): ValidationResult`
  - [ ] Extract `action` from move
  - [ ] **SUBMIT_PROMPT validation:**
    - [ ] Check phase is `'INITIAL_PROMPT'`
    - [ ] Validate prompt exists and is not empty
    - [ ] Check length <= 100 characters
    - [ ] Verify player hasn't already submitted this turn
  - [ ] **SUBMIT_DRAWING validation:**
    - [ ] Check phase is `'DRAWING'`
    - [ ] Validate imageData exists
    - [ ] Verify base64 format with regex
    - [ ] Check player hasn't already submitted
  - [ ] **SUBMIT_GUESS validation:**
    - [ ] Check phase is `'GUESSING'`
    - [ ] Validate guess exists and is not empty
    - [ ] Check length <= 100 characters
    - [ ] Verify player hasn't already submitted
  - [ ] **CONTINUE_ROUND validation:**
    - [ ] Check phase is `'ROUND_OVER'`
  - [ ] Return appropriate `ValidationResult`

### Move Application

- [ ] Implement `applyMove(array $state, array $move, int $playerIndex): array`
  - [ ] **SUBMIT_PROMPT handler:**
    - [ ] Add page to player's own sketchbook
    - [ ] Mark player as submitted
  - [ ] **SUBMIT_DRAWING handler:**
    - [ ] Find which sketchbook player currently holds
    - [ ] Add drawing page to that sketchbook
    - [ ] Mark player as submitted
  - [ ] **SUBMIT_GUESS handler:**
    - [ ] Find which sketchbook player currently holds
    - [ ] Add guess page to that sketchbook
    - [ ] Mark player as submitted
  - [ ] **CONTINUE_ROUND handler:**
    - [ ] Set player ready flag to true
  - [ ] Update play history with action
  - [ ] Check if all players submitted/ready
  - [ ] If yes, call `advancePhase()`
  - [ ] Return updated state

### Phase Management

- [ ] Implement `advancePhase(array $state): array` helper
  - [ ] Reset `submittedThisTurn` array
  - [ ] **From INITIAL_PROMPT:**
    - [ ] Rotate sketchbooks
    - [ ] Set phase to `'DRAWING'`
    - [ ] Set currentTurn to 1
  - [ ] **From DRAWING:**
    - [ ] Rotate sketchbooks
    - [ ] Increment currentTurn
    - [ ] If currentTurn > maxTurns, go to `'REVEAL'` and calculate scores
    - [ ] Else go to `'GUESSING'`
  - [ ] **From GUESSING:**
    - [ ] Rotate sketchbooks
    - [ ] Increment currentTurn
    - [ ] If currentTurn > maxTurns, go to `'REVEAL'` and calculate scores
    - [ ] Else go to `'DRAWING'`
  - [ ] **From REVEAL:**
    - [ ] If all ready, go to `'ROUND_OVER'`
  - [ ] **From ROUND_OVER:**
    - [ ] If all ready and currentRound < rounds, start next round
    - [ ] If all ready and currentRound >= rounds, go to `'GAME_OVER'`

### Helper Methods

- [ ] Implement `rotateSketchbooks(array $state): array`
  - [ ] For each sketchbook, increment `currentHolderId` with modulo
  - [ ] Return updated state
- [ ] Implement `findSketchbookHeldBy(array $state, int $playerIndex): int`
  - [ ] Loop through sketchbooks
  - [ ] Return sketchbook ID where `currentHolderId === $playerIndex`
- [ ] Implement `allPlayersSubmitted(array $state): bool`
  - [ ] Return true if all values in `submittedThisTurn` are true
- [ ] Implement `allPlayersReady(array $state): bool`
  - [ ] Return true if all values in `playersReadyToContinue` are true
- [ ] Implement `startNextRound(array $state): array`
  - [ ] Increment `currentRound`
  - [ ] Reset currentTurn to 0
  - [ ] Clear all sketchbook pages
  - [ ] Reset submission and ready flags
  - [ ] Set phase back to `'INITIAL_PROMPT'`
  - [ ] Return state

### Scoring Logic

- [ ] Implement `calculateRoundScores(array $state): array`
  - [ ] Skip if scoring disabled
  - [ ] For each sketchbook:
    - [ ] Extract original prompt (first page)
    - [ ] Extract final guess (last page)
    - [ ] Loop through all guess pages
    - [ ] Calculate similarity to original prompt
    - [ ] Award points based on similarity (10 for exact, 5 for close)
    - [ ] Bonus points to prompt owner if final matches original
  - [ ] Return updated state
- [ ] Implement `calculateSimilarity(string $str1, string $str2): float`
  - [ ] Use `similar_text()` or Levenshtein distance
  - [ ] Return normalized score 0.0-1.0

### Game Over Logic

- [ ] Implement `checkGameOver(array $state): array`
  - [ ] If phase is `'GAME_OVER'`, return `['isOver' => true, 'placements' => [...]]`
  - [ ] Calculate placements by sorting players by score (descending)
  - [ ] Return placement array (0-indexed player indices)
  - [ ] Else return `['isOver' => false]`

### Player View & Serialization

- [ ] Implement `getPlayerView(array $state, int $playerIndex): array`
  - [ ] Return full state (no hidden information in Telestrations)
  - [ ] Could optionally hide other players' current sketchbook content during active phases
- [ ] Implement `serializeState(array $state): string`
  - [ ] Return `json_encode($state)`
- [ ] Implement `deserializeState(string $state): array`
  - [ ] Return `json_decode($state, true)`

### Registration

- [ ] Register engine in `/app/Games/GameRegistry.php`
  - [ ] Add `$this->register(new TelestrationEngine());` to constructor or init method

### Testing

- [ ] Create `/tests/Unit/Games/TelestrationEngineTest.php`
- [ ] Test: Game initialization with 4, 6, and 8 players
- [ ] Test: Prompt validation (valid, empty, too long)
- [ ] Test: Drawing validation (valid, invalid format)
- [ ] Test: Guess validation (valid, empty, too long)
- [ ] Test: Sketchbook rotation after prompt phase
- [ ] Test: Phase transitions (INITIAL_PROMPT → DRAWING → GUESSING → REVEAL)
- [ ] Test: Full round completion (all phases)
- [ ] Test: Multi-round progression
- [ ] Test: Game over detection
- [ ] Test: Scoring calculation
- [ ] Run tests: `php artisan test --filter=TelestrationEngine`

### Verification
- [ ] All unit tests passing
- [ ] Code reviewed for edge cases
- [ ] Commit: "feat: Implement TelestrationEngine with full game logic"

---

## Phase 3: Drawing Canvas Component

**Goal:** Build a reusable, feature-rich drawing canvas
**Duration:** 1-2 days
**Dependencies:** Phase 1

### Canvas Component Setup

- [ ] Create `/resources/js/Components/DrawingCanvas.tsx`
- [ ] Define `DrawingCanvasProps` interface
  - [ ] `onComplete: (imageData: string) => void`
  - [ ] `width?: number` (default 600)
  - [ ] `height?: number` (default 400)
  - [ ] `disabled?: boolean`
- [ ] Set up component with canvas ref

### Canvas Initialization

- [ ] useEffect hook to get 2D context
- [ ] Set canvas background to white on mount
- [ ] Store context in state

### Drawing State Management

- [ ] State: `isDrawing` boolean
- [ ] State: `currentColor` string (default '#000000')
- [ ] State: `lineWidth` number (default 2)
- [ ] State: `context` (CanvasRenderingContext2D | null)

### Mouse Event Handlers

- [ ] `startDrawing(e: React.MouseEvent)` - begin path on mousedown
  - [ ] Calculate x, y from event and canvas rect
  - [ ] Set isDrawing to true
  - [ ] Begin new path at (x, y)
- [ ] `draw(e: React.MouseEvent)` - draw line on mousemove
  - [ ] Only if isDrawing
  - [ ] Calculate current x, y
  - [ ] Set stroke style and line width
  - [ ] Draw line to (x, y)
  - [ ] Stroke the path
- [ ] `stopDrawing()` - end path on mouseup/mouseleave
  - [ ] Close path
  - [ ] Set isDrawing to false

### Touch Event Support (Mobile)

- [ ] `handleTouchStart(e: React.TouchEvent)`
  - [ ] Prevent default behavior
  - [ ] Convert touch to mouse event
  - [ ] Call startDrawing
- [ ] `handleTouchMove(e: React.TouchEvent)`
  - [ ] Prevent default
  - [ ] Convert touch to mouse event
  - [ ] Call draw
- [ ] `handleTouchEnd()` - call stopDrawing

### Drawing Tools UI

- [ ] Color picker input
  - [ ] Label: "Color:"
  - [ ] Type: color
  - [ ] Controlled by currentColor state
  - [ ] onChange updates currentColor
- [ ] Brush size slider
  - [ ] Label: "Brush:"
  - [ ] Type: range (1-20)
  - [ ] Controlled by lineWidth state
  - [ ] onChange updates lineWidth
- [ ] Clear button
  - [ ] onClick: fill canvas with white
- [ ] Submit button
  - [ ] onClick: call submitDrawing()
  - [ ] Disabled if prop disabled is true

### Canvas Export

- [ ] `submitDrawing()` function
  - [ ] Get canvas element from ref
  - [ ] Call `canvas.toDataURL('image/png')`
  - [ ] Pass result to `onComplete` callback

### Optional Enhancements

- [ ] Eraser tool (draw with white color)
- [ ] Undo/redo functionality (store stroke history)
- [ ] Line smoothing for better drawing quality
- [ ] Responsive canvas sizing

### Styling

- [ ] Tailwind classes for layout
- [ ] Cursor: crosshair when over canvas
- [ ] Border around canvas
- [ ] Tool panel layout (flex row, gap-4)
- [ ] Responsive design (stack vertically on mobile)

### Testing

- [ ] Render canvas in isolation
- [ ] Test color picker changes state
- [ ] Test brush size slider
- [ ] Test clear button resets canvas
- [ ] Test submit calls onComplete with base64 string
- [ ] Manual testing: draw on canvas, verify strokes appear

### Verification
- [ ] Canvas renders correctly
- [ ] Drawing with mouse works smoothly
- [ ] Drawing with touch works on mobile
- [ ] Color and brush size controls work
- [ ] Clear button resets canvas
- [ ] Submit returns valid base64 PNG
- [ ] Commit: "feat: Add DrawingCanvas component with touch support"

---

## Phase 4: Frontend Game Component (Main UI)

**Goal:** Build the main Telestrations game page with all phases
**Duration:** 3-4 days
**Dependencies:** Phase 1, 3

### Main Component Setup

- [ ] Create `/resources/js/Pages/Games/Telestrations.tsx`
- [ ] Define `TelestrationsProps` interface extending `PageProps`
  - [ ] Add `gameId: number`
- [ ] Set up component with all hooks

### State Management Integration

- [ ] Import and destructure from `useGameStore()`
  - [ ] gameState, currentGame, playerIndex
  - [ ] isConnected, isReady, error, loading
  - [ ] fetchGameState, subscribeToGame, unsubscribeFromGame
  - [ ] toggleReady, makeMove, cancelGame, leaveGame
- [ ] Cast gameState to `TelestrationsGameState | null`
- [ ] Local state for sidebar collapse
- [ ] Local state for current prompt/guess inputs
- [ ] Local state for reveal gallery navigation

### Game Initialization (useEffect)

- [ ] Check for `?join=true` URL parameter
- [ ] If present, attempt to join game
  - [ ] POST to `/api/games/{gameId}/join`
  - [ ] Handle success and failure cases
  - [ ] Remove parameter from URL after join
- [ ] Fetch game state with current user ID
- [ ] Subscribe to WebSocket channels
- [ ] Cleanup: unsubscribe on unmount
- [ ] Set timeout for loading message (5 seconds)

### Phase Components - Initial Prompt

- [ ] Create `InitialPromptPhase` component
- [ ] Local state: `prompt` (string)
- [ ] Check if player has submitted: `teleState.submittedThisTurn[playerIndex]`
- [ ] **If submitted:** Show waiting screen
  - [ ] Message: "Waiting for other players..."
  - [ ] List all players with checkmarks for submitted
- [ ] **If not submitted:** Show input form
  - [ ] Text input (max 100 chars)
  - [ ] Placeholder: "Enter a prompt to draw..."
  - [ ] Submit button (disabled if empty)
  - [ ] onClick: call `makeMove` with `SUBMIT_PROMPT` action
  - [ ] Clear input after submit

### Phase Components - Drawing

- [ ] Create `DrawingPhase` component
- [ ] Find current sketchbook held by player
  - [ ] `teleState.sketchbooks.find(sb => sb.currentHolderId === playerIndex)`
- [ ] Get last page from sketchbook (prompt or guess to draw)
- [ ] Extract `promptText` from last page
- [ ] **If submitted:** Show waiting screen
  - [ ] Message: "Waiting for other players to finish drawing..."
  - [ ] Progress indicator (X/Y players submitted)
- [ ] **If not submitted:** Show drawing interface
  - [ ] Display prompt text prominently ("Draw This: ...")
  - [ ] Render `<DrawingCanvas />` component
  - [ ] onComplete: call `makeMove` with `SUBMIT_DRAWING` action

### Phase Components - Guessing

- [ ] Create `GuessingPhase` component
- [ ] Local state: `guess` (string)
- [ ] Find current sketchbook held by player
- [ ] Get last page (should be a drawing)
- [ ] Extract `imageData` from last page
- [ ] **If submitted:** Show waiting screen
  - [ ] Message: "Waiting for other players..."
  - [ ] Progress indicator
- [ ] **If not submitted:** Show guessing interface
  - [ ] Display drawing as `<img src={imageData} />`
  - [ ] Heading: "What is this drawing?"
  - [ ] Text input (max 100 chars)
  - [ ] Placeholder: "What do you think this is?"
  - [ ] Submit button (disabled if empty)
  - [ ] onClick: call `makeMove` with `SUBMIT_GUESS` action

### Phase Components - Reveal (Gallery)

- [ ] Create `RevealPhase` component
- [ ] Local state: `activeSketchbookId` (number, default 0)
- [ ] Local state: `pageIndex` (number, default 0)
- [ ] Get current sketchbook and page from state
- [ ] Navigation controls:
  - [ ] Previous button (disabled at start)
  - [ ] Next button (disabled at end)
  - [ ] Display: "Sketchbook X of Y - Page A of B"
- [ ] Page rendering based on type:
  - [ ] **Prompt page:** Large text display, author name
  - [ ] **Drawing page:** Image display, artist name
  - [ ] **Guess page:** Large text display, guesser name
- [ ] Navigation functions:
  - [ ] `nextPage()` - increment pageIndex, or move to next sketchbook
  - [ ] `prevPage()` - decrement pageIndex, or move to previous sketchbook
- [ ] Continue button
  - [ ] onClick: `makeMove({ action: 'CONTINUE_ROUND' })`
  - [ ] Show "Waiting..." if player already ready

### Phase Components - Round Over

- [ ] Create `RoundOverPhase` component
- [ ] Display round summary:
  - [ ] "Round {currentRound} of {rounds} Complete!"
  - [ ] Scoreboard (if scoring enabled)
  - [ ] Player names and scores
  - [ ] Sort by score descending
- [ ] Continue button
  - [ ] If currentRound < rounds: "Start Next Round"
  - [ ] If currentRound >= rounds: "View Final Results"
  - [ ] onClick: `makeMove({ action: 'CONTINUE_ROUND' })`

### Phase Components - Game Over

- [ ] Create `GameOverPhase` component
- [ ] Display final results:
  - [ ] "Game Complete!"
  - [ ] Final scoreboard with placements
  - [ ] Winner announcement (if scoring enabled)
  - [ ] MVP (most creative drawings - optional future feature)
- [ ] Action buttons:
  - [ ] "Return to Lobby" - router.visit('/dashboard')
  - [ ] "Play Again" - create new game with same settings

### Sidebar Component

- [ ] Create `Sidebar` component
- [ ] Game info section:
  - [ ] Round: X / Y
  - [ ] Turn: A / B (hide if in INITIAL_PROMPT or REVEAL)
  - [ ] Phase: Current phase name
  - [ ] Time remaining (if timer enabled)
- [ ] Players list:
  - [ ] Map over `teleState.players`
  - [ ] Display avatar (if exists)
  - [ ] Display name
  - [ ] Highlight current player (bold)
  - [ ] Show score (if scoring enabled)
  - [ ] Show submission status (✓ if submitted this turn)
  - [ ] Show connection status (dot indicator)
- [ ] Collapse toggle (mobile)

### Waiting Room (Pre-Game)

- [ ] Create `WaitingRoom` component
- [ ] Show when `currentGame.status === 'WAITING'` or `'READY'`
- [ ] Display:
  - [ ] Game name
  - [ ] Game type: "Telestrations"
  - [ ] Player list (current players)
  - [ ] Empty slots for remaining players
  - [ ] Share link button (copy game URL with ?join=true)
- [ ] Ready toggle button
  - [ ] onClick: `toggleReady(gameId)`
  - [ ] Show current ready status
  - [ ] Show how many players are ready
- [ ] Start game button (if all ready)
  - [ ] Only visible to host
  - [ ] onClick: `startGame(gameId)` (handled by store/backend)
- [ ] Leave/Cancel buttons
  - [ ] Leave if not host
  - [ ] Cancel if host

### Main Render Logic

- [ ] Loading state: Show spinner and game name
- [ ] Error state: Show error message with retry option
- [ ] No gameState: Show waiting room
- [ ] gameState exists: Render based on status
  - [ ] WAITING/READY: Waiting room
  - [ ] IN_PROGRESS: Phase-specific component based on `teleState.phase`
  - [ ] COMPLETED: Game over screen

### Layout & Styling

- [ ] Use `AuthenticatedLayout` wrapper
- [ ] Two-column layout (main + sidebar)
  - [ ] Left: 75% width on desktop, 100% on mobile
  - [ ] Right: 25% width on desktop, collapsible on mobile
- [ ] Responsive breakpoints (Tailwind lg: 1024px)
- [ ] Auto-collapse sidebar on mobile on initial load
- [ ] Toggle button for sidebar on mobile

### Error Handling

- [ ] Display error messages from `useGameStore` error state
- [ ] Toast notifications for success/failure (optional)
- [ ] Retry mechanism for failed API calls

### Testing

- [ ] Manual test: Create game, navigate through all phases
- [ ] Test: Join game with ?join=true parameter
- [ ] Test: Submit prompt, drawing, guess
- [ ] Test: View reveal gallery, navigate pages
- [ ] Test: Round over → next round transition
- [ ] Test: Multi-round game completion
- [ ] Test: Mobile responsiveness
- [ ] Test: Sidebar collapse/expand

### Verification
- [ ] All phases render correctly
- [ ] State updates propagate to UI
- [ ] WebSocket updates trigger re-renders
- [ ] Mobile layout works (test on device or browser dev tools)
- [ ] Drawings display correctly in reveal phase
- [ ] Commit: "feat: Add complete Telestrations game UI with all phases"

---

## Phase 5: Prompt Library & Game Options

**Goal:** Add prompt management and game configuration
**Duration:** 1 day
**Dependencies:** Phase 2

### Prompt Library Backend

- [ ] Create `/app/Data/TelestrationsPrompts.php`
- [ ] Define `getCategories()` method
  - [ ] Return array of category IDs and display names
  - [ ] Categories: animals, objects, actions, places, people, abstract, pop_culture
- [ ] Define `getPrompts(string $category, string $difficulty)` method
  - [ ] Return array of prompt objects
  - [ ] Each prompt: `['text' => '...', 'category' => '...', 'difficulty' => '...']`
  - [ ] Filter by category and difficulty
- [ ] Define `getRandomPrompts(int $count, array $filters)` method
  - [ ] Get filtered prompts
  - [ ] Shuffle array
  - [ ] Return first $count items

### Prompt Seeding

- [ ] Create at least 200 prompts across categories
  - [ ] 50 easy prompts (simple objects, animals)
  - [ ] 100 medium prompts (actions, compound objects)
  - [ ] 50 hard prompts (abstract concepts, pop culture references)
- [ ] Distribute across all categories
- [ ] Ensure family-friendly content (no profanity, offensive terms)

### Engine Integration

- [ ] Update `TelestrationEngine::initializeGame()` to use prompts
  - [ ] Check `$options['prompts_source']` ('random' or 'custom')
  - [ ] If 'custom', use `$options['custom_prompts']`
  - [ ] If 'random', call `TelestrationsPrompts::getRandomPrompts()`
  - [ ] Store prompts in state (optional - for auto-prompts in future)

### Game Creation Form (Optional - Dashboard)

- [ ] Update game creation modal/page to include Telestrations options
- [ ] Option: Number of rounds (1-5, default 3)
- [ ] Option: Scoring enabled (boolean, default true)
- [ ] Option: Timer settings (optional)
  - [ ] Drawing time (30-120 seconds, default 60)
  - [ ] Guessing time (15-60 seconds, default 30)
- [ ] Option: Prompt difficulty (easy/medium/hard/mixed)
- [ ] Option: Prompt category (or "all")

### Testing

- [ ] Test: Prompt retrieval with filters
- [ ] Test: Random prompt selection
- [ ] Test: Game initialization with random prompts
- [ ] Test: Game initialization with custom prompts

### Verification
- [ ] Prompts load correctly
- [ ] Game options are respected
- [ ] Commit: "feat: Add prompt library and game configuration options"

---

## Phase 6: Testing, Polish & Deployment

**Goal:** Comprehensive testing, bug fixes, and production deployment
**Duration:** 2-3 days
**Dependencies:** All previous phases

### Backend Integration Tests

- [ ] Create `/tests/Feature/Games/TelestrationGameFlowTest.php`
- [ ] Test: Complete single-round game flow
  - [ ] Create game
  - [ ] Add 4 players
  - [ ] Start game
  - [ ] All players submit prompts
  - [ ] All players submit drawings
  - [ ] All players submit guesses
  - [ ] Verify phase advances correctly
  - [ ] Verify sketchbook rotation
  - [ ] Complete reveal phase
  - [ ] Verify game over
- [ ] Test: Multi-round game (3 rounds)
- [ ] Test: Player leaving mid-game (graceful degradation)
- [ ] Test: Invalid moves are rejected
- [ ] Test: Concurrent move submission (database locking)
- [ ] Run: `php artisan test --filter=TelestrationGameFlow`

### Frontend Component Tests

- [ ] Test DrawingCanvas component
  - [ ] Renders canvas
  - [ ] Color picker updates state
  - [ ] Brush size slider works
  - [ ] Clear button resets canvas
  - [ ] Submit calls callback
- [ ] Test phase components render correctly
  - [ ] Initial prompt shows input when not submitted
  - [ ] Drawing phase shows canvas
  - [ ] Guessing phase shows image and input
  - [ ] Reveal phase shows gallery navigation
- [ ] Run: `npm test` (if test suite configured)

### Manual End-to-End Testing

- [ ] **Test 1: Full 4-player game**
  - [ ] Create game with 4 players
  - [ ] Each player submits prompt
  - [ ] Each player draws
  - [ ] Each player guesses
  - [ ] Verify sketchbooks rotated correctly
  - [ ] Complete all 4 turns
  - [ ] View reveal gallery for all sketchbooks
  - [ ] Verify scores calculated
  - [ ] Start round 2
  - [ ] Complete round 2
  - [ ] View final results
- [ ] **Test 2: 6-player game**
  - [ ] Verify 6 turns per round
  - [ ] Verify all rotations work
- [ ] **Test 3: Mobile device**
  - [ ] Touch drawing works smoothly
  - [ ] Sidebar collapses correctly
  - [ ] All inputs are accessible
  - [ ] Buttons are tappable (not too small)
- [ ] **Test 4: Network issues**
  - [ ] Disable network mid-game
  - [ ] Re-enable network
  - [ ] Verify game state recovers
  - [ ] Verify WebSocket reconnects

### Performance Testing

- [ ] Test image size (drawings)
  - [ ] Draw complex image
  - [ ] Check base64 string length
  - [ ] Verify < 500KB per image
  - [ ] If larger, add compression (see technical plan)
- [ ] Test game state size
  - [ ] Complete full round with 6 players
  - [ ] Check `current_state` column size in database
  - [ ] Should be < 1MB
  - [ ] Log state size in engine
- [ ] Test WebSocket latency
  - [ ] Submit move
  - [ ] Time until other players see update
  - [ ] Should be < 2 seconds

### UI/UX Polish

- [ ] Verify all text is legible (font sizes, contrast)
- [ ] Add loading spinners for async actions
- [ ] Add animations/transitions (optional)
  - [ ] Phase transitions fade in/out
  - [ ] Button hover effects
  - [ ] Card flip animations in reveal
- [ ] Verify error messages are user-friendly
- [ ] Add tooltips for game rules (optional)
- [ ] Accessibility check:
  - [ ] Canvas has aria-label
  - [ ] All buttons have descriptive text
  - [ ] Color contrast meets WCAG AA
  - [ ] Keyboard navigation works (tab order)

### Security Audit

- [ ] Input sanitization:
  - [ ] Prompt text is escaped in display
  - [ ] Guess text is escaped
  - [ ] No XSS vulnerabilities
- [ ] Authorization checks:
  - [ ] Players can only submit to their own games
  - [ ] Non-players cannot make moves
  - [ ] Spectators cannot submit (if spectator mode exists)
- [ ] Rate limiting:
  - [ ] API endpoints are throttled
  - [ ] Verify rate limit in routes/api.php

### Documentation

- [ ] Update README (if exists) with Telestrations setup
- [ ] Add game rules to help section (optional)
- [ ] Document game options for future developers
- [ ] Add comments to complex code sections

### Pre-Deployment Checklist

- [ ] All tests passing: `php artisan test`
- [ ] Frontend builds without errors: `npm run build`
- [ ] No console errors in browser
- [ ] Database migrations (none needed, but verify)
- [ ] Environment variables set correctly (Pusher keys, etc.)
- [ ] Clear all caches: `php artisan cache:clear`

### Staging Deployment

- [ ] Deploy to staging environment
- [ ] Verify WebSocket connection (Echo server running)
- [ ] Test full game flow on staging
- [ ] Check error logs for issues
- [ ] Performance testing on staging
- [ ] Get QA approval (if applicable)

### Production Deployment

- [ ] Deploy backend code
  - [ ] Git push to production branch
  - [ ] CI/CD pipeline runs (if configured)
  - [ ] Verify deployment successful
- [ ] Deploy frontend assets
  - [ ] `npm run build`
  - [ ] Upload to CDN or public folder
  - [ ] Verify assets are accessible
- [ ] Smoke test on production:
  - [ ] Create test game
  - [ ] Join with 2+ accounts
  - [ ] Play through one round
  - [ ] Verify all features work
- [ ] Monitor error logs for first 24-48 hours
- [ ] Set up alerts for critical errors

### Post-Deployment

- [ ] Announce new game to users (email, in-app banner, etc.)
- [ ] Monitor usage metrics:
  - [ ] Games created
  - [ ] Games completed
  - [ ] Average game duration
  - [ ] Error rates
- [ ] Gather user feedback
- [ ] Create backlog for future enhancements

### Verification
- [ ] All tests passing
- [ ] Game playable on production
- [ ] No critical bugs reported in first week
- [ ] Commit: "chore: Telestrations game production-ready"

---

## Phase 7: Future Enhancements (Post-MVP)

**Goal:** Add advanced features based on user feedback
**Duration:** Variable
**Priority:** Low (implement after MVP is stable)

### Advanced Drawing Tools

- [ ] Eraser tool
- [ ] Fill bucket (flood fill)
- [ ] Undo/redo functionality
- [ ] Shape tools (circle, rectangle, line)
- [ ] Text tool (add text to drawing)
- [ ] Layer system (background/foreground)

### Prompt Improvements

- [ ] User-submitted prompts (moderation required)
- [ ] Prompt voting system
- [ ] Themed prompt packs (holidays, movies, etc.)
- [ ] AI-generated prompts (using OpenAI API)

### Replay & Sharing

- [ ] Save completed games to database
- [ ] Replay system (watch drawing process)
- [ ] Export sketchbook as PDF
- [ ] Share on social media (generate preview images)
- [ ] Public gallery of funniest sketchbooks

### Accessibility

- [ ] Voice input for guesses (Web Speech API)
- [ ] Text-to-speech for prompts
- [ ] High contrast mode
- [ ] Keyboard shortcuts for canvas tools
- [ ] Support for screen readers (ARIA labels)

### Mobile App

- [ ] React Native app for iOS/Android
- [ ] Native drawing tools (smoother touch experience)
- [ ] Push notifications for turn reminders
- [ ] Offline mode (draft drawings, sync later)

### Analytics & Gamification

- [ ] Track player stats (games played, win rate, favorite categories)
- [ ] Achievements/badges (e.g., "100 games played", "Perfect match")
- [ ] Leaderboards (seasonal, all-time)
- [ ] Player profiles with stats

### Spectator Mode

- [ ] Allow non-players to watch games
- [ ] Live updates during reveal phase
- [ ] Chat for spectators
- [ ] Betting system (predict outcomes - for fun, no real money)

### AI Features

- [ ] AI drawing analysis (caption generation)
- [ ] AI similarity scoring (better than string matching)
- [ ] AI prompt suggestions based on difficulty
- [ ] AI art style filters (turn drawings into different art styles)

---

## Success Metrics

After deployment, track these KPIs to measure success:

### Engagement Metrics
- [ ] Total Telestrations games created (target: 100+ in first month)
- [ ] Game completion rate (target: >70%)
- [ ] Average players per game (target: 5-6)
- [ ] Repeat play rate (target: >40% of players play 2+ games)

### Technical Metrics
- [ ] Average game state size (target: <500KB)
- [ ] API error rate (target: <1%)
- [ ] WebSocket connection success rate (target: >95%)
- [ ] Average move latency (target: <2 seconds)

### User Satisfaction
- [ ] User feedback rating (target: 4+/5 stars)
- [ ] Bug report rate (target: <5% of games have reported issues)
- [ ] Feature requests collected for next iteration

---

## Risk Mitigation

### Identified Risks & Contingencies

**Risk 1: Drawing canvas performance on low-end devices**
- Mitigation: Test on various devices during Phase 3
- Contingency: Add "simple mode" with lower resolution canvas

**Risk 2: Large image data causing database slowdown**
- Mitigation: Implement compression in Phase 3
- Contingency: Move images to object storage (S3, Cloudinary)

**Risk 3: WebSocket connection issues**
- Mitigation: Use existing tested Echo infrastructure
- Contingency: Add polling fallback for state updates

**Risk 4: Offensive/inappropriate drawings/prompts**
- Mitigation: Start with curated prompt library
- Contingency: Add reporting system, human moderation

**Risk 5: Player abandonment mid-game**
- Mitigation: Add "kick inactive player" feature
- Contingency: Allow game to continue with fewer players

---

## Completion Criteria

Telestrations is considered **production-ready** when:

- [x] All phases (1-6) are 100% complete
- [ ] All automated tests passing
- [ ] Manual E2E test completed successfully
- [ ] At least 3 full games played by beta testers without critical bugs
- [ ] Performance metrics within targets
- [ ] Security audit passed
- [ ] Deployed to production without rollback
- [ ] Monitoring in place for errors and usage

---

## Team Assignments (if applicable)

If working with a team, assign phases to developers:

- **Backend Developer:** Phases 2, 5
- **Frontend Developer:** Phases 3, 4
- **Full-Stack Developer:** Phases 1, 6
- **QA Engineer:** Phase 6 (testing focus)
- **Designer:** Phase 4 (UI/UX polish)

For solo development, complete phases sequentially.

---

## Timeline Estimate

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Types | 0.5 days | 0.5 days |
| Phase 2: Engine | 2.5 days | 3 days |
| Phase 3: Canvas | 1.5 days | 4.5 days |
| Phase 4: UI | 3.5 days | 8 days |
| Phase 5: Prompts | 1 day | 9 days |
| Phase 6: Testing & Deploy | 2.5 days | 11.5 days |

**Total: ~12 days** (with buffer: 14 days)

---

## Final Notes

- Update this checklist as you complete each item
- Document any deviations from the plan
- Collect learnings for future game implementations
- Celebrate milestones! 🎉

**Good luck building Telestrations!** 🎨✏️
