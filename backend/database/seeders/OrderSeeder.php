<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Order::query()->exists()) {
            return;
        }

        $user = User::query()->where('email', 'user@bwa.local')->first();
        $admin = User::query()->where('email', 'admin@bwa.local')->first();

        if (! $user || ! $admin) {
            return;
        }

        $productRpg = Product::query()->where('name', 'Test Game RPG Alpha')->first();
        $productAction = Product::query()->where('name', 'Test Game Action Beta')->first();
        $productMmo = Product::query()->where('name', 'Test Game MMO Gamma')->first();

        if (! $productRpg || ! $productAction || ! $productMmo) {
            return;
        }

        $orderUserOne = Order::query()->create([
            'user_id' => $user->id,
            'total_amount' => 29.98,
            'status' => 'completed',
        ]);

        $orderUserOne->items()->createMany([
            [
                'product_id' => $productRpg->id,
                'quantity' => 1,
                'unit_price' => 19.99,
            ],
            [
                'product_id' => $productAction->id,
                'quantity' => 1,
                'unit_price' => 9.99,
            ],
        ]);

        $orderUserTwo = Order::query()->create([
            'user_id' => $user->id,
            'total_amount' => 14.99,
            'status' => 'completed',
        ]);

        $orderUserTwo->items()->createMany([
            [
                'product_id' => $productMmo->id,
                'quantity' => 1,
                'unit_price' => 14.99,
            ],
        ]);

        $orderAdmin = Order::query()->create([
            'user_id' => $admin->id,
            'total_amount' => 19.98,
            'status' => 'completed',
        ]);

        $orderAdmin->items()->createMany([
            [
                'product_id' => $productAction->id,
                'quantity' => 2,
                'unit_price' => 9.99,
            ],
        ]);
    }
}
