<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;
    protected $fillable = [
        'name', 
        'description', 
        'price', 
        'stock', 
        'image', 
        'category_id', 
        'brand', 
        'rating', 
        'review_count', 
        'is_featured', 
        'is_on_sale', 
        'discount_price', 
        'supplier_id'
    ];
}
