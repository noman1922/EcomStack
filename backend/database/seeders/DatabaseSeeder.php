<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        // Create Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            ['name' => 'Admin User', 'role' => 'admin', 'password' => bcrypt('admin123')]
        );
        // Force update password just in case it was wrong
        $admin->password = bcrypt('admin123');
        $admin->save();

        // Create Customer User
        User::factory()->create([
            'name' => 'Customer User',
            'email' => 'customer@example.com',
            'role' => 'customer',
        ]);

        // Create Categories
        $categories = \App\Models\Category::factory(5)->create();

        // Create Products for each category
        foreach ($categories as $category) {
            \App\Models\Product::factory(10)->create([
                'category_id' => $category->id,
            ]);
        }
        
    }
}
