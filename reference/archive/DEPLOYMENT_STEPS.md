# Deployment Steps for Nginx + Reverb Architecture

## Summary

We're switching from the Background Worker + TCP Proxy approach to a simpler Nginx reverse proxy architecture. This solves the TLS termination issue and simplifies the infrastructure.

## Quick Overview

**What changed:**
- Added Nginx to handle request routing and WebSocket proxying
- PHP-FPM replaces `php artisan serve`
- All three processes (Nginx, PHP-FPM, Reverb) run in the single web process
- No background worker or TCP proxy needed

## Step-by-Step Instructions

### Step 1: Update Kinsta Environment Variables

Go to Kinsta Dashboard → Your App → Settings → Environment Variables

Update these values:

```bash
REVERB_SERVER_HOST=127.0.0.1     # Changed from 0.0.0.0
REVERB_SERVER_PORT=8080           # Changed from 8081
```

Keep these the same:
```bash
REVERB_HOST=time-to-play.games
REVERB_PORT=443
REVERB_SCHEME=https
VITE_REVERB_HOST=time-to-play.games
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

### Step 2: Delete Background Worker

1. Go to Kinsta Dashboard → Processes
2. Find the "reverb" background worker
3. Click Delete/Remove
4. Confirm deletion

**Why:** We're running Reverb inside the web process now via Nginx proxy

### Step 3: Remove TCP Proxy

1. Go to Kinsta Dashboard → Networking → TCP Proxy
2. Find the proxy pointing to port 30814
3. Click Delete/Remove
4. Confirm deletion

**Why:** Nginx handles WebSocket routing internally, no external proxy needed

### Step 4: Deploy Code Changes

The following files have been created/updated:

**New files:**
- `nginx.conf` - Nginx configuration
- `php-fpm.conf` - PHP-FPM configuration
- `start-web.sh` - Startup script

**Modified files:**
- `Procfile` - Now runs start-web.sh
- `nixpacks.toml` - Added nginx package
- `KINSTA_ENV_VARS.md` - Updated documentation

**To deploy:**

```bash
git add .
git commit -m "feat: Implement Nginx reverse proxy for Reverb WebSocket support"
git push
```

Kinsta will automatically redeploy on push.

### Step 5: Monitor Deployment

Watch the deployment logs in Kinsta Dashboard → Logs

**Look for these success messages:**

```
✅ Starting PHP-FPM...
✅ Starting Reverb WebSocket server...
✅ Starting Nginx on port 8080...
```

**Common startup sequence:**
1. Build completes
2. start-web.sh executes
3. PHP-FPM starts (background)
4. Reverb starts (background)
5. Nginx starts (foreground - keeps container running)

### Step 6: Test WebSocket Connection

Once deployment completes:

1. Visit: https://time-to-play.games/test-websocket
2. Should see: "🟢 connected"
3. Connection URL should be: `wss://time-to-play.games/app/5fe7c22bad16f626d3fb296f`

## What to Check If It Fails

### Build Fails

**Error: "nginx: command not found"**
- Check nixpacks.toml has `"nginx"` in nixPkgs

**Error: "start-web.sh: Permission denied"**
- File should be executable (already set with chmod +x)

### Runtime Fails

**Error: "Address already in use"**
- One of the processes failed to bind to its port
- Check logs to see which process is conflicting

**Error: "php-fpm: command not found"**
- PHP-FPM not installed with PHP
- Should be included automatically with Kinsta's PHP buildpack

### WebSocket Connection Fails

**Check logs for:**
1. Did all three processes start? (PHP-FPM, Reverb, Nginx)
2. Are there any error messages from Reverb?
3. Is Nginx reporting any proxy errors?

**Check browser console:**
1. What's the exact WebSocket URL being used?
2. What error code? (1006 = connection failed, 1000 = normal close)

**Verify environment variables:**
1. REVERB_SERVER_HOST = 127.0.0.1 (not 0.0.0.0)
2. REVERB_SERVER_PORT = 8080 (not 8081)
3. VITE_ variables match (may need another deploy to rebuild frontend)

## Architecture Diagram

```
External Request (HTTPS/WSS from browser)
    ↓
Kinsta Load Balancer (TLS termination)
    ↓
Nginx (port 8080 - routes based on path)
    ├── PHP requests → PHP-FPM (port 9000) → Laravel
    └── /app/* requests → Reverb (port 8080) → WebSocket

All three processes run in single web pod:
- Nginx: foreground (keeps pod alive)
- PHP-FPM: background
- Reverb: background
```

## Rollback Plan

If this doesn't work and you need to rollback:

1. Revert the git commit:
   ```bash
   git revert HEAD
   git push
   ```

2. Recreate background worker in Kinsta
3. Recreate TCP proxy in Kinsta
4. Update environment variables back to previous values

## Success Criteria

✅ Build completes without errors
✅ All three processes start (check logs)
✅ Application loads at https://time-to-play.games
✅ WebSocket test page shows "connected"
✅ WebSocket URL is wss://time-to-play.games/app/...
✅ No error 1006 or connection timeouts

## Next Steps After Success

Once WebSocket is working:

1. Test the actual game functionality
2. Monitor WebSocket connection stability
3. Check for any performance issues
4. Consider monitoring/alerting for WebSocket failures

## Support

If issues persist after this implementation:

- Review logs in Kinsta Dashboard
- Check `/Users/adam/Desktop/CODING/time-to-play.games/reference/NGINX_REVERB_IMPLEMENTATION.md` for troubleshooting
- Contact Kinsta support with details from deployment logs
