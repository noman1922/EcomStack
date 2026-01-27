<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Product::create([
            'name' => 'Premium Wireless Headphones',
            'description' => 'High-quality sound with noise-canceling technology.',
            'price' => 199.99,
            'stock' => 50,
            'image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'
        ]);

        \App\Models\Product::create([
            'name' => 'Smart Watch Series 5',
            'description' => 'Track your fitness, heart rate, and notifications.',
            'price' => 299.99,
            'stock' => 30,
            'image' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'
        ]);

        \App\Models\Product::create([
            'name' => 'Portable Bluetooth Speaker',
            'description' => 'Waterproof speaker with 20 hours of battery life.',
            'price' => 79.99,
            'stock' => 100,
            'image' => 'https://images.unsplash.com/photo-1608156639585-34a0a56ee6b9?w=500&auto=format&fit=crop&q=60'
        ]);
    }
}
