<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameKey extends Model
{
    protected $fillable = [
        'order_id',
        'key_value',
        'is_used',
        'assigned_at',
    ];

    protected $casts = [
        'is_used' => 'boolean',
        'assigned_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
