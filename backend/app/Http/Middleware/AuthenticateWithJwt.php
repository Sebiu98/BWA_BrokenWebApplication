<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\JwtService;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class AuthenticateWithJwt
{
    public function handle(Request $request, Closure $next): Response
    {
        // Legge token Bearer dall'header Authorization.
        $header = (string) $request->header('Authorization', '');
        $prefix = 'Bearer ';

        if (! str_starts_with($header, $prefix)) {
            return new JsonResponse([
                'message' => 'Unauthorized.',
            ], 401);
        }

        $token = trim(substr($header, strlen($prefix)));
        if ($token === '') {
            return new JsonResponse([
                'message' => 'Unauthorized.',
            ], 401);
        }

        try {
            // Decodifica e valida firma/scadenza JWT.
            $payload = app(JwtService::class)->decodeToken($token);
        } catch (Throwable) {
            return new JsonResponse([
                'message' => 'Unauthorized.',
            ], 401);
        }

        // Verifica se il token e stato revocato (logout -> blacklist).
        $jti = $payload['jti'] ?? null;
        if (is_string($jti) && $jti !== '') {
            $isRevoked = DB::table('jwt_token_blacklists')
                ->where('jti', $jti)
                ->where('expires_at', '>', now())
                ->exists();

            if ($isRevoked) {
                return new JsonResponse([
                    'message' => 'Unauthorized.',
                ], 401);
            }
        }

        // Carica utente reale dal DB usando "sub" del token.
        $userId = $payload['sub'] ?? null;
        if (! is_int($userId)) {
            return new JsonResponse([
                'message' => 'Unauthorized.',
            ], 401);
        }

        $user = User::query()->find($userId);
        if (! $user) {
            return new JsonResponse([
                'message' => 'Unauthorized.',
            ], 401);
        }

        // Inietta utente nel request resolver, cosi request->user() funziona ovunque.
        $request->attributes->set('jwt_payload', $payload);
        $request->attributes->set('jwt_token', $token);
        $request->setUserResolver(static fn (): User => $user);

        return $next($request);
    }
}
