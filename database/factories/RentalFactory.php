<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

class RentalFactory extends Factory
{
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-6 months', '+1 month');

        return [
            'property_id' => Property::factory(),
            'client_id' => Client::factory(),
            'start_date' => $startDate,
            'end_date' => (clone $startDate)->modify('+' . fake()->numberBetween(3, 24) . ' months'),
            'monthly_rent' => fake()->randomFloat(2, 2000, 50000),
            'deposit' => fake()->randomFloat(2, 2000, 50000),
            'status' => fake()->randomElement(['active', 'upcoming', 'expired']),
            'contract_file' => null,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
