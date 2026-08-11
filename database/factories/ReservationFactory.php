<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReservationFactory extends Factory
{
    public function definition(): array
    {
        $checkIn = fake()->dateTimeBetween('now', '+3 months');

        return [
            'property_id' => Property::factory(),
            'client_id' => Client::factory(),
            'check_in' => $checkIn,
            'check_out' => (clone $checkIn)->modify('+' . fake()->numberBetween(1, 14) . ' days'),
            'status' => fake()->randomElement(['pending', 'approved', 'rejected', 'archived']),
            'message' => fake()->optional()->sentence(),
        ];
    }
}
