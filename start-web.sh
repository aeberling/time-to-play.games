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

# Generate Nginx config with PORT variable substituted
echo "Generating Nginx config for port ${PORT}..."
sed "s/\${PORT}/${PORT}/g" /app/nginx.conf > /tmp/nginx.conf

# Start Nginx in the foreground (this keeps the container running)
echo "Starting Nginx on port ${PORT}..."
nginx -c /tmp/nginx.conf -g "daemon off;"
