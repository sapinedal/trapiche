#!/bin/sh
set -e

cd /var/www/html

# Ensure storage subdirectories and database exist
mkdir -p /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/app/public \
         $(dirname "$DB_DATABASE") 2>/dev/null || true

touch "$DB_DATABASE" 2>/dev/null || true

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true

# Ensure .env file exists and has a valid APP_KEY
if [ ! -f /var/www/html/.env ]; then
    cp /var/www/html/.env.example /var/www/html/.env 2>/dev/null || touch /var/www/html/.env
fi

if ! grep -q "^APP_KEY=base64:" /var/www/html/.env; then
    echo "Writing fresh APP_KEY to .env..."
    echo "APP_KEY=base64:c3VwZXJzZWNyZXRrZXkxMjM0NTY3ODkwMTIzNDU2Nw==" >> /var/www/html/.env
    php artisan key:generate --force || true
fi

php artisan config:clear --quiet || true

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
