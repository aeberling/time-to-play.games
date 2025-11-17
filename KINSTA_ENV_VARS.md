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
REVERB_HOST=us-west4-001.proxy.kinsta.app
REVERB_PORT=30763
REVERB_SCHEME=https
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

VITE_REVERB_APP_KEY=5fe7c22bad16f626d3fb296f
VITE_REVERB_HOST=us-west4-001.proxy.kinsta.app
VITE_REVERB_PORT=30763
VITE_REVERB_SCHEME=https
```

**IMPORTANT REVERB NOTES:**
- `REVERB_HOST` = TCP proxy hostname (us-west4-001.proxy.kinsta.app)
- `REVERB_PORT` = TCP proxy external port (30763) - what browsers connect to
- `REVERB_SERVER_HOST` = Internal bind address (0.0.0.0) - allows all connections
- `REVERB_SERVER_PORT` = Internal server port (8080) - what Reverb binds to internally
- The TCP proxy forwards port 30763 → 8080 internally
- Scheme MUST be `https` (browsers require wss:// when page is https://)
- Do NOT include port in hostname!

## Other Required Variables
```
SESSION_DRIVER=database
BROADCAST_CONNECTION=reverb
CACHE_STORE=database
LOG_LEVEL=error
```

## Deployment Checklist

After setting all environment variables in Kinsta:

1. **Commit and push code changes** (Procfile fix)
2. **Redeploy application** on Kinsta
3. **Verify TCP proxy is configured**:
   - External port: 30763
   - Internal port: 8080
   - Protocol: TCP
4. **Check Reverb process is running**:
   - In Kinsta dashboard, verify the `reverb` process from Procfile is active
   - Check application logs for "Reverb server started"
5. **Test WebSocket connection** at https://time-to-play.games/test-websocket

## Troubleshooting

If WebSocket still fails after deployment:

1. Check Kinsta logs: `Logs > Application` in dashboard
2. Verify Reverb process is listed and running
3. Confirm TCP proxy configuration matches above
4. Test direct connection: `wss://us-west4-001.proxy.kinsta.app:30763/app/5fe7c22bad16f626d3fb296f`
5. Ensure firewall allows outbound WebSocket connections

## Notes
- Database uses public proxy URL (us-west4-001.proxy.kinsta.app)
- No SSL certificate needed for Kinsta PostgreSQL
- Migrations already run on database
- Reverb WebSocket server runs as separate process (configured in Procfile)
- Both `web` and `reverb` processes must be running simultaneously
