<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = ['image', 'title', 'subtitle', 'link', 'is_active'];
}
