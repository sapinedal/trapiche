#!/bin/sh
set -e

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
