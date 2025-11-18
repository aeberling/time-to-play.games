# Kinsta Environment Variables

Set these environment variables in your Kinsta Application dashboard:

## Database (Kinsta PostgreSQL)
```
DB_CONNECTION=pgsql
DB_HOST=us-west4-001.proxy.kinsta.app
DB_PORT=30224
DB_DATABASE=time-to-play-games
DB_USERNAME=time2play
DB_PASSWORD=gY9-kD2=pG7+wY7=vS9=
```

## Application
```
APP_NAME="Time to Play"
APP_ENV=production
APP_KEY=base64:ljjh/qz6II7rwkoLP4u0zxRklgiAF+zLB/qjAHFshW0=
APP_DEBUG=false
APP_URL=https://time-to-play.games
```

## Mail (Postmark)
```
MAIL_MAILER=smtp
MAIL_HOST=smtp.postmarkapp.com
MAIL_PORT=587
MAIL_USERNAME=fa52582c-00fc-4e1d-aa77-7cb9e49d60ed
MAIL_PASSWORD=fa52582c-00fc-4e1d-aa77-7cb9e49d60ed
MAIL_FROM_ADDRESS=hello@time-to-play.games
```

## WebSockets (Reverb) - CRITICAL CONFIGURATION
```
REVERB_APP_ID=577160
REVERB_APP_KEY=5fe7c22bad16f626d3fb296f
REVERB_APP_SECRET=010d238607af751bab87b263
REVERB_HOST=time-to-play.games
REVERB_PORT=443
REVERB_SCHEME=https
REVERB_SERVER_HOST=127.0.0.1
REVERB_SERVER_PORT=6001

VITE_REVERB_APP_KEY=5fe7c22bad16f626d3fb296f
VITE_REVERB_HOST=time-to-play.games
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

**IMPORTANT REVERB NOTES (Updated for Nginx Architecture):**
- `REVERB_HOST` = Main domain (time-to-play.games) - public facing domain
- `REVERB_PORT` = HTTPS port (443) - standard HTTPS port
- `REVERB_SERVER_HOST` = Internal bind address (127.0.0.1) - only accessible via Nginx proxy
- `REVERB_SERVER_PORT` = Internal server port (6001) - what Reverb binds to internally
- Nginx handles TLS termination and proxies WebSocket connections to Reverb
- PHP-FPM runs on port 9000 (internal)
- Reverb runs on port 6001 (internal)
- Nginx runs on Kinsta's PORT (8080 external) and handles all incoming traffic
- Scheme MUST be `https` (browsers require wss:// when page is https://)
- WebSocket connections use wss://time-to-play.games/app/...
- **NO TCP Proxy needed** - Nginx handles everything in the web process

## Other Required Variables
```
SESSION_DRIVER=database
BROADCAST_CONNECTION=reverb
CACHE_STORE=database
LOG_LEVEL=error
```

## Deployment Checklist

After setting all environment variables in Kinsta:

1. **Delete the Background Worker** (if previously configured) - not needed with Nginx architecture
2. **Remove TCP Proxy** (if previously configured) - not needed with Nginx
3. **Update environment variables** to match above (especially REVERB_SERVER_HOST=127.0.0.1, REVERB_SERVER_PORT=6001)
4. **Redeploy application** on Kinsta (to rebuild with new VITE_ variables and Nginx config)
5. **Check all processes are running**:
   - Check application logs for "Starting PHP-FPM..."
   - Check application logs for "Starting Reverb WebSocket server..."
   - Check application logs for "Starting Nginx on port..."
   - All three should start successfully in the web process
6. **Test WebSocket connection** at https://time-to-play.games/test-websocket
   - Should connect to wss://time-to-play.games/app/...

## Troubleshooting

If WebSocket still fails after deployment:

1. Check Kinsta logs: `Logs > Application` in dashboard
2. Verify all three processes started:
   - PHP-FPM on port 9000
   - Reverb on port 8080 (internal)
   - Nginx on Kinsta's PORT (external)
3. Check logs for errors in any of the three processes
4. Verify environment variables are correct (especially VITE_ vars require rebuild)
5. Test connection: `wss://time-to-play.games/app/5fe7c22bad16f626d3fb296f`
6. Check browser console for WebSocket connection errors

## Notes
- Database uses public proxy URL (us-west4-001.proxy.kinsta.app)
- No SSL certificate needed for Kinsta PostgreSQL
- Migrations already run on database
- All processes (Nginx, PHP-FPM, Reverb) run in the single web process
- Nginx handles TLS termination and proxies WebSocket connections to Reverb
- No background workers or TCP proxies needed with this architecture
