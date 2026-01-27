<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'price' => $this->faker->randomFloat(2, 10, 1000),
            'stock' => $this->faker->numberBetween(10, 100),
            'image' => $this->faker->imageUrl(640, 480, 'products', true),
            'rating' => $this->faker->randomFloat(1, 1, 5),
            'review_count' => $this->faker->numberBetween(0, 500),
            'is_featured' => $this->faker->boolean(20), // 20% chance
            'is_on_sale' => $this->faker->boolean(20), // 20% chance
            'discount_price' => function (array $attributes) {
                return $attributes['is_on_sale'] 
                    ? $attributes['price'] * 0.8 
                    : null;
            },
        ];
    }
}
