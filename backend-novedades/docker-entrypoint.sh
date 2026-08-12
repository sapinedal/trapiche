#!/bin/sh
set -e

# Ensure storage subdirectories and database exist
mkdir -p /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/app/public \
         $(dirname "$DB_DATABASE") 2>/dev/null || true

touch "$DB_DATABASE" 2>/dev/null || true

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true

# Ensure APP_KEY exists
if [ -z "$APP_KEY" ]; then
    echo "Generating APP_KEY..."
    php artisan key:generate --force
fi

# Run migrations & seeders if database script/env enables it
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running migrations..."
    php artisan migrate --force
fi

if [ "$RUN_SEED" = "true" ]; then
    echo "Running seeders..."
    php artisan db:seed --force
fi

# Ensure storage link
php artisan storage:link --quiet || true

# Execute main process
exec "$@"
