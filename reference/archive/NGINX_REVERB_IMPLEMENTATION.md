# Nginx + Reverb Implementation Guide

## Overview

This implementation uses Nginx as a reverse proxy to handle TLS termination and route both HTTP requests and WebSocket connections. This eliminates the need for Kinsta's TCP proxy or background workers.

## Architecture

```
Browser (HTTPS/WSS)
    ↓
Kinsta's Load Balancer (TLS termination)
    ↓
Nginx (port 8080 - proxies to appropriate backend)
    ├── Regular HTTP requests → PHP-FPM (port 9000)
    └── WebSocket requests (/app/*) → Reverb (port 8080 internal)
```

## Key Benefits

1. **TLS handled by Kinsta** - No custom certificates needed
2. **Single web process** - No separate background worker needed
3. **No TCP proxy** - Simpler infrastructure
4. **Lower cost** - Only one pod running
5. **Standard architecture** - Similar to typical Laravel deployments

## Files Created/Modified

### New Files

1. **nginx.conf** - Nginx configuration
   - Listens on Kinsta's PORT
   - Routes regular requests to PHP-FPM
   - Proxies WebSocket connections to Reverb
   - Handles WebSocket upgrade headers

2. **php-fpm.conf** - PHP-FPM configuration
   - Listens on port 9000
   - Configured for Kinsta's environment

3. **start-web.sh** - Startup script
   - Starts PHP-FPM in background
   - Starts Reverb in background
   - Starts Nginx in foreground

### Modified Files

1. **Procfile**
   - Changed from: `web: php artisan serve...`
   - Changed to: `web: bash start-web.sh`

2. **nixpacks.toml**
   - Added `nginx` to nixPkgs

3. **KINSTA_ENV_VARS.md**
   - Updated REVERB_SERVER_HOST to 127.0.0.1
   - Updated REVERB_SERVER_PORT to 8080
   - Added notes about Nginx architecture

## How It Works

### 1. Startup Sequence

```bash
start-web.sh runs:
1. PHP-FPM starts on 127.0.0.1:9000 (background)
2. Reverb starts on 127.0.0.1:8080 (background)
3. Nginx starts on 0.0.0.0:$PORT (foreground - keeps container alive)
```

### 2. Request Routing

**Regular HTTP Request:**
```
Browser → Kinsta LB → Nginx → PHP-FPM → Laravel
```

**WebSocket Connection:**
```
Browser → Kinsta LB → Nginx → Reverb
         (wss://)     (proxy)   (ws://)
```

### 3. TLS Termination

- Kinsta's load balancer handles TLS termination
- Traffic reaches Nginx as plain HTTP
- Nginx proxies WebSocket upgrade to Reverb
- Reverb only sees plain WebSocket connections (no TLS needed)

## Implementation Steps

### Step 1: Update Environment Variables in Kinsta

```bash
REVERB_SERVER_HOST=127.0.0.1
REVERB_SERVER_PORT=8080
REVERB_HOST=time-to-play.games
REVERB_PORT=443
REVERB_SCHEME=https

VITE_REVERB_HOST=time-to-play.games
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

### Step 2: Delete Background Worker (if exists)

1. Go to Kinsta Dashboard → Processes
2. Delete the "reverb" background worker (if it exists)
3. This architecture runs everything in the web process

### Step 3: Remove TCP Proxy (if exists)

1. Go to Kinsta Dashboard → Networking → TCP Proxy
2. Delete any TCP proxy configuration
3. Not needed with Nginx architecture

### Step 4: Deploy

1. Commit all changes:
   ```bash
   git add .
   git commit -m "feat: Implement Nginx reverse proxy for Reverb WebSocket support"
   git push
   ```

2. Redeploy in Kinsta (automatic on git push)

### Step 5: Verify Deployment

Check Kinsta logs for:

```
✅ Starting PHP-FPM...
✅ Starting Reverb WebSocket server...
✅ Starting Nginx on port 8080...
```

All three processes should start successfully.

### Step 6: Test WebSocket Connection

Visit: https://time-to-play.games/test-websocket

Should connect to: `wss://time-to-play.games/app/5fe7c22bad16f626d3fb296f`

## Nginx Configuration Details

### WebSocket Proxying

The nginx.conf includes two location blocks for WebSocket connections:

```nginx
location /app/ {
    proxy_pass http://reverb;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    # ... additional headers
}
```

This ensures:
- WebSocket upgrade headers are passed through
- Connection remains open (7-day timeout)
- Reverb receives proper protocol upgrade

### PHP-FPM Integration

```nginx
location ~ \.php$ {
    try_files $uri =404;
    fastcgi_pass php-fpm;
    # ... FastCGI configuration
}
```

This ensures:
- PHP files are processed by PHP-FPM
- Laravel routing works correctly

## Troubleshooting

### Issue: "nginx: command not found"

**Cause:** Nginx not installed in build
**Fix:** Verify `nixpacks.toml` has `"nginx"` in nixPkgs array

### Issue: "php-fpm: command not found"

**Cause:** PHP-FPM not available
**Fix:** PHP-FPM should be included with PHP installation, verify PHP is installed

### Issue: "Address already in use" for port 9000 or 8080

**Cause:** Process already running on that port
**Fix:** Check start-web.sh for duplicate process starts, ensure clean startup

### Issue: WebSocket connections still failing

**Possible causes:**
1. Environment variables not updated (especially REVERB_SERVER_HOST)
2. Frontend not rebuilt (VITE_ variables require rebuild)
3. Nginx configuration issue (check logs)
4. Reverb not starting (check logs)

**Debugging:**
1. Check Kinsta logs for all three process startups
2. Look for errors from PHP-FPM, Reverb, or Nginx
3. Test direct Reverb connection (if you can access shell):
   ```bash
   curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: test" \
     http://localhost:8080/app/5fe7c22bad16f626d3fb296f
   ```

## Comparison with Previous Attempts

| Approach | TLS Handling | Complexity | Cost | Status |
|----------|--------------|------------|------|--------|
| TCP Proxy + Background Worker | TCP Proxy (passthrough) | High | $$$ | Failed - TLS mismatch |
| Supervisor (single process) | Kinsta HTTP Proxy | Medium | $ | Failed - routing issues |
| **Nginx Reverse Proxy** | **Kinsta LB** | **Low** | **$** | **✅ Should work** |

## Why This Should Work

1. **TLS termination at load balancer** - Standard HTTPS setup
2. **Nginx proxies plain HTTP** - No TLS complexity in application
3. **Single process** - Simpler than background workers
4. **Standard Laravel pattern** - Similar to Forge/DO deployments
5. **No custom routing** - Uses Kinsta's standard HTTP proxy

## References

- [Nginx WebSocket Proxying](https://nginx.org/en/docs/http/websocket.html)
- [Laravel Reverb Documentation](https://reverb.laravel.com/)
- [Kinsta Application Hosting](https://kinsta.com/docs/application-hosting/)
- [Stack Overflow: Nginx on Railway](https://stackoverflow.com/questions/76216476/how-can-i-modify-the-nginx-configuration-in-railway)
