<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->is_active) {
            $request->user()?->currentAccessToken()?->delete();

            return new JsonResponse([
                'message' => 'Account is disabled.',
            ], 403);
        }

        return $next($request);
    }
}

