# Reverb WebSocket Server Setup on Kinsta

## Problem
Laravel Reverb is a WebSocket server that needs to run continuously alongside your main application. Without it running, WebSocket connections timeout and real-time features don't work.

## Solution
We've configured the application to run both the Laravel application server AND the Reverb WebSocket server as separate processes using Kinsta's Procfile support and TCP proxy.

## Configuration Files Updated

### 1. `Procfile`
```
web: php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
reverb: php artisan reverb:start --host=0.0.0.0 --port=${REVERB_PORT:-8080}
```

### 2. `nixpacks.toml`
```toml
[start]
# Kinsta will use the Procfile to start multiple processes
cmd = "php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"
```

## Environment Variables Required

Add these to your Kinsta environment variables (already documented in `KINSTA_ENV_VARS.md`):

```
REVERB_APP_ID=577160
REVERB_APP_KEY=[REDACTED - GENERATE NEW CREDENTIALS]
REVERB_APP_SECRET=[REDACTED - GENERATE NEW CREDENTIALS]
REVERB_HOST=time-to-play.games
REVERB_PORT=443
REVERB_SCHEME=https
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

VITE_REVERB_APP_KEY=[REDACTED - MUST MATCH REVERB_APP_KEY]
VITE_REVERB_HOST=time-to-play.games
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https

BROADCAST_CONNECTION=reverb
```

## How It Works

1. **On application start**: Both servers start simultaneously
   - Reverb WebSocket server listens on internal port 8080
   - Laravel application server listens on the main PORT (assigned by Kinsta)

2. **Client connections**:
   - Browser connects to `wss://time-to-play.games` on port 443 (HTTPS)
   - Kinsta's reverse proxy routes WebSocket connections to the Reverb server
   - Regular HTTP requests go to the Laravel application server

3. **Broadcasting**:
   - When game events occur (card played, turn changed, etc.)
   - Laravel broadcasts events through Reverb
   - All connected clients receive real-time updates

## Deployment Steps

### Step 1: Update Environment Variables
In your Kinsta dashboard, add the environment variables listed above.

### Step 2: Commit and Push Changes
```bash
git add Procfile nixpacks.toml KINSTA_ENV_VARS.md REVERB-SETUP.md
git commit -m "fix: Configure Reverb WebSocket server as separate process"
git push
```

### Step 3: Deploy to Kinsta
Trigger a redeploy in Kinsta dashboard.

### Step 4: Create Background Worker for Reverb (CRITICAL!)
After deployment, you MUST manually create a background worker process for Reverb:

1. Go to your Kinsta Application dashboard
2. Navigate to **Processes**
3. Click **Create process** → **Background worker**
4. Configure the worker:
   - **Name**: `reverb` (or any descriptive name)
   - **Custom start command**: `php artisan reverb:start --host=0.0.0.0 --port=8080`
   - **Instance count**: 1
   - **Instance size**: Choose based on your needs (Hobby or higher)
5. Click **Create process**

### Step 5: Configure TCP Proxy (CRITICAL!)
Now configure the TCP proxy to make Reverb publicly accessible:

1. Navigate to **Settings** → **Networking**
2. Click **"Add TCP proxy"**
3. Configure the proxy:
   - **Process**: Select `reverb` (the background worker you just created)
   - **Port**: `8080` - avoid reserved ports: 15000, 15001, 15004, 15006, 15008, 15009, 15020, 15021, 15053, 15090
4. Click **Save**
5. Kinsta will provide you with a **hostname** for the WebSocket connection (e.g., `reverb-abc123.kinsta.app`)

### Step 6: Update Environment Variables with TCP Proxy Hostname
After getting the TCP proxy hostname from Kinsta:

1. Go back to **Environment Variables**
2. Update these variables:
   ```
   REVERB_HOST=reverb-abc123.kinsta.app  # Use the hostname Kinsta gave you
   VITE_REVERB_HOST=reverb-abc123.kinsta.app  # Same hostname
   ```
3. **Redeploy** the application for changes to take effect

### Step 6: Test WebSocket Connection
- Open browser console on production site
- Look for successful WebSocket connection messages
- Play a game and verify real-time updates work without refreshing

## Troubleshooting

### WebSocket connection fails
- Check that `REVERB_HOST` matches your domain
- Verify `REVERB_PORT` is 443 (for HTTPS)
- Ensure `REVERB_SCHEME` is `https`
- Check Kinsta logs to confirm Reverb server started

### Real-time updates not working
- Verify `BROADCAST_CONNECTION=reverb` is set
- Check Laravel logs for broadcasting errors
- Use browser dev tools to inspect WebSocket messages

### Application won't start
- Check Kinsta deployment logs
- Verify the start command syntax in Procfile/nixpacks.toml
- Ensure both servers can bind to their respective ports

## Alternative: External WebSocket Service

If running Reverb on Kinsta proves difficult, you can deploy Reverb separately on:
- **Railway**: Free tier supports WebSocket servers
- **Fly.io**: Good for long-running processes
- **DigitalOcean App Platform**: Supports worker processes
- **Pusher**: Managed WebSocket service (paid)

Then update environment variables to point to the external Reverb server.
