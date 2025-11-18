# Complete Guide: Deploying Laravel with Reverb on Kinsta Application Hosting

## Overview

This guide documents the complete solution for deploying a Laravel application with Reverb (WebSocket server) on Kinsta Application Hosting using Nginx as a reverse proxy.

## Architecture

```
External Request (HTTPS/WSS from browser)
    ↓
Kinsta Load Balancer (TLS termination)
    ↓
Nginx (port 8080 - routes based on path)
    ├── Regular HTTP requests → PHP-FPM (port 9000) → Laravel
    └── WebSocket requests (/app/*) → Reverb (port 6001) → WebSocket

All three processes run in single web pod:
- Nginx: foreground (keeps pod alive)
- PHP-FPM: background
- Reverb: background
```

**Key Benefits:**
- ✅ TLS handled by Kinsta's load balancer
- ✅ Single web process (no separate background worker needed)
- ✅ No TCP proxy needed
- ✅ Lower cost (only one pod)
- ✅ Standard architecture similar to typical Laravel deployments

## Required Files

### 1. `nginx.conf`

Create this file in your project root:

```nginx
worker_processes auto;
pid /tmp/nginx.pid;
error_log /tmp/nginx_error.log info;

events {
    worker_connections 1024;
}

http {
    include /app/mime.types;
    default_type application/octet-stream;

    access_log /tmp/nginx_access.log;

    sendfile on;
    keepalive_timeout 65;

    # Temp paths (writable in Kinsta environment)
    client_body_temp_path /tmp/client_body;
    proxy_temp_path /tmp/proxy;
    fastcgi_temp_path /tmp/fastcgi;
    uwsgi_temp_path /tmp/uwsgi;
    scgi_temp_path /tmp/scgi;

    # Map for WebSocket upgrade
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }

    # Upstream for PHP-FPM
    upstream php-fpm {
        server 127.0.0.1:9000;
    }

    # Upstream for Reverb WebSocket server
    upstream reverb {
        server 127.0.0.1:6001;
    }

    server {
        listen ${PORT} default_server;
        server_name _;

        root /app/public;
        index index.php index.html;

        # Laravel application routes
        location / {
            try_files $uri $uri/ /index.php?$query_string;
        }

        # WebSocket endpoint for Reverb
        location /app/ {
            proxy_pass http://reverb;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # WebSocket specific timeouts
            proxy_connect_timeout 7d;
            proxy_send_timeout 7d;
            proxy_read_timeout 7d;
        }

        # Apps endpoint (alternative WebSocket path)
        location /apps/ {
            proxy_pass http://reverb;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            proxy_connect_timeout 7d;
            proxy_send_timeout 7d;
            proxy_read_timeout 7d;
        }

        # PHP processing
        location ~ \.php$ {
            try_files $uri =404;
            fastcgi_split_path_info ^(.+\.php)(/.+)$;
            fastcgi_pass php-fpm;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include /app/fastcgi_params;
        }

        # Deny access to hidden files
        location ~ /\. {
            deny all;
        }
    }
}
```

### 2. `mime.types`

Create this file in your project root:

```
types {
    text/html                             html htm shtml;
    text/css                              css;
    text/xml                              xml;
    image/gif                             gif;
    image/jpeg                            jpeg jpg;
    image/png                             png;
    image/svg+xml                         svg svgz;
    image/webp                            webp;
    application/javascript                js;
    application/json                      json;
    application/pdf                       pdf;
    application/zip                       zip;
    audio/mpeg                            mp3;
    video/mp4                             mp4;
    font/woff                             woff;
    font/woff2                            woff2;
}
```

### 3. `fastcgi_params`

Create this file in your project root:

```
fastcgi_param  QUERY_STRING       $query_string;
fastcgi_param  REQUEST_METHOD     $request_method;
fastcgi_param  CONTENT_TYPE       $content_type;
fastcgi_param  CONTENT_LENGTH     $content_length;

fastcgi_param  SCRIPT_NAME        $fastcgi_script_name;
fastcgi_param  REQUEST_URI        $request_uri;
fastcgi_param  DOCUMENT_URI       $document_uri;
fastcgi_param  DOCUMENT_ROOT      $document_root;
fastcgi_param  SERVER_PROTOCOL    $server_protocol;
fastcgi_param  REQUEST_SCHEME     $scheme;
fastcgi_param  HTTPS              $https if_not_empty;

fastcgi_param  GATEWAY_INTERFACE  CGI/1.1;
fastcgi_param  SERVER_SOFTWARE    nginx/$nginx_version;

fastcgi_param  REMOTE_ADDR        $remote_addr;
fastcgi_param  REMOTE_PORT        $remote_port;
fastcgi_param  SERVER_ADDR        $server_addr;
fastcgi_param  SERVER_PORT        $server_port;
fastcgi_param  SERVER_NAME        $server_name;

# PHP only, required if PHP was built with --enable-force-cgi-redirect
fastcgi_param  REDIRECT_STATUS    200;
```

### 4. `start-web.sh`

Create this executable script in your project root:

```bash
#!/bin/bash
set -e

echo "Starting web server with Nginx + PHP-FPM + Reverb..."

# Detect current user and group
CURRENT_USER=$(whoami)
CURRENT_GROUP=$(id -gn)

echo "Running as user: $CURRENT_USER (group: $CURRENT_GROUP)"

# PHP-FPM refuses to run as root, so we need to create a non-root user if running as root
if [ "$CURRENT_USER" = "root" ]; then
    echo "Running as root - creating app user for PHP-FPM..."
    # Create app user if it doesn't exist
    if ! id -u app >/dev/null 2>&1; then
        useradd -r -s /bin/false app || true
    fi
    FPM_USER="app"
    FPM_GROUP="app"

    # Fix permissions for Laravel storage directories
    echo "Fixing storage directory permissions for app user..."
    chown -R app:app /app/storage /app/bootstrap/cache
    chmod -R 775 /app/storage /app/bootstrap/cache
else
    FPM_USER="$CURRENT_USER"
    FPM_GROUP="$CURRENT_GROUP"
fi

echo "PHP-FPM will run as: $FPM_USER (group: $FPM_GROUP)"

# Create temporary directories for Nginx
mkdir -p /tmp/client_body /tmp/proxy /tmp/fastcgi /tmp/uwsgi /tmp/scgi

# Generate PHP-FPM config with appropriate user/group
cat > /tmp/php-fpm.conf <<EOF
[global]
pid = /tmp/php-fpm.pid
error_log = /dev/stderr

[www]
user = $FPM_USER
group = $FPM_GROUP
listen = 127.0.0.1:9000

; Pass environment variables to PHP
clear_env = no

pm = dynamic
pm.max_children = 10
pm.start_servers = 2
pm.min_spare_servers = 1
pm.max_spare_servers = 3

catch_workers_output = yes
php_admin_value[error_log] = /dev/stderr
php_admin_flag[log_errors] = on
EOF

# Start PHP-FPM in the background
echo "Starting PHP-FPM..."
php-fpm -y /tmp/php-fpm.conf &

# Wait a moment for PHP-FPM to start
sleep 2

# Start Reverb in the background on internal port 6001
echo "Starting Reverb WebSocket server on 127.0.0.1:6001..."
php artisan reverb:start --host=127.0.0.1 --port=6001 &

# Wait a moment for Reverb to start
sleep 2

# Generate Nginx config with PORT variable substituted
echo "Generating Nginx config for port ${PORT}..."
sed "s/\${PORT}/${PORT}/g" /app/nginx.conf > /tmp/nginx.conf

# Start Nginx in the foreground (this keeps the container running)
echo "Starting Nginx on port ${PORT}..."
nginx -c /tmp/nginx.conf -g "daemon off;"
```

**Make it executable:**
```bash
chmod +x start-web.sh
```

### 5. `Procfile`

Create or update this file in your project root:

```
web: bash start-web.sh
```

### 6. `nixpacks.toml`

Create or update this file in your project root:

```toml
[phases.setup]
nixPkgs = ["...", "nginx"]

[phases.install]
cmds = [
    "composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist",
    "npm ci --include=dev"
]

[phases.build]
cmds = [
    "npm run build",
    "mkdir -p storage/app storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache",
    "chmod -R 775 storage bootstrap/cache"
]

[start]
cmd = "bash start-web.sh"
```

## Environment Variables

Set these in Kinsta Dashboard → Your App → Settings → Environment Variables:

### Application
```bash
APP_NAME="Your App Name"
APP_ENV=production
APP_KEY=base64:your-generated-key-here
APP_DEBUG=false
APP_URL=https://your-domain.com
```

### Database (adjust for your database)
```bash
DB_CONNECTION=pgsql
DB_HOST=your-kinsta-db-host
DB_PORT=30224
DB_DATABASE=your-database-name
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password
```

### Reverb Configuration (Critical!)
```bash
# What browsers connect to (public)
REVERB_HOST=your-domain.com
REVERB_PORT=443
REVERB_SCHEME=https

# What Reverb binds to internally
REVERB_SERVER_HOST=127.0.0.1
REVERB_SERVER_PORT=6001

# Reverb app credentials
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret

# Frontend (Vite) configuration
VITE_REVERB_APP_KEY=${REVERB_APP_KEY}
VITE_REVERB_HOST=${REVERB_HOST}
VITE_REVERB_PORT=${REVERB_PORT}
VITE_REVERB_SCHEME=${REVERB_SCHEME}
```

### Broadcasting
```bash
BROADCAST_CONNECTION=reverb
```

### Other Required Variables
```bash
SESSION_DRIVER=database
CACHE_STORE=database
LOG_LEVEL=error
```

## Port Allocation

- **Nginx**: Port 8080 (external, from Kinsta's `$PORT` variable)
- **PHP-FPM**: Port 9000 (internal only)
- **Reverb**: Port 6001 (internal only, proxied by Nginx)

## Deployment Steps

### 1. Prepare Your Repository

```bash
# Add all required files
git add nginx.conf mime.types fastcgi_params start-web.sh Procfile nixpacks.toml

# Commit
git commit -m "feat: Add Nginx reverse proxy for Reverb WebSocket support"

# Push to repository
git push
```

### 2. Configure Kinsta

1. **Create Application** in Kinsta Dashboard
   - Connect your Git repository
   - Select branch to deploy

2. **Set Environment Variables**
   - Go to Settings → Environment Variables
   - Add all variables listed above
   - **Important**: Update domain names and credentials!

3. **Remove Any Existing Background Workers/TCP Proxies**
   - This architecture doesn't need them
   - Go to Processes → Delete any "reverb" background worker
   - Go to Networking → TCP Proxy → Delete any proxy

4. **Deploy**
   - Kinsta will automatically deploy on git push
   - Or manually trigger deployment in dashboard

### 3. Verify Deployment

Check the deployment logs for these success messages:

```
✅ Starting PHP-FPM...
   [NOTICE: fpm is running, pid XX]
   [NOTICE: ready to handle connections]

✅ Starting Reverb WebSocket server on 127.0.0.1:6001...
   [INFO] Starting server on 127.0.0.1:6001

✅ Generating Nginx config for port 8080...
✅ Starting Nginx on port 8080...
```

### 4. Test WebSocket Connection

Visit your application and test WebSocket functionality, or create a test route:

```php
// routes/web.php
Route::get('/test-websocket', function () {
    return view('test-websocket');
});
```

```blade
{{-- resources/views/test-websocket.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Test</title>
    @vite(['resources/js/app.js'])
</head>
<body>
    <h1>WebSocket Connection Test</h1>
    <div id="status">Testing...</div>

    <script type="module">
        import Echo from 'laravel-echo';
        import Pusher from 'pusher-js';

        window.Pusher = Pusher;

        window.Echo = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: import.meta.env.VITE_REVERB_HOST,
            wsPort: import.meta.env.VITE_REVERB_PORT,
            wssPort: import.meta.env.VITE_REVERB_PORT,
            forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
            enabledTransports: ['ws', 'wss'],
        });

        const status = document.getElementById('status');

        if (window.Echo.connector.pusher.connection.state === 'connected') {
            status.textContent = '✅ Connected!';
            status.style.color = 'green';
        } else {
            window.Echo.connector.pusher.connection.bind('connected', () => {
                status.textContent = '✅ Connected!';
                status.style.color = 'green';
            });

            window.Echo.connector.pusher.connection.bind('error', (error) => {
                status.textContent = '❌ Connection failed: ' + error;
                status.style.color = 'red';
            });
        }
    </script>
</body>
</html>
```

Expected result: Should show "✅ Connected!" with WebSocket URL: `wss://your-domain.com/app/your-app-key`

## Troubleshooting

### Issue: 500 Error

**Check Laravel logs:**
```bash
tail -50 /app/storage/logs/laravel.log
```

**Common causes:**
- Missing `APP_KEY` environment variable
- Database connection issues
- Missing environment variables

### Issue: WebSocket Connection Fails

**Check that all three processes started:**
```bash
ps aux | grep -E "(nginx|php-fpm|reverb)"
```

**Expected output:**
- nginx master/worker processes
- php-fpm master/worker processes
- php artisan reverb:start process

**Check WebSocket endpoint:**
```bash
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: test" \
  http://localhost:6001/app/your-app-key
```

Should show Reverb responding with connection data.

### Issue: Permission Denied Errors

**Check storage permissions:**
```bash
ls -la /app/storage
```

Storage directories should be owned by `app:app` user/group.

**Fix manually if needed:**
```bash
chown -R app:app /app/storage /app/bootstrap/cache
chmod -R 775 /app/storage /app/bootstrap/cache
```

### Issue: Build Fails

**"nginx: command not found"**
- Verify `nixpacks.toml` has `"nginx"` in nixPkgs array

**"Permission denied" on start-web.sh**
- File should be executable: `chmod +x start-web.sh`

### Issue: Processes Not Starting

**Check deployment logs** in Kinsta Dashboard → Logs

**Look for:**
- PHP-FPM errors (user/permission issues)
- Reverb errors (port conflicts, configuration)
- Nginx errors (config syntax, missing files)

## Critical Notes

### ⚠️ Important Configuration Details

1. **clear_env = no**: PHP-FPM must have this setting or it won't receive environment variables
2. **Port 6001**: Reverb must use a different port than Nginx (8080)
3. **127.0.0.1**: Reverb binds to localhost only (proxied by Nginx)
4. **VITE_ variables**: Frontend env vars require rebuild to take effect

### 🔒 Security Considerations

1. **Environment Variables**: Store sensitive data in Kinsta environment variables, not in code
2. **Reverb Authentication**: Use Laravel's built-in broadcasting authentication
3. **CORS**: Configure properly in `config/cors.php`
4. **Rate Limiting**: Consider rate limiting for WebSocket connections

### 💰 Cost Considerations

This architecture runs everything in **one web process pod**:
- No additional background worker cost
- No TCP proxy cost
- Standard Kinsta application pricing applies

Compare to alternatives:
- **Background Worker + TCP Proxy**: Requires additional pod ($$$)
- **Managed Services (Pusher/Ably)**: ~$49-99/month for production
- **This Solution**: Cost of single web pod ($)

## Comparison with Other Approaches

| Approach | TLS Handling | Complexity | Cost | Status |
|----------|--------------|------------|------|--------|
| Background Worker + TCP Proxy | TCP Proxy (passthrough) | High | $$$ | ❌ TLS mismatch issues |
| Supervisor (single process) | Kinsta HTTP Proxy | Medium | $ | ❌ Routing issues |
| **Nginx Reverse Proxy** | **Kinsta LB** | **Low** | **$** | **✅ Working** |

## Advanced Configuration

### Scaling Reverb

Adjust PHP-FPM pool settings in `start-web.sh`:

```bash
pm = dynamic
pm.max_children = 20          # Increase for more concurrent connections
pm.start_servers = 4
pm.min_spare_servers = 2
pm.max_spare_servers = 6
```

### Custom Domains

After adding a custom domain in Kinsta:

1. Update `APP_URL` environment variable
2. Update `REVERB_HOST` environment variable
3. Update `VITE_REVERB_HOST` environment variable
4. Redeploy to rebuild frontend with new VITE_ variables

### Monitoring

**Check if services are running:**
```bash
# PHP-FPM
ps aux | grep php-fpm

# Reverb
ps aux | grep reverb

# Nginx
ps aux | grep nginx
```

**Check logs:**
```bash
# Laravel logs
tail -f /app/storage/logs/laravel.log

# Nginx error log
tail -f /tmp/nginx_error.log

# Nginx access log
tail -f /tmp/nginx_access.log
```

## References

- [Kinsta Application Hosting Docs](https://kinsta.com/docs/application-hosting/)
- [Laravel Reverb Documentation](https://reverb.laravel.com/)
- [Nginx WebSocket Proxying](https://nginx.org/en/docs/http/websocket.html)
- [PHP-FPM Configuration](https://www.php.net/manual/en/install.fpm.configuration.php)

## Version Compatibility

This guide was created and tested with:
- Laravel 11.x
- Laravel Reverb (latest)
- PHP 8.2+
- Nginx (via Nixpacks)
- Kinsta Application Hosting (November 2024)

## Summary

This solution provides a **production-ready, cost-effective architecture** for running Laravel with Reverb on Kinsta Application Hosting. By using Nginx as a reverse proxy, we:

✅ Solve TLS termination issues
✅ Run everything in a single process (lower cost)
✅ Maintain standard Laravel deployment patterns
✅ Achieve full WebSocket functionality
✅ Keep infrastructure simple and maintainable

The key innovation is letting Kinsta's load balancer handle TLS, while Nginx routes plain HTTP/WebSocket traffic to the appropriate backend (PHP-FPM or Reverb).

---

**Generated from successful deployment of time-to-play.games on Kinsta Application Hosting**
