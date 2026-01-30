<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Setting extends Model
{
    protected $collection = 'settings';
    
    protected $fillable = [
        'receipt_qr_url',
        'store_name',
        'store_address',
        'store_phone',
    ];
}
