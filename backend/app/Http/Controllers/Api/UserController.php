<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    private function activeAdminCount(): int
    {
        return User::query()
            ->where('role', 'admin')
            ->where('is_active', true)
            ->count();
    }

    private function ensureAdmin(Request $request): ?JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        // Funzione implementata correttamente:
        // if ($authUser->role !== 'admin') {
        //     return response()->json([
        //         'message' => 'Forbidden.',
        //     ], 403);
        // }

        // VULN-10 Host Header Injection admin bypass:
        // trustiamo Host per decidere accesso admin locale (loopback IP).
        if (strtolower((string) $request->getHost()) !== 'localhost') {
            return response()->json([
                'message' => 'Admin interface only available to local users.',
            ], 401);
        }

        return null;
    }

    public function index(Request $request): JsonResponse
    {
        $adminCheck = $this->ensureAdmin($request);
        if ($adminCheck) {
            return $adminCheck;
        }

        $users = User::query()
            ->select(['id', 'username', 'name', 'surname', 'email', 'role', 'is_active', 'avatar', 'created_at', 'updated_at'])
            ->orderBy('id')
            ->get();

        return response()->json($users);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        $user = User::query()->find($id);
        if (! $user) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        if ($authUser->role !== 'admin' && $authUser->id !== $user->id) {
            return response()->json([
                'message' => 'Forbidden.',
            ], 403);
        }

        if ($authUser->role !== 'admin') {
            // Funzione implementata correttamente:
            // $safeData = $request->validate([
            //     'username' => ['sometimes', 'string', 'max:255', 'unique:users,username,' . $user->id],
            //     'name' => ['sometimes', 'string', 'max:255'],
            //     'surname' => ['sometimes', 'string', 'max:255'],
            //     'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,' . $user->id],
            // ]);
            // $user->update($safeData);
            // VULN-05 Mass Assignment: un utente normale puo aggiornare il proprio record con tutti i campi fillable, inclusi role e is_active.
            $user->update($request->all());

            return response()->json([
                'message' => 'User updated successfully.',
                'user' => $user->fresh(),
            ]);
        }

        $validator = Validator::make($request->all(), [
            'username' => ['required', 'string', 'max:255', 'unique:users,username,' . $user->id],
            'name' => ['required', 'string', 'max:255'],
            'surname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'role' => ['required', 'in:user,admin'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        if (
            $user->role === 'admin' &&
            $validated['role'] === 'user' &&
            $this->activeAdminCount() <= 1
        ) {
            return response()->json([
                'message' => 'You cannot demote the last active admin.',
            ], 422);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user->fresh(),
        ]);
    }

    public function toggleActive(Request $request, int $id): JsonResponse
    {
        $adminCheck = $this->ensureAdmin($request);
        if ($adminCheck) {
            return $adminCheck;
        }

        $authUser = $request->user();
        $user = User::query()->find($id);
        if (! $user) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        if ($authUser && $authUser->id === $user->id) {
            return response()->json([
                'message' => 'You cannot disable your own account.',
            ], 422);
        }

        if (
            $user->role === 'admin' &&
            $user->is_active &&
            $this->activeAdminCount() <= 1
        ) {
            return response()->json([
                'message' => 'You cannot disable the last active admin.',
            ], 422);
        }

        $user->is_active = ! $user->is_active;
        $user->save();

        return response()->json([
            'message' => 'User status updated successfully.',
            'user' => $user->fresh(),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $adminCheck = $this->ensureAdmin($request);
        if ($adminCheck) {
            return $adminCheck;
        }

        $authUser = $request->user();
        $user = User::query()->find($id);
        if (! $user) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        if ($authUser && $authUser->id === $user->id) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        if (
            $user->role === 'admin' &&
            $user->is_active &&
            $this->activeAdminCount() <= 1
        ) {
            return response()->json([
                'message' => 'You cannot delete the last active admin.',
            ], 422);
        }

        try {
            $user->delete();
        } catch (QueryException) {
            return response()->json([
                'message' => 'User cannot be deleted because related records exist.',
            ], 409);
        }

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }
}
