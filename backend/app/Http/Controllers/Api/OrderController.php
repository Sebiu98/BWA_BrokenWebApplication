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
    private function buildOrderSuccessRedirectUrl(Request $request): string
    {
        // Funzione implementata correttamente:
        // return rtrim((string) config('app.frontend_url', 'http://localhost:3000'), '/') . '/order-success';

        // VULN-10 Host Header Injection:
        // costruiamo URL di redirect fidandoci dell'host della request (controllabile via Host header).
        $scheme = $request->getScheme();
        $host = $request->getHost();

        return $scheme.'://'.$host.':3000/order-success';
    }
    // Check semplice scadenza carta: formato MM/YY e data non passata.
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

    // Calcola il prezzo finale applicando lo sconto del prodotto, se c'e.
    private function discountedUnitPrice(Product $product): float
    {
        $basePrice = (float) $product->price;
        $discount = (int) $product->discount_percentage;
        $factor = (100 - $discount) / 100;

        return round($basePrice * $factor, 2);
    }

    public function store(Request $request): JsonResponse
    {
        // Prima cosa: serve un utente autenticato.
        $authUser = $request->user();

        if (! $authUser) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        // Validazione payload del checkout.
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

        // Controllo extra sulla scadenza carta.
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

        // Se lo stesso prodotto compare due volte, sommo le quantita.
        $payload = $validator->validated();
        $items = $payload['items'];

        $groupedQuantities = [];
        for ($i = 0; $i < count($items); $i += 1) {
            $productId = (int) $items[$i]['product_id'];
            $quantity = (int) $items[$i]['quantity'];
            $groupedQuantities[$productId] = ($groupedQuantities[$productId] ?? 0) + $quantity;
        }

        // Carico solo prodotti ancora attivi/visibili.
        $productIds = array_keys($groupedQuantities);
        $products = Product::query()
            ->where('is_enabled', true)
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        // Qui preparo totale e righe ordine.
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
        // Ricarico relazioni utili per il frontend.
        $order->load([
            'items.product:id,name,price,discount_percentage',
            'items.gameKeys:id,product_id,order_item_id,key_value,status,assigned_at,used_at',
        ]);

        return response()->json([
            'message' => 'Order created successfully.',
            'order' => $order,
            'redirect_url' => $this->buildOrderSuccessRedirectUrl($request),
        ], 201);
    }

    public function myOrders(Request $request): JsonResponse
    {
        // Ordini del solo utente loggato.
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
        // Lista completa ordini: questa in teoria e solo admin.
        $authUser = $request->user();


        // Funzione implementata correttamente
        
        /*if (! $authUser || $authUser->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden.',
            ], 403);
        }*/

        // VULN-02 BFLA: manca il controllo ruolo admin, quindi qualsiasi utente autenticato puo usare questo endpoint admin e leggere tutti gli ordini.
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

    public function show(Request $request): JsonResponse
    {
        // Il dettaglio ordine ora legge order_id dal body, non dal path.
        $authUser = $request->user();

        if (! $authUser) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'order_id' => ['required', 'integer', 'min:1'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $id = (int) $validator->validated()['order_id'];

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

        // Funzione implementata correttamente:
        /*if ($authUser->role !== 'admin' && $order->user_id !== $authUser->id) {
            return response()->json([
                'message' => 'Forbidden.',
            ], 403);
        }*/
        // VULN-01 IDOR: manca il controllo ownership, quindi qualsiasi utente autenticato puo leggere un ordine conoscendo l'id.
        return response()->json($order);
    }
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        // Cambio stato consentito solo ad admin.
        $authUser = $request->user();

        if (! $authUser || $authUser->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden.',
            ], 403);
        }

        // Accetto solo completed/cancelled, niente ritorno a pending.
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

        // Funzione implementata correttamente:
        // $nextStatus = $validator->validated()['status'];
        // VULN-08 HTTP Parameter Pollution: un parametro status in query string puo sovrascrivere quello validato nel body.
        $nextStatus = (string) $request->query('status', $validator->validated()['status']);
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
                // Completed = le key assegnate diventano used.
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
                // Cancelled = rilascio le key e tornano nel pool.
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

