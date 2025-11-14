#!/bin/bash
set -e

echo "Running post-deploy tasks..."

# Ensure storage directories exist and have correct permissions
mkdir -p storage/app storage/framework/cache storage/framework/sessions storage/framework/views storage/logs
chmod -R 775 storage bootstrap/cache

# Copy SSL certificate if it exists
if [ -f "reference/prod-ca-2021.crt" ]; then
    cp reference/prod-ca-2021.crt storage/app/prod-ca-2021.crt
    echo "SSL certificate copied to storage"
else
    echo "Warning: SSL certificate not found at reference/prod-ca-2021.crt"
fi

# Run migrations
php artisan migrate --force --no-interaction

# Create symbolic link for storage
php artisan storage:link || true

echo "Post-deploy tasks completed!"
