<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Setting extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'settings';

    protected $fillable = [
        'key',
        'value',
        'type', // 'hero', 'footer', 'store', 'general'
    ];

    protected $casts = [
        'value' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Helper methods to get specific settings
    public static function getHeroImages()
    {
        $setting = self::where('key', 'hero_images')->first();
        return $setting ? $setting->value : [];
    }

    public static function getFooterContent()
    {
        $setting = self::where('key', 'footer_content')->first();
        return $setting ? $setting->value : null;
    }

    public static function getStores()
    {
        $setting = self::where('key', 'stores')->first();
        return $setting ? $setting->value : [];
    }

    public static function getCurrencySettings()
    {
        $setting = self::where('key', 'currency')->first();
        return $setting ? $setting->value : ['symbol' => 'tk', 'position' => 'after'];
    }
}
