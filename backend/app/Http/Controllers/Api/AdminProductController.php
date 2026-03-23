<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminProductController extends Controller
{
    private function adminProductBaseQuery()
    {
        return Product::query()
            ->with('category')
            ->withCount([
                'gameKeys as total_keys_count',
                'gameKeys as available_keys_count' => function ($query) {
                    $query->where('status', 'available');
                },
            ]);
    }

    private function loadAdminProduct(Product $product): Product
    {
        $product->load('category');
        $product->loadCount([
            'gameKeys as total_keys_count',
            'gameKeys as available_keys_count' => function ($query) {
                $query->where('status', 'available');
            },
        ]);

        return $product;
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
        // accesso admin deciso da Host, quindi bypassabile via proxy/intercept.
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

        $products = $this->adminProductBaseQuery()
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
        // Nuovi prodotti nascono disabilitati; verranno attivati solo dopo il caricamento key.
        $validated['is_enabled'] = false;

        $product = Product::query()->create($validated);
        $product = $this->loadAdminProduct($product);

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
        $product = $this->loadAdminProduct($product);

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
        $product = $this->loadAdminProduct($product);

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

        if ($product->orderItems()->exists()) {
            return response()->json([
                'message' => 'Product cannot be deleted because it is used by existing orders.',
            ], 409);
        }

        try {
            DB::transaction(function () use ($product) {
                $product->gameKeys()->delete();
                $product->delete();
            });
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
