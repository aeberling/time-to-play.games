# Quick Reference: Nginx + Reverb Setup

## Files Changed

### Created
- ✅ `nginx.conf` - Routes HTTP and WebSocket traffic
- ✅ `php-fpm.conf` - PHP-FPM configuration
- ✅ `start-web.sh` - Starts all three processes

### Modified
- ✅ `Procfile` - Changed to: `web: bash start-web.sh`
- ✅ `nixpacks.toml` - Added `"nginx"` to nixPkgs
- ✅ `KINSTA_ENV_VARS.md` - Updated for new architecture

## Environment Variables to Update

**Only these need to change:**

```bash
REVERB_SERVER_HOST=127.0.0.1     # was: 0.0.0.0
REVERB_SERVER_PORT=8080          # was: 8081
```

**Everything else stays the same!**

## Kinsta Dashboard Changes

1. **Delete** the "reverb" background worker
2. **Delete** the TCP proxy (port 30814)

## Process Flow

```
start-web.sh runs:
  1. PHP-FPM → 127.0.0.1:9000 (background)
  2. Reverb → 127.0.0.1:8080 (background)
  3. Nginx → 0.0.0.0:$PORT (foreground)
```

## Testing

```
URL: https://time-to-play.games/test-websocket
Expected: 🟢 connected
WebSocket: wss://time-to-play.games/app/5fe7c22bad16f626d3fb296f
```

## What Logs Should Show

```
Starting PHP-FPM...
Starting Reverb WebSocket server...
Starting Nginx on port 8080...
```

## Quick Troubleshooting

| Issue | Check |
|-------|-------|
| Build fails | nixpacks.toml has nginx |
| PHP-FPM won't start | Check php-fpm.conf exists |
| Reverb won't start | Check REVERB_SERVER_HOST=127.0.0.1 |
| Nginx won't start | Check nginx.conf exists |
| Port conflict | Check logs for which process failed |
| WebSocket fails | Verify all 3 processes started |

## Git Commands

```bash
# Deploy
git add .
git commit -m "feat: Implement Nginx reverse proxy for Reverb"
git push

# Rollback if needed
git revert HEAD
git push
```

## Why This Works

- ✅ Kinsta's LB terminates TLS (handles HTTPS)
- ✅ Nginx receives plain HTTP, proxies WebSocket to Reverb
- ✅ Reverb only handles plain WebSocket (no TLS needed)
- ✅ Single web process (simpler, cheaper)
- ✅ Standard architecture (like Forge/DO deployments)

## Cost Savings

| Before | After |
|--------|-------|
| Web process + Background worker | Web process only |
| TCP proxy | No proxy needed |
| 2 pods | 1 pod |
| $$$ | $ |
