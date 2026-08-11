<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class TestimonialFactory extends Factory
{
    public function definition(): array
    {
        return [
            'client_name' => fake()->name(),
            'client_photo' => null,
            'content' => fake()->paragraphs(2, true),
            'rating' => fake()->numberBetween(3, 5),
            'is_active' => true,
        ];
    }
}
