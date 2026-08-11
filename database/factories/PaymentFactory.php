<?php

namespace Database\Factories;

use App\Models\Rental;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'rental_id' => Rental::factory(),
            'amount' => fake()->randomFloat(2, 2000, 50000),
            'payment_date' => fake()->dateTimeBetween('-1 year', 'now'),
            'payment_method' => fake()->randomElement(['cash', 'bank_transfer', 'check', 'credit_card']),
            'status' => fake()->randomElement(['paid', 'pending', 'overdue']),
            'receipt_file' => null,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
