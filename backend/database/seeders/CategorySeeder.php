<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Electronics', 'slug' => 'electronics', 'icon' => 'Smartphone'],
            ['name' => 'Fashion', 'slug' => 'fashion', 'icon' => 'Shirt'],
            ['name' => 'Home & Kitchen', 'slug' => 'home-kitchen', 'icon' => 'Home'],
            ['name' => 'Books', 'slug' => 'books', 'icon' => 'BookOpen'],
            ['name' => 'Groceries', 'slug' => 'groceries', 'icon' => 'ShoppingBasket'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
