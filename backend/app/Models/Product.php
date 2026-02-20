<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'price',
        'discount_percentage',
        'category_id',
        'description',
        'is_enabled',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount_percentage' => 'integer',
        'is_enabled' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function gameKeys()
    {
        return $this->hasMany(GameKey::class);
    }
}
