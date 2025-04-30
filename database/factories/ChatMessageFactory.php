<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ChatMessageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'message' => $this->faker->sentence(),
            'is_from_bot' => $this->faker->boolean(),
            'timestamp' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
