# Kinsta Environment Variables

Set these environment variables in your Kinsta Application dashboard:

## Database (Kinsta PostgreSQL)
```
DB_CONNECTION=pgsql
DB_HOST=us-west1-001.proxy.kinsta.app
DB_PORT=30085
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

## WebSockets (Reverb)
```
REVERB_APP_ID=577160
REVERB_APP_KEY=5fe7c22bad16f626d3fb296f
REVERB_APP_SECRET=010d238607af751bab87b263
REVERB_HOST=us-west4-001.proxy.kinsta.app
REVERB_PORT=30763
REVERB_SCHEME=http
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

VITE_REVERB_APP_KEY=5fe7c22bad16f626d3fb296f
VITE_REVERB_HOST=us-west4-001.proxy.kinsta.app
VITE_REVERB_PORT=30763
VITE_REVERB_SCHEME=http
```

**IMPORTANT:**
- Host should be ONLY the hostname: `us-west4-001.proxy.kinsta.app`
- Port should be ONLY the port number: `30763`
- Scheme should be `http` (not `https`) - Kinsta's TCP proxy handles the connection
- Do NOT include the port in the host field!

## Other Required Variables
```
SESSION_DRIVER=database
BROADCAST_CONNECTION=reverb
CACHE_STORE=database
LOG_LEVEL=error
```

## Notes
- Database uses public proxy URL (required when app and database are in different data centers)
- No SSL certificate needed for Kinsta PostgreSQL
- Migrations already run on database
- Set APP_DEBUG=false for production (use true temporarily for debugging)
- Reverb WebSocket server runs alongside the main app server (configured in Procfile and nixpacks.toml)
- After updating these environment variables, you MUST redeploy the application on Kinsta for changes to take effect
