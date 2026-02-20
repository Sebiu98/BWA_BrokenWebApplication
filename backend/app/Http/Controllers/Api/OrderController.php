<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameKey;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use RuntimeException;

class OrderController extends Controller
{
    private function expirationValidationError(string $expiration): ?string
    {
        if (! preg_match('/^\d{2}\/\d{2}$/', $expiration)) {
            return 'Expiration must be in MM/YY format.';
        }

        [$monthText, $yearText] = explode('/', $expiration);
        $month = (int) $monthText;
        $year = (int) $yearText;

        if ($month < 1 || $month > 12) {
            return 'Expiration month must be between 01 and 12.';
        }

        $currentYear = (int) date('y');
        $currentMonth = (int) date('n');

        if ($year < $currentYear || ($year === $currentYear && $month < $currentMonth)) {
            return 'Card is expired.';
        }

        return null;
    }

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
            'payment' => ['required', 'array'],
            'payment.full_name' => ['required', 'string', 'min:2', 'max:80'],
            'payment.card_number' => ['required', 'string', 'regex:/^\d{13,19}$/'],
            'payment.expiration' => ['required', 'string'],
            'payment.cvc' => ['required', 'string', 'regex:/^\d{3,4}$/'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $expiration = (string) data_get($request->all(), 'payment.expiration', '');
        $expirationError = $this->expirationValidationError($expiration);
        if ($expirationError !== null) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => [
                    'payment.expiration' => [$expirationError],
                ],
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

        try {
            $order = DB::transaction(function () use ($authUser, $totalAmount, $orderItemsPayload) {
                $createdOrder = Order::query()->create([
                    'user_id' => $authUser->id,
                    'total_amount' => round($totalAmount, 2),
                    'status' => 'pending',
                ]);

                $createdItems = $createdOrder->items()->createMany($orderItemsPayload);

                foreach ($createdItems as $createdItem) {
                    $requiredKeys = (int) $createdItem->quantity;

                    $availableKeys = GameKey::query()
                        ->where('product_id', $createdItem->product_id)
                        ->where('status', 'available')
                        ->lockForUpdate()
                        ->orderBy('id')
                        ->limit($requiredKeys)
                        ->get();

                    if ($availableKeys->count() < $requiredKeys) {
                        throw new RuntimeException('Not enough keys available for one or more products.');
                    }

                    foreach ($availableKeys as $key) {
                        $key->order_item_id = $createdItem->id;
                        $key->status = 'assigned';
                        $key->assigned_at = now();
                        $key->save();
                    }
                }

                return $createdOrder;
            });
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        $order->load([
            'items.product:id,name,price,discount_percentage',
            'items.gameKeys:id,product_id,order_item_id,key_value,status,assigned_at,used_at',
        ]);

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
                'items.gameKeys:id,product_id,order_item_id,key_value,status,assigned_at,used_at',
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
                'items.gameKeys:id,product_id,order_item_id,key_value,status,assigned_at,used_at',
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
                'items.gameKeys:id,product_id,order_item_id,key_value,status,assigned_at,used_at',
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
            'status' => ['required', 'in:completed,cancelled'],
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

        $nextStatus = $validator->validated()['status'];
        $currentStatus = (string) $order->status;

        if ($currentStatus !== 'pending' && $currentStatus !== $nextStatus) {
            return response()->json([
                'message' => 'Order status can be updated only when it is pending.',
            ], 422);
        }

        DB::transaction(function () use ($order, $nextStatus) {
            $order->status = $nextStatus;
            $order->save();

            if ($nextStatus !== 'completed' && $nextStatus !== 'cancelled') {
                return;
            }

            $orderItemIds = $order->items()->pluck('id');

            if ($orderItemIds->isEmpty()) {
                return;
            }

            if ($nextStatus === 'completed') {
                GameKey::query()
                    ->whereIn('order_item_id', $orderItemIds)
                    ->where('status', 'assigned')
                    ->update([
                        'status' => 'used',
                        'used_at' => now(),
                    ]);

                return;
            }

            GameKey::query()
                ->whereIn('order_item_id', $orderItemIds)
                ->where('status', 'assigned')
                ->update([
                    'status' => 'available',
                    'order_item_id' => null,
                    'assigned_at' => null,
                    'used_at' => null,
                ]);
        });

        $order->load([
            'user:id,email',
            'items.product:id,name,price,discount_percentage',
            'items.gameKeys:id,product_id,order_item_id,key_value,status,assigned_at,used_at',
        ]);

        return response()->json([
            'message' => 'Order status updated successfully.',
            'order' => $order,
        ]);
    }
}
