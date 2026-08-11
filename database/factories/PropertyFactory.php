<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PropertyFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->words(3, true);

        return [
            'title' => ucfirst($title),
            'slug' => Str::slug($title),
            'description' => fake()->paragraphs(3, true),
            'type' => fake()->randomElement(['house', 'villa', 'apartment', 'studio', 'commercial', 'seasonal', 'long_term']),
            'price' => fake()->randomFloat(2, 50000, 5000000),
            'surface' => fake()->randomFloat(2, 30, 500),
            'bedrooms' => fake()->numberBetween(0, 6),
            'bathrooms' => fake()->numberBetween(1, 4),
            'address' => fake()->address(),
            'city' => 'Asilah',
            'latitude' => fake()->latitude(35.45, 35.48),
            'longitude' => fake()->longitude(-6.05, -6.02),
            'status' => fake()->randomElement(['available', 'rented', 'pending', 'maintenance']),
            'featured' => fake()->boolean(20),
            'user_id' => User::factory(),
        ];
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'featured' => true,
        ]);
    }

    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'available',
        ]);
    }
}
