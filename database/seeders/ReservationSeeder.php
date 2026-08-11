<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Property;
use App\Models\Reservation;
use Illuminate\Database\Seeder;

class ReservationSeeder extends Seeder
{
    public function run(): void
    {
        $clients = Client::pluck('id')->all();
        $properties = Property::pluck('id')->all();

        if (empty($clients) || empty($properties)) {
            return;
        }

        $seedReservations = [
            ['property_index' => 5, 'check_in' => now()->addDays(2)->toDateString(), 'check_out' => now()->addDays(9)->toDateString(), 'status' => 'pending', 'message' => 'We would like to book this beach house for a family holiday.'],
            ['property_index' => 11, 'check_in' => now()->addDays(5)->toDateString(), 'check_out' => now()->addDays(12)->toDateString(), 'status' => 'pending', 'message' => 'Interested in a creative getaway. Is the studio available?'],
            ['property_index' => 5, 'check_in' => now()->subDays(20)->toDateString(), 'check_out' => now()->subDays(13)->toDateString(), 'status' => 'approved', 'message' => 'Confirmed summer booking.'],
            ['property_index' => 11, 'check_in' => now()->subDays(40)->toDateString(), 'check_out' => now()->subDays(33)->toDateString(), 'status' => 'archived', 'message' => 'Past seasonal rental.'],
        ];

        foreach ($seedReservations as $i => $data) {
            $property = $properties[$data['property_index'] % count($properties)];

            Reservation::firstOrCreate(
                [
                    'property_id' => $property,
                    'check_in' => $data['check_in'],
                    'client_id' => $clients[$i % count($clients)],
                ],
                [
                    'client_id' => $clients[$i % count($clients)],
                    'check_out' => $data['check_out'],
                    'status' => $data['status'],
                    'message' => $data['message'],
                ]
            );
        }
    }
}