<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Action'],
            ['name' => 'MMO'],
            ['name' => 'RPG'],
            ['name' => 'Adventure'],
            ['name' => 'Racing'],
            ['name' => 'Shooter'],
            ['name' => 'Stealth'],
            ['name' => 'Strategy'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
