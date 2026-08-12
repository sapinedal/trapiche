FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    linux-headers \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    oniguruma-dev \
    libzip-dev \
    sqlite-dev

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql pdo_sqlite mbstring exif pcntl bcmath gd zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

ENV APP_NAME="Trapiche Novedades" \
    APP_ENV=production \
    APP_DEBUG=false \
    APP_URL=https://api-novedades.manevoapp.com \
    FRONTEND_URL=https://trapiche.manevoapp.com \
    DB_CONNECTION=sqlite \
    DB_DATABASE=/var/www/html/storage/database.sqlite \
    SESSION_DRIVER=file \
    QUEUE_CONNECTION=database \
    CACHE_STORE=file \
    CORS_ALLOWED_ORIGINS=https://trapiche.manevoapp.com \
    SANCTUM_STATEFUL_DOMAINS=trapiche.manevoapp.com,api-novedades.manevoapp.com \
    SESSION_DOMAIN=.manevoapp.com \
    RUN_MIGRATIONS=true \
    RUN_SEED=true

# Copy application files
COPY . /var/www/html

# Install Composer dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Nginx config for Laravel
RUN echo 'server { \
    listen 8000; \
    index index.php index.html; \
    error_log  /var/log/nginx/error.log; \
    access_log /var/log/nginx/access.log; \
    root /var/www/html/public; \
    location ~ \.php$ { \
        try_files $uri =404; \
        fastcgi_split_path_info ^(.+\.php)(/.+)$; \
        fastcgi_pass 127.0.0.1:9000; \
        fastcgi_index index.php; \
        include fastcgi_params; \
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; \
        fastcgi_param PATH_INFO $fastcgi_path_info; \
    } \
    location / { \
        try_files $uri $uri/ /index.php?$query_string; \
        gzip_static on; \
    } \
}' > /etc/nginx/http.d/default.conf

# Copy Supervisor config to run Nginx and PHP-FPM together
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 8000

ENTRYPOINT ["/var/www/html/docker-entrypoint.sh"]

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
