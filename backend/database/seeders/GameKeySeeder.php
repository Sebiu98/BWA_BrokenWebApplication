<?php

namespace Database\Seeders;

use App\Models\GameKey;
use App\Models\Product;
use Illuminate\Database\Seeder;

class GameKeySeeder extends Seeder
{
    private function randomKeyValue(): string
    {
        $raw = strtoupper(bin2hex(random_bytes(10)));

        return implode('-', [
            substr($raw, 0, 5),
            substr($raw, 5, 5),
            substr($raw, 10, 5),
            substr($raw, 15, 5),
        ]);
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (GameKey::query()->exists()) {
            return;
        }

        $products = Product::query()->select(['id'])->get();
        $generated = [];

        foreach ($products as $product) {
            for ($i = 0; $i < 25; $i += 1) {
                do {
                    $candidate = $this->randomKeyValue();
                } while (
                    isset($generated[$candidate]) ||
                    GameKey::query()->where('key_value', $candidate)->exists()
                );

                $generated[$candidate] = true;

                GameKey::query()->create([
                    'product_id' => $product->id,
                    'key_value' => $candidate,
                    'status' => 'available',
                ]);
            }
        }
    }
}

