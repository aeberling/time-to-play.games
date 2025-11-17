#!/bin/bash
set -e

echo "Starting web server with Nginx + PHP-FPM + Reverb..."

# Create temporary directories for Nginx
mkdir -p /tmp/client_body /tmp/proxy /tmp/fastcgi /tmp/uwsgi /tmp/scgi

# Start PHP-FPM in the background
echo "Starting PHP-FPM..."
php-fpm -y /app/php-fpm.conf &

# Wait a moment for PHP-FPM to start
sleep 2

# Start Reverb in the background
echo "Starting Reverb WebSocket server..."
php artisan reverb:start --host=127.0.0.1 --port=8080 &

# Wait a moment for Reverb to start
sleep 2

# Start Nginx in the foreground (this keeps the container running)
echo "Starting Nginx on port ${PORT}..."
nginx -c /app/nginx.conf -g "daemon off;"
