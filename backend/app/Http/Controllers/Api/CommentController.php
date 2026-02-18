<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    public function index(int $id): JsonResponse
    {
        $product = Product::query()->find($id);

        if (! $product) {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        }

        $comments = Comment::query()
            ->with('user:id,username,name,surname')
            ->where('product_id', $product->id)
            ->orderByDesc('id')
            ->get();

        return response()->json($comments);
    }

    public function store(Request $request, int $id): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        $product = Product::query()->find($id);

        if (! $product) {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'content' => ['required', 'string', 'min:1', 'max:1000'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        $comment = Comment::query()->create([
            'product_id' => $product->id,
            'user_id' => $authUser->id,
            'content' => $validated['content'],
            'rating' => $validated['rating'],
        ]);

        $comment->load('user:id,username,name,surname');

        return response()->json([
            'message' => 'Comment created successfully.',
            'comment' => $comment,
        ], 201);
    }
}
