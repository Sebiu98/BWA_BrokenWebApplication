<?php

// Funzione implementata correttamente (piu restrittiva):
// $origins = env('CORS_ALLOWED_ORIGINS', env('FRONTEND_URL', 'http://localhost:3000'));
// $allowedOrigins = [];
// $originsList = explode(',', (string) $origins);
// foreach ($originsList as $origin) {
//     $cleanOrigin = trim($origin);
//     if ($cleanOrigin !== '') {
//         $allowedOrigins[] = $cleanOrigin;
//     }
// }

// VULN-09 Security Misconfiguration:
// CORS troppo permissivo: qualunque origin/header/metodo puo chiamare API.
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
