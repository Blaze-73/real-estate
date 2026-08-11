<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\Rental;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $rentals = Rental::with('property')->get();

        if ($rentals->isEmpty()) {
            return;
        }

        foreach ($rentals as $rental) {
            $months = max(1, min(6, now()->diffInMonths($rental->start_date) ?: 1));
            $baseDate = now()->subMonths($months);

            for ($i = 0; $i < $months; $i++) {
                $dueDate = $baseDate->copy()->addMonths($i);
                $isPaid = $i < $months - 1 || $rental->status === 'active';

                Payment::firstOrCreate(
                    [
                        'rental_id' => $rental->id,
                        'payment_date' => $dueDate->toDateString(),
                    ],
                    [
                        'amount' => $rental->monthly_rent,
                        'payment_method' => $isPaid ? 'bank_transfer' : 'pending',
                        'status' => $isPaid ? 'paid' : 'pending',
                        'notes' => 'Monthly rent payment',
                    ]
                );
            }
        }
    }
}