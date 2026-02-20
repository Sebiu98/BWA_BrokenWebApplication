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
    // Qui iniettiamo il servizio JWT, cosi il controller non gestisce firma/encode a mano.
    public function __construct(private JwtService $jwtService)
    {
    }

    public function register(Request $request): JsonResponse
    {
        // Step 1: validazione campi base.
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

        // Step 2: creiamo l'utente nel DB (password hashata dal model User).
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

        // Step 3: generiamo un token JWT da usare nelle chiamate protette.
        $token = $this->jwtService->createToken($user);

        return response()->json([
            'message' => 'Registration completed.',
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        // Step 1: validazione credenziali inviate.
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

        // Step 2: cerchiamo utente per email.
        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        // Se account disabilitato blocchiamo login.
        if (! $user->is_active) {
            return response()->json([
                'message' => 'Account is disabled.',
            ], 403);
        }

        // Step 3: JWT nuovo ad ogni login.
        $token = $this->jwtService->createToken($user);

        return response()->json([
            'message' => 'Login completed.',
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        // Utile al frontend per ricostruire la sessione da token.
        return response()->json($request->user());
    }

    public function logout(Request $request): JsonResponse
    {
        // Prende payload letto dal middleware JWT (contiene jti/exp).
        $payload = $request->attributes->get('jwt_payload');

        if (is_array($payload)) {
            $jti = $payload['jti'] ?? null;
            $exp = $payload['exp'] ?? null;

            if (is_string($jti) && $jti !== '' && is_int($exp)) {
                // Blacklist: da ora questo token e considerato non valido.
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
