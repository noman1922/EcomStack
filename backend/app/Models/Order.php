<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'items',
        'subtotal',
        'delivery_charge',
        'total_amount',
        'shipping_address',
        'payment_method',
        'payment_id',
        'payment_status',
        'order_status',
        'tracking_id'
    ];

    protected $casts = [
        'items' => 'array',
        'shipping_address' => 'array',
    ];
}
