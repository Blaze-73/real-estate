<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Property;
use App\Models\Rental;
use Illuminate\Database\Seeder;

class RentalSeeder extends Seeder
{
    public function run(): void
    {
        $clients = Client::pluck('id')->all();
        $properties = Property::pluck('id')->all();

        if (empty($clients) || empty($properties)) {
            return;
        }

        $seedRentals = [
            ['property_index' => 5, 'start_date' => now()->subMonths(2)->toDateString(), 'end_date' => now()->addMonths(4)->toDateString(), 'monthly_rent' => 4500, 'deposit' => 4500, 'status' => 'active'],
            ['property_index' => 11, 'start_date' => now()->addMonth()->toDateString(), 'end_date' => now()->addMonths(7)->toDateString(), 'monthly_rent' => 2500, 'deposit' => 2500, 'status' => 'upcoming'],
            ['property_index' => 8, 'start_date' => now()->subMonths(6)->toDateString(), 'end_date' => now()->subMonth()->toDateString(), 'monthly_rent' => 3500, 'deposit' => 3500, 'status' => 'expired'],
        ];

        foreach ($seedRentals as $i => $data) {
            $property = $properties[$data['property_index'] % count($properties)];

            Rental::firstOrCreate(
                [
                    'property_id' => $property,
                    'client_id' => $clients[$i % count($clients)],
                    'start_date' => $data['start_date'],
                ],
                [
                    'end_date' => $data['end_date'],
                    'monthly_rent' => $data['monthly_rent'],
                    'deposit' => $data['deposit'],
                    'status' => $data['status'],
                ]
            );
        }
    }
}