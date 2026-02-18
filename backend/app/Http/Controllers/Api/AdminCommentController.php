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

        if (! $authUser || $authUser->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden.',
            ], 403);
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
