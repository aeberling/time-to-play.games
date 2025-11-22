# WebSocket Real-Time Updates Troubleshooting Guide

## Problem Summary
Real-time updates (player joins, ready status, game moves) were not working. Players had to refresh to see changes.

## Root Causes Discovered

### 1. **Port Mismatch**
- **Issue**: `.env` configured Reverb for port 8081, but Reverb was running on port 8080
- **Symptom**: No WebSocket connections reaching Reverb, no events being received
- **Solution**:
  ```bash
  # Kill old Reverb processes
  ps aux | grep reverb:start | grep -v grep
  kill [PID]

  # Start Reverb on correct port matching .env
  php artisan reverb:start --host=0.0.0.0 --port=8081 --debug
  ```

### 2. **Production Config Override**
- **Issue**: `.env.production` file was overriding local `.env` settings during `npm run build`
- **Symptom**: Frontend connecting to production server (time-to-play.games:443) instead of localhost:8081
- **Solution**: Rename `.env.production` during local development
  ```bash
  mv .env.production .env.production.bak
  npm run build
  ```

### 3. **Broadcast Payload Too Large**
- **Issue**: `LobbyGameUpdated` event broadcasting entire game object with all relationships
- **Symptom**: "Pusher error: Payload too large" in Laravel logs, ready button returning 400 errors
- **Solution**: Optimized `LobbyGameUpdated::broadcastWith()` to only send essential fields
- **Files Changed**: `app/Events/LobbyGameUpdated.php`

### 4. **Mixed Content Security (HTTPS/HTTP)**
- **Issue**: Site running on HTTPS via Herd/Valet, browser blocking insecure WebSocket (ws://) connections
- **Symptom**: Frontend trying to use `wss://` even with `forceTLS: false`, connection failing
- **Solution**:
  - Disable HTTPS in Herd (click lock icon)
  - OR access site via `http://` instead of `https://`
  - Updated `bootstrap.ts` to explicitly set transport based on scheme

### 5. **Session Cookie Security Flag**
- **Issue**: Session cookies marked as Secure, not sent over HTTP connections
- **Symptom**: 419 CSRF errors when trying to log in via HTTP
- **Solution**: Added to `.env`:
  ```env
  SESSION_SECURE_COOKIE=false
  ```

## Complete Solution Checklist

### For Local Development:

1. **Verify Reverb Configuration** (`.env`):
   ```env
   BROADCAST_CONNECTION=reverb
   REVERB_APP_ID=615096
   REVERB_APP_KEY=f7d601a0a90e3d623ead43c6
   REVERB_APP_SECRET=ff8b017a5eee7ab8a9bbb3fe
   REVERB_HOST="localhost"
   REVERB_PORT=8081
   REVERB_SCHEME=http

   VITE_REVERB_APP_KEY=f7d601a0a90e3d623ead43c6
   VITE_REVERB_HOST=localhost
   VITE_REVERB_PORT=8081
   VITE_REVERB_SCHEME=http

   SESSION_SECURE_COOKIE=false
   ```

2. **Disable Production Config**:
   ```bash
   mv .env.production .env.production.bak
   ```

3. **Start Reverb on Correct Port**:
   ```bash
   php artisan reverb:start --host=0.0.0.0 --port=8081 --debug
   ```

4. **Build Frontend with Correct Config**:
   ```bash
   npm run build
   ```

5. **Disable HTTPS in Herd**:
   - Open Herd app
   - Find your site
   - Click the lock icon to disable HTTPS

6. **Access Site via HTTP**:
   - Navigate to `http://time-to-play.games.test` (not https)

7. **Clear Config Cache**:
   ```bash
   php artisan config:clear
   ```

### Testing WebSocket Connection:

Open browser console and verify:
```
[Bootstrap] Configuring Echo with: {
  key: 'f7d601a0a90e3d623ead43c6',
  wsHost: 'localhost',
  wsPort: '8081',
  scheme: 'http',
  forceTLS: false
}

Pusher: Connecting ... ws://localhost:8081
Pusher: State changed ... connecting -> connected
[WebSocket] Currently in game: [...]
```

### Common Issues:

**Q: Still seeing `wss://` instead of `ws://`?**
- A: Make sure you're accessing the site via `http://` not `https://`

**Q: Getting 419 CSRF errors?**
- A: Add `SESSION_SECURE_COOKIE=false` to `.env` and clear cookies

**Q: No WebSocket events being received?**
- A: Check Reverb logs for connections. Verify port matches `.env` configuration.

**Q: "Payload too large" errors?**
- A: Check that `LobbyGameUpdated` event only sends essential fields

## Files Modified

### Backend:
- `app/Events/LobbyGameUpdated.php` - Optimized broadcast payload
- `app/Events/GameCancelled.php` - Added new event
- `app/Services/GameService.php` - Added broadcasts for ready status
- `app/Http/Controllers/Api/GamePlayerController.php` - Added broadcasts for join/leave/ready

### Frontend:
- `resources/js/bootstrap.ts` - Enhanced Echo configuration with TLS control
- `resources/js/store/gameStore.ts` - Added extensive logging, fixed userId passing
- `resources/js/Pages/Games/Swoop.tsx` - Added game cancellation modal and debug logging
- `resources/js/Pages/Games/OhHell.tsx` - Added game cancellation modal
- `resources/js/Pages/Games/Telestrations.tsx` - Added game cancellation modal

## Production Deployment Notes

**IMPORTANT**: These local development changes should NOT affect production:

1. **`.env.production` is separate** - Contains production Reverb settings for Kinsta
2. **Restore `.env.production` before deploying**:
   ```bash
   mv .env.production.bak .env.production
   ```
3. **Production uses HTTPS** - WSS connections work fine in production
4. **Production Reverb config** is different (uses time-to-play.games:443)

### Production Environment Variables:
```env
VITE_REVERB_APP_KEY=5fe7c22bad16f626d3fb296f
VITE_REVERB_HOST=time-to-play.games
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

## Quick Reference Commands

```bash
# Check Reverb status
ps aux | grep reverb

# Check what's on ports 8080/8081
lsof -i :8080 -i :8081

# View Reverb logs
tail -f storage/logs/laravel.log | grep -i broadcast

# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Rebuild frontend
npm run build

# Start dev server (alternative to build)
npm run dev
```

## Developer Notes

- **Use `npm run dev`** for hot reload during development (better than `npm run build`)
- **Keep `.env.production` renamed** while doing local development to avoid confusion
- **WebSocket debugging**: Set `Pusher.logToConsole = true` in `bootstrap.ts`
- **Reverb must be running** at all times for real-time features to work
