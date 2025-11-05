# Game Cancellation Feature

This document describes the game cancellation feature that allows game creators to cancel their games before they start.

## Overview

Game creators (the user who created the game) can now cancel games that are in WAITING or READY status. This prevents games from lingering in the lobby when players are no longer interested.

## Features

- **Creator-Only**: Only the user who created the game (player_index 0) can cancel it
- **Status Restriction**: Games can only be cancelled in WAITING or READY status
- **Confirmation Dialog**: Users must confirm before cancelling to prevent accidental deletions
- **Clean Cleanup**: Cancelling unsubscribes from WebSocket channels and returns user to lobby
- **Visual Indicator**: Cancel button only appears for creators when cancellation is allowed

## Implementation

### Backend

**Controller**: `app/Http/Controllers/Api/GameController.php`

The `destroy` method has been enhanced to:
1. Check if the requesting user is the game creator (player_index 0)
2. Verify the game is in WAITING or READY status
3. Update the game status to ABANDONED
4. Return appropriate error messages for unauthorized or invalid requests

**API Endpoint**: `DELETE /api/games/{id}`

**Permissions**:
- Returns 403 if user is not the creator
- Returns 400 if game is already in progress

### Frontend

**Game Store**: `resources/js/store/gameStore.ts`

New action added:
- `cancelGame(gameId: number)`: Calls the DELETE endpoint and cleans up state

**Game Components**:
- `resources/js/Pages/Games/War.tsx`
- `resources/js/Pages/Games/OhHell.tsx`

Both games now have:
1. `handleCancelGame` function with confirmation dialog
2. `isCreator` check to determine if current user created the game
3. `canCancelGame` check combining creator status and game status
4. "Cancel Game" button that only appears when allowed

## User Experience

### Creator View (WAITING/READY status)
```
[Cancel Game] [Leave Game →]
```
- Cancel Game button is prominent with red background
- Leave Game remains as a text link

### Creator View (IN_PROGRESS status)
```
[Leave Game →]
```
- Cancel button is hidden (game cannot be cancelled)

### Non-Creator View
```
[Leave Game →]
```
- Cancel button never appears

### Cancellation Flow

1. Creator clicks "Cancel Game" button
2. Browser confirmation dialog appears: "Are you sure you want to cancel this game? This action cannot be undone."
3. If confirmed:
   - API call to DELETE /api/games/{id}
   - WebSocket unsubscription
   - Redirect to game lobby
4. If API call fails, error is logged to console

## Database

Games are not deleted from the database when cancelled. Instead, the `status` field is updated to 'ABANDONED'. This preserves the game record for potential auditing or analytics.

## Testing

To test the feature:

1. **As Creator**:
   - Create a new game
   - Verify "Cancel Game" button appears
   - Click the button and confirm
   - Verify redirect to lobby
   - Check database shows game as ABANDONED

2. **As Non-Creator**:
   - Join another user's game
   - Verify "Cancel Game" button does NOT appear
   - Only "Leave Game" should be visible

3. **After Game Starts**:
   - Create and start a game (all players ready)
   - Verify "Cancel Game" button disappears
   - Verify API returns error if trying to cancel via direct API call

4. **Authorization**:
   - Try to cancel another user's game via API
   - Should receive 403 Forbidden response

## Future Enhancements

Potential improvements:
- Notify other players when a game is cancelled
- Show cancellation reason option
- Distinguish between "cancelled" and "abandoned" statuses
- Creator can also cancel games in early IN_PROGRESS state (first few moves)
