# Kinsta WebSocket & Reverb Setup - Complete Documentation

## Summary of Findings

After extensive troubleshooting, we discovered the correct way to run Laravel Reverb on Kinsta Application Hosting.

## Key Discovery

**Kinsta officially supports WebSockets and specifically mentions Reverb** in their documentation:

> "You can also use [TCP proxy] to deploy a Laravel app with Reverb (a WebSocket server) as a single application, with Reverb running as a background worker while still being publicly accessible."

Source: https://kinsta.com/docs/application-hosting/application-connections/

## The Correct Architecture

Kinsta's recommended approach is:

1. **Web Process** - Runs the Laravel application (PHP server)
2. **Background Worker** - Runs Reverb as a separate process
3. **TCP Proxy** - Makes the background worker publicly accessible via WebSocket

## What We Tried (That Didn't Work)

### Attempt 1: Supervisor Running Both Processes in Web Process
- **Issue**: Both PHP server and Reverb tried to run in the same container
- **Problem**: Kinsta's HTTP proxy only forwards to PORT 8080, couldn't reach Reverb on 8081
- **Result**: Connection failures, routing issues

### Attempt 2: Using Main Domain for WebSocket
- **Issue**: Changed from TCP proxy to time-to-play.games:443
- **Problem**: Kinsta's HTTP proxy doesn't route WebSocket upgrades to background processes
- **Result**: Immediate connection rejection (error 1006)

## The Correct Solution

Based on Kinsta's documentation, we need:

### 1. Two Separate Processes

**Web Process (already configured):**
```bash
# Procfile
web: php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
```

**Background Worker (NEW - needs to be created in Kinsta):**
- Process Type: Background Worker
- Command: `php artisan reverb:start --host=0.0.0.0 --port=8080`
- Name: `reverb`

### 2. TCP Proxy Configuration

After creating the background worker:
- Go to Kinsta → Networking → TCP Proxy → Add TCP Proxy
- **Process**: reverb (the background worker)
- **Port**: 8080
- Kinsta will assign: `us-west4-001.proxy.kinsta.app:XXXXX`

### 3. Environment Variables

```bash
# Reverb Server Configuration (for the Reverb process itself)
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

# Reverb Client Configuration (what browsers connect to)
REVERB_HOST=us-west4-001.proxy.kinsta.app
REVERB_PORT=[assigned by Kinsta TCP proxy]
REVERB_SCHEME=https

# App Configuration
REVERB_APP_ID=577160
REVERB_APP_KEY=5fe7c22bad16f626d3fb296f
REVERB_APP_SECRET=010d238607af751bab87b263

# Frontend (Vite) Configuration
VITE_REVERB_APP_KEY=5fe7c22bad16f626d3fb296f
VITE_REVERB_HOST=us-west4-001.proxy.kinsta.app
VITE_REVERB_PORT=[same as REVERB_PORT]
VITE_REVERB_SCHEME=https
```

## Implementation Steps

### Step 1: Remove Supervisor Setup
We need to revert the Supervisor changes since Kinsta handles process management:

1. Remove/simplify `Procfile` to only have web process
2. Delete `supervisord.conf`
3. Delete `start-server.sh`
4. Update `nixpacks.toml` to remove Supervisor package

### Step 2: Create Background Worker in Kinsta

In Kinsta Dashboard:
1. Go to your application → **Processes**
2. Click **Create process** → **Background worker**
3. Configure:
   - **Name**: `reverb`
   - **Custom start command**: `php artisan reverb:start --host=0.0.0.0 --port=8080`
   - **Instance size**: Hobby (smallest is fine for testing)
   - **Number of instances**: 1

### Step 3: Configure TCP Proxy

In Kinsta Dashboard:
1. Go to **Networking** → **TCP Proxy**
2. Click **Add TCP proxy**
3. Configure:
   - **Process**: reverb (select the background worker created in Step 2)
   - **Port**: 8080
4. Note the assigned hostname and port (e.g., `us-west4-001.proxy.kinsta.app:30XXX`)

### Step 4: Update Environment Variables

Update these in Kinsta Dashboard → Environment Variables:
- `REVERB_HOST` = [TCP proxy hostname from Step 3]
- `REVERB_PORT` = [TCP proxy port from Step 3]
- `VITE_REVERB_HOST` = [same as REVERB_HOST]
- `VITE_REVERB_PORT` = [same as REVERB_PORT]
- `REVERB_SERVER_PORT` = 8080 (what Reverb binds to internally)

### Step 5: Deploy

1. Commit and push code changes
2. Redeploy application
3. Verify both processes are running:
   - Web process should show: "Server running on 0.0.0.0:8080"
   - Reverb process should show: "Starting server on 0.0.0.0:8080"

### Step 6: Test

Visit: https://time-to-play.games/test-websocket

Should connect to: `wss://us-west4-001.proxy.kinsta.app:XXXXX/app/5fe7c22bad16f626d3fb296f`

## Cost Implications

**Important**: Running Reverb as a background worker adds cost:
- Each background worker requires its own pod
- Charged based on instance size and number of instances
- For production, you may want to explore alternatives like Pusher or Ably

## Troubleshooting

If WebSocket connection fails after setup:

1. **Check both processes are running**:
   - Kinsta Dashboard → Processes
   - Should see "web" and "reverb" both running

2. **Verify TCP proxy**:
   - Kinsta Dashboard → Networking → TCP Proxy
   - Should show reverb process with assigned port

3. **Check Reverb logs**:
   - Kinsta Dashboard → reverb process → Logs
   - Should see "Reverb server started on 0.0.0.0:8080"

4. **Verify environment variables**:
   - REVERB_HOST and REVERB_PORT must match TCP proxy values
   - VITE_ variables must match (and require rebuild to take effect)

5. **Test direct connection**:
   ```bash
   curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: test" \
     http://localhost:8080/app/5fe7c22bad16f626d3fb296f
   ```
   (Run from within reverb process terminal)

## References

- [Kinsta TCP Proxy Documentation](https://kinsta.com/docs/application-hosting/application-connections/)
- [Kinsta Process Management](https://kinsta.com/docs/application-hosting/processes/)
- [Laravel Reverb Documentation](https://reverb.laravel.com/)

## Timeline of This Session

1. Started with Procfile having separate `web` and `reverb` processes - didn't work (Kinsta ignores multi-process Procfiles)
2. Tried Supervisor to run both in web process - partially worked but routing failed
3. Tried using main domain instead of TCP proxy - failed (no WebSocket routing)
4. Discovered Kinsta's documented approach: Background Worker + TCP Proxy

## Next Steps

Follow the Implementation Steps above to properly configure Reverb as a background worker with TCP proxy access.
