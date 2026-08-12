<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/*', 'login', 'logout'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_merge(
        array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', 'https://trapiche.manevoapp.com'))),
        ['https://trapiche.manevoapp.com', 'https://api-novedades.manevoapp.com']
    ),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
