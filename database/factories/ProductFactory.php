<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph(),
            'price' => $this->faker->randomFloat(2, 10, 500),
            'stock' => $this->faker->numberBetween(0, 100),
            'category' => $this->faker->randomElement(['Electronics', 'Clothing', 'Home', 'Books', 'Toys']),
            'image_url' => $this->faker->imageUrl(300, 300, 'products'),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
