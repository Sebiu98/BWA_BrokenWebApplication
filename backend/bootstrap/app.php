<?php

use App\Http\Middleware\AuthenticateWithJwt;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'auth.jwt' => AuthenticateWithJwt::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Funzione implementata correttamente:
        // $exceptions->render(function (\Throwable $exception, Request $request) {
        //     if ($request->is('api/*')) {
        //         return response()->json([
        //             'message' => 'Internal server error.',
        //         ], 500);
        //     }
        //
        //     return null;
        // });

        // VULN-09 Security Misconfiguration:
        // Errore API con leak di dettagli interni (classe, file, linea, messaggio).
        $exceptions->render(function (\Throwable $exception, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Unhandled exception.',
                    'error' => $exception->getMessage(),
                    'exception' => $exception::class,
                    'file' => $exception->getFile(),
                    'line' => $exception->getLine(),
                ], 500);
            }

            return null;
        });
    })->create();
