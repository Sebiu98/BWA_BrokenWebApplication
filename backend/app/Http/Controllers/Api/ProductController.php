<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = (string) $request->query('search', '');
        $category = (string) $request->query('category', '');

        $query = Product::query()
            ->with('category')
            ->where('is_enabled', true);

        if ($search !== '') {
            $query->where('name', 'like', '%' . $search . '%');
        }

        if ($category !== '') {
            $query->whereHas('category', function ($categoryQuery) use ($category) {
                $categoryQuery->where('name', $category);
            });
        }

        $products = $query
            ->orderBy('id')
            ->get();

        return response()->json($products);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::query()
            ->with('category')
            ->where('is_enabled', true)
            ->findOrFail($id);

        return response()->json($product);
    }
}
