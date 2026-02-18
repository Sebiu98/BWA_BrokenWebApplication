<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminProductController extends Controller
{
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

        $products = Product::query()
            ->with('category')
            ->orderBy('id')
            ->get();

        return response()->json($products);
    }

    public function store(Request $request): JsonResponse
    {
        $adminCheck = $this->ensureAdmin($request);
        if ($adminCheck) {
            return $adminCheck;
        }

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'price' => ['required', 'numeric', 'min:0'],
            'discount_percentage' => ['sometimes', 'integer', 'min:0', 'max:90'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'is_enabled' => ['sometimes', 'boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $validated['discount_percentage'] = array_key_exists('discount_percentage', $validated)
            ? (int) $validated['discount_percentage']
            : 0;
        $validated['is_enabled'] = array_key_exists('is_enabled', $validated)
            ? (bool) $validated['is_enabled']
            : true;

        $product = Product::query()->create($validated);
        $product->load('category');

        return response()->json([
            'message' => 'Product created successfully.',
            'product' => $product,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $adminCheck = $this->ensureAdmin($request);
        if ($adminCheck) {
            return $adminCheck;
        }

        $product = Product::query()->find($id);
        if (! $product) {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'price' => ['required', 'numeric', 'min:0'],
            'discount_percentage' => ['sometimes', 'integer', 'min:0', 'max:90'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'is_enabled' => ['sometimes', 'boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $product->update($validated);
        $product->load('category');

        return response()->json([
            'message' => 'Product updated successfully.',
            'product' => $product,
        ]);
    }

    public function toggleEnabled(Request $request, int $id): JsonResponse
    {
        $adminCheck = $this->ensureAdmin($request);
        if ($adminCheck) {
            return $adminCheck;
        }

        $product = Product::query()->find($id);
        if (! $product) {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        }

        $product->is_enabled = ! $product->is_enabled;
        $product->save();
        $product->load('category');

        return response()->json([
            'message' => 'Product availability updated successfully.',
            'product' => $product,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $adminCheck = $this->ensureAdmin($request);
        if ($adminCheck) {
            return $adminCheck;
        }

        $product = Product::query()->find($id);
        if (! $product) {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        }

        try {
            $product->delete();
        } catch (QueryException) {
            return response()->json([
                'message' => 'Product cannot be deleted because it is used by existing orders.',
            ], 409);
        }

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }
}
