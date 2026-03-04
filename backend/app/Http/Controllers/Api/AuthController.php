<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\JwtService;
use App\Support\UserAvatar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    // Servizio JWT separato: il controller non si occupa della firma a mano.
    public function __construct(private JwtService $jwtService)
    {
    }

    public function register(Request $request): JsonResponse
    {
        // Validazione base dei campi.
        $validator = Validator::make($request->all(), [
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'name' => ['required', 'string', 'max:255'],
            'surname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        // Creo l'utente. La password viene hashata dal model User.
        $user = User::create([
            'username' => $validated['username'],
            'name' => $validated['name'],
            'surname' => $validated['surname'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => 'user',
            'is_active' => true,
            'avatar' => UserAvatar::random(),
        ]);

        // Token subito dopo la registrazione.
        $token = $this->jwtService->createToken($user);

        return response()->json([
            'message' => 'Registration completed.',
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        // Controllo minimo credenziali in ingresso.
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        // Cerco utente tramite email.
        $user = User::where('email', $validated['email'])->first();

        // Funzione implementata correttamente:
        /*if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }*/
        // VULN-03 User Enumeration: distinguiamo tra email inesistente e password errata, cosi un attaccante puo capire quali account esistono.
        if (! $user) {
            return response()->json([
                'message' => 'Email not found.',
            ], 404);
        }

        if (! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Wrong password.',
            ], 401);
        }

        // Se l'account e disattivato, niente login.
        if (! $user->is_active) {
            return response()->json([
                'message' => 'Account is disabled.',
            ], 403);
        }

        // Nuovo token ad ogni login.
        $token = $this->jwtService->createToken($user);

        return response()->json([
            'message' => 'Login completed.',
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        // Il frontend usa questo endpoint per ricostruire la sessione.
        return response()->json($request->user());
    }

    public function logout(Request $request): JsonResponse
    {
        // Il middleware salva il payload JWT nella request.
        $payload = $request->attributes->get('jwt_payload');

        if (is_array($payload)) {
            $jti = $payload['jti'] ?? null;
            $exp = $payload['exp'] ?? null;

            if (is_string($jti) && $jti !== '' && is_int($exp)) {
                // Metto il token in blacklist: da qui in poi non deve piu passare.
                DB::table('jwt_token_blacklists')->insertOrIgnore([
                    'jti' => $jti,
                    'expires_at' => date('Y-m-d H:i:s', $exp),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        return response()->json([
            'message' => 'Logout completed.',
        ]);
    }
}

