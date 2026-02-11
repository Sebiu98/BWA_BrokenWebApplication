<?php

$origins = env('CORS_ALLOWED_ORIGINS', env('FRONTEND_URL', 'http://localhost:3000'));
$allowedOrigins = array_values(array_filter(array_map('trim', explode(',', $origins))));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowedOrigins,
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
