# War in Heaven - Online Multiplayer Implementation Plan

## Current Status

**Frontend**: Fully functional game with complete game logic in Zustand store (hot-seat mode)
- Complex hex board rendering
- Full combat system
- Special abilities
- Victory conditions
- All UI components working

**Backend**: Stub implementation with empty components
- HexBoard component has TODO
- CardManager not implemented
- MoveValidator stubs
- No actual game logic

## Challenge

The frontend has a sophisticated game engine built into a Zustand store that works great for hot-seat play, but doesn't integrate with the backend for online multiplayer.

## Solution Approach

### Option 1: Port Frontend Logic to Backend (RECOMMENDED)
**Pros:**
- True online multiplayer
- Server-authoritative (prevents cheating)
- Follows platform architecture
- Reusable backend engine

**Cons:**
- Significant development effort
- Need to duplicate game logic from frontend to backend
- Complex state synchronization

**Steps:**
1. Implement backend HexBoard with proper coordinate system (A1, B5, etc.)
2. Implement backend CardManager with all angel/demon cards
3. Port movement validation logic from frontend to backend MoveValidator
4. Port combat logic to backend CombatResolver
5. Implement WinConditionChecker
6. Update frontend to consume backend state via API
7. Remove game logic from frontend Zustand store (keep only UI state)

### Option 2: Hybrid Approach (FASTER, INTERIM)
**Pros:**
- Faster to implement
- Leverages existing frontend work
- Can ship sooner

**Cons:**
- Client-authoritative (trust issues)
- Not following platform pattern
- Tech debt

**Steps:**
1. Keep game logic in frontend
2. Backend just stores/relays moves
3. Use WebSocket to sync state between players
4. Validate moves minimally on backend

### Option 3: Keep Development Version
**Pros:**
- No work needed
- Game already works

**Cons:**
- Not multiplayer
- Not integrated into platform

## Recommendation

Implement **Option 1** properly. The game has too much value to keep as hot-seat only, and the platform architecture requires server-authoritative game logic.

## Implementation Timeline

### Phase 1: Backend Core (4-6 hours)
- ✅ HexBoard initialization with correct coordinates
- ✅ CardManager with full card definitions
- ✅ Basic move validation

### Phase 2: Backend Game Logic (6-8 hours)
- ✅ Movement system (4 different movement types)
- ✅ Combat resolution
- ✅ Special abilities (Uriel, Camiel, Jophiel, Raphael, Gabriel, Mammon, Baal)
- ✅ Recharge mechanics with gate control
- ✅ Victory conditions

### Phase 3: Frontend Integration (4-6 hours)
- ✅ Update WarInHeaven.tsx to use useGameStore (like Swoop/OhHell)
- ✅ Modify GameView to accept backend state as props
- ✅ Remove game logic from frontend store
- ✅ Keep only UI state (selected pieces, combat mode, etc.)
- ✅ Implement move submission to backend

### Phase 4: Testing (2-4 hours)
- ✅ Test full multiplayer flow
- ✅ Test all special abilities
- ✅ Test victory conditions
- ✅ Test WebSocket updates

**Total Estimated Time: 16-24 hours**

## Decision

Proceeding with Option 1 - Full backend implementation.
