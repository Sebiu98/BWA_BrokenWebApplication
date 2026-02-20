<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameKey extends Model
{
    protected $fillable = [
        'product_id',
        'order_item_id',
        'key_value',
        'status',
        'assigned_at',
        'used_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}
