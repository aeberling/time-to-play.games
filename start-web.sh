#!/bin/bash
set -e

echo "Starting web server with Nginx + PHP-FPM + Reverb..."

# Detect current user and group
CURRENT_USER=$(whoami)
CURRENT_GROUP=$(id -gn)

echo "Running as user: $CURRENT_USER (group: $CURRENT_GROUP)"

# Create temporary directories for Nginx
mkdir -p /tmp/client_body /tmp/proxy /tmp/fastcgi /tmp/uwsgi /tmp/scgi

# Generate PHP-FPM config with current user/group
cat > /tmp/php-fpm.conf <<EOF
[global]
pid = /tmp/php-fpm.pid
error_log = /dev/stderr

[www]
user = $CURRENT_USER
group = $CURRENT_GROUP
listen = 127.0.0.1:9000

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

# Start Reverb in the background
echo "Starting Reverb WebSocket server..."
php artisan reverb:start --host=127.0.0.1 --port=8080 &

# Wait a moment for Reverb to start
sleep 2

# Start Nginx in the foreground (this keeps the container running)
echo "Starting Nginx on port ${PORT}..."
nginx -c /app/nginx.conf -g "daemon off;"
