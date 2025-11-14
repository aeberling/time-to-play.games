#!/bin/bash
set -e

echo "Running post-deploy tasks..."

# Ensure storage directories exist and have correct permissions
mkdir -p storage/app storage/framework/cache storage/framework/sessions storage/framework/views storage/logs
chmod -R 775 storage bootstrap/cache

# Run migrations
php artisan migrate --force --no-interaction

# Create symbolic link for storage
php artisan storage:link || true

echo "Post-deploy tasks completed!"
