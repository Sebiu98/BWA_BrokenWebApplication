<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCommentController extends Controller
{
    public function destroy(Request $request, int $id): JsonResponse
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
        // basta cambiare Host in localhost per passare il controllo.
        if (strtolower((string) $request->getHost()) !== 'localhost') {
            return response()->json([
                'message' => 'Admin interface only available to local users.',
            ], 401);
        }

        $comment = Comment::query()->find($id);
        if (! $comment) {
            return response()->json([
                'message' => 'Comment not found.',
            ], 404);
        }

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully.',
        ]);
    }
}
