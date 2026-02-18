<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'category' => 'RPG',
                'name' => 'Test Game RPG Alpha',
                'description' => 'Temporary product RPG',
                'price' => 19.99,
                'discount_percentage' => 25,
            ],
            [
                'category' => 'Action',
                'name' => 'Test Game Action Beta',
                'description' => 'Temporary product Action',
                'price' => 9.99,
                'discount_percentage' => 0,
            ],
            [
                'category' => 'MMO',
                'name' => 'Test Game MMO Gamma',
                'description' => 'Temporary product MMO',
                'price' => 14.99,
                'discount_percentage' => 30,
            ],
            [
                'category' => 'Adventure',
                'name' => 'Test Game Adventure Delta',
                'description' => 'Temporary product Adventure',
                'price' => 12.49,
                'discount_percentage' => 10,
            ],
            [
                'category' => 'Strategy',
                'name' => 'Test Game Strategy Epsilon',
                'description' => 'Temporary product Strategy',
                'price' => 11.00,
                'discount_percentage' => 0,
            ],
        ];

        foreach ($products as $item) {
            $category = Category::where('name', $item['category'])->first();

            if (! $category) {
                continue;
            }

            Product::updateOrCreate(
                ['name' => $item['name']],
                [
                    'category_id' => $category->id,
                    'description' => $item['description'],
                    'price' => $item['price'],
                    'discount_percentage' => $item['discount_percentage'],
                    'is_enabled' => true,
                ]
            );
        }
    }
}
