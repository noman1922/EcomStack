<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Receipt extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'receipts';

    protected $fillable = [
        'receipt_number',    // RCP-XXXXXX
        'order_id',
        'user_id',
        'receipt_type',      // 'pos', 'online', 'manual'
        'items',             // Array of products
        'subtotal',
        'delivery_charge',
        'discount',          // For POS
        'total',
        'payment_method',
        'payment_status',
        'customer_name',
        'customer_phone',
        'customer_address',
        'qr_code_url',       // For POS receipts
        'tracking_id',       // For online/manual orders
        'generated_at',
        'generated_by'       // admin user ID for POS/manual
    ];

    protected $casts = [
        'items' => 'array',
        'generated_at' => 'datetime',
    ];

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Generate unique receipt number
    public static function generateReceiptNumber()
    {
        $lastReceipt = self::orderBy('created_at', 'desc')->first();
        $number = $lastReceipt ? intval(substr($lastReceipt->receipt_number, 4)) + 1 : 1;
        return 'RCP-' . str_pad($number, 6, '0', STR_PAD_LEFT);
    }
}
