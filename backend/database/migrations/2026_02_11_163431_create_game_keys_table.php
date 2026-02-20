<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('game_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('order_item_id')
                ->nullable()
                ->constrained('order_items')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->string('key_value')->unique();
            $table->string('status', 20)->default('available');
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('used_at')->nullable();
            $table->timestamps();

            $table->index(['product_id', 'status']);
            $table->index(['order_item_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_keys');
    }
};
