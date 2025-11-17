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
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8081

VITE_REVERB_APP_KEY=5fe7c22bad16f626d3fb296f
VITE_REVERB_HOST=time-to-play.games
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

**IMPORTANT REVERB NOTES:**
- `REVERB_HOST` = Main domain (time-to-play.games) - uses Kinsta's HTTPS routing
- `REVERB_PORT` = HTTPS port (443) - standard HTTPS port
- `REVERB_SERVER_HOST` = Internal bind address (0.0.0.0) - allows all connections
- `REVERB_SERVER_PORT` = Internal server port (8081) - what Reverb binds to internally
- Kinsta's HTTP proxy routes WebSocket upgrades to Reverb on port 8081
- PHP server runs on port 8080 (Kinsta's PORT env var)
- Scheme MUST be `https` (browsers require wss:// when page is https://)
- WebSocket connections use wss://time-to-play.games/app/... (no TCP proxy needed)

## Other Required Variables
```
SESSION_DRIVER=database
BROADCAST_CONNECTION=reverb
CACHE_STORE=database
LOG_LEVEL=error
```

## Deployment Checklist

After setting all environment variables in Kinsta:

1. **Remove TCP proxy** (if previously configured) - not needed with standard HTTPS routing
2. **Update environment variables** to use main domain (time-to-play.games, port 443)
3. **Redeploy application** on Kinsta (to rebuild with new VITE_ variables)
4. **Check both processes are running via Supervisor**:
   - Check application logs for "supervisord started"
   - Check application logs for "php-server entered RUNNING state"
   - Check application logs for "reverb entered RUNNING state"
   - Check application logs for "Server running on 0.0.0.0:8080" (PHP)
   - Check application logs for "Starting server on 0.0.0.0:8081" (Reverb)
5. **Test WebSocket connection** at https://time-to-play.games/test-websocket
   - Should connect to wss://time-to-play.games/app/...

## Troubleshooting

If WebSocket still fails after deployment:

1. Check Kinsta logs: `Logs > Application` in dashboard
2. Verify both PHP server and Reverb are running via Supervisor
3. Ensure Reverb is listening on port 8081 (check logs for "Starting server on 0.0.0.0:8081")
4. Verify environment variables are correct (especially VITE_ vars require rebuild)
5. Test connection: `wss://time-to-play.games/app/5fe7c22bad16f626d3fb296f`
6. Check Kinsta's HTTP proxy is routing WebSocket upgrades to internal port 8081

## Notes
- Database uses public proxy URL (us-west4-001.proxy.kinsta.app)
- No SSL certificate needed for Kinsta PostgreSQL
- Migrations already run on database
- Reverb WebSocket server runs as separate process (configured in Procfile)
- Both `web` and `reverb` processes must be running simultaneously
