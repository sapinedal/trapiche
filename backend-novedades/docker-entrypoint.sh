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

# Generate a secure dynamic APP_KEY if not provided
if [ -z "$APP_KEY" ]; then
    echo "Generating dynamic production APP_KEY..."
    GENERATED_KEY="base64:$(openssl rand -base64 32)"
    export APP_KEY="$GENERATED_KEY"
    echo "APP_KEY=$GENERATED_KEY" > /var/www/html/.env
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
