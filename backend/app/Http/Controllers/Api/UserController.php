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

        if (! $authUser || $authUser->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden.',
            ], 403);
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
        $adminCheck = $this->ensureAdmin($request);
        if ($adminCheck) {
            return $adminCheck;
        }

        $user = User::query()->find($id);
        if (! $user) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
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
