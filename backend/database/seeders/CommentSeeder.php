<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Comment::query()->exists()) {
            return;
        }

        $user = User::query()->where('email', 'user@bwa.local')->first();
        $admin = User::query()->where('email', 'admin@bwa.local')->first();
        $productOne = Product::query()->where('name', 'Test Game RPG Alpha')->first();
        $productTwo = Product::query()->where('name', 'Test Game Action Beta')->first();

        if (! $user || ! $admin || ! $productOne || ! $productTwo) {
            return;
        }

        Comment::query()->create([
            'user_id' => $user->id,
            'product_id' => $productOne->id,
            'content' => 'Great key delivery and activation was instant.',
            'rating' => 5,
        ]);

        Comment::query()->create([
            'user_id' => $admin->id,
            'product_id' => $productOne->id,
            'content' => 'Stable purchase flow and no activation issues.',
            'rating' => 4,
        ]);

        Comment::query()->create([
            'user_id' => $user->id,
            'product_id' => $productTwo->id,
            'content' => 'Good price, would buy again.',
            'rating' => 4,
        ]);
    }
}
