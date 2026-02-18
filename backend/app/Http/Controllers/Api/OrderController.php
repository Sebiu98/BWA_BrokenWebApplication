<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    private function discountedUnitPrice(Product $product): float
    {
        $basePrice = (float) $product->price;
        $discount = (int) $product->discount_percentage;
        $factor = (100 - $discount) / 100;

        return round($basePrice * $factor, 2);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $payload = $validator->validated();
        $items = $payload['items'];

        $groupedQuantities = [];
        for ($i = 0; $i < count($items); $i += 1) {
            $productId = (int) $items[$i]['product_id'];
            $quantity = (int) $items[$i]['quantity'];
            $groupedQuantities[$productId] = ($groupedQuantities[$productId] ?? 0) + $quantity;
        }

        $productIds = array_keys($groupedQuantities);
        $products = Product::query()
            ->where('is_enabled', true)
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        $totalAmount = 0;
        $orderItemsPayload = [];

        foreach ($groupedQuantities as $productId => $quantity) {
            $product = $products->get($productId);

            if (! $product) {
                return response()->json([
                    'message' => 'One or more products do not exist.',
                ], 422);
            }

            $unitPrice = $this->discountedUnitPrice($product);
            $totalAmount += $unitPrice * $quantity;

            $orderItemsPayload[] = [
                'product_id' => $productId,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
            ];
        }

        $order = DB::transaction(function () use ($authUser, $totalAmount, $orderItemsPayload) {
            $createdOrder = Order::query()->create([
                'user_id' => $authUser->id,
                'total_amount' => round($totalAmount, 2),
                'status' => 'completed',
            ]);

            $createdOrder->items()->createMany($orderItemsPayload);

            return $createdOrder;
        });

        $order->load(['items.product:id,name,price,discount_percentage']);

        return response()->json([
            'message' => 'Order created successfully.',
            'order' => $order,
        ], 201);
    }

    public function myOrders(Request $request): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        $orders = Order::query()
            ->with([
                'items.product:id,name,price,discount_percentage',
            ])
            ->where('user_id', $authUser->id)
            ->orderByDesc('id')
            ->get();

        return response()->json($orders);
    }

    public function adminOrders(Request $request): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser || $authUser->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden.',
            ], 403);
        }

        $orders = Order::query()
            ->with([
                'user:id,email',
                'items.product:id,name,price,discount_percentage',
            ])
            ->orderByDesc('id')
            ->get();

        return response()->json($orders);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        $order = Order::query()
            ->with([
                'user:id,email',
                'items.product:id,name,price,discount_percentage',
            ])
            ->find($id);

        if (! $order) {
            return response()->json([
                'message' => 'Order not found.',
            ], 404);
        }

        if ($authUser->role !== 'admin' && $order->user_id !== $authUser->id) {
            return response()->json([
                'message' => 'Forbidden.',
            ], 403);
        }

        return response()->json($order);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser || $authUser->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => ['required', 'in:pending,completed,cancelled'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $order = Order::query()->find($id);

        if (! $order) {
            return response()->json([
                'message' => 'Order not found.',
            ], 404);
        }

        $order->status = $validator->validated()['status'];
        $order->save();
        $order->load([
            'user:id,email',
            'items.product:id,name,price,discount_percentage',
        ]);

        return response()->json([
            'message' => 'Order status updated successfully.',
            'order' => $order,
        ]);
    }
}
