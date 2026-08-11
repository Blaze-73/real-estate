<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        $clients = [
            ['name' => 'Ahmed Benbrahim', 'phone' => '+212 661 234 567', 'email' => 'ahmed.benbrahim@example.com', 'address' => 'Rabat, Morocco'],
            ['name' => 'Fatima Zahra El Ouafi', 'phone' => '+212 662 345 678', 'email' => 'fatima.elouafi@example.com', 'address' => 'Casablanca, Morocco'],
            ['name' => 'Youssef Mansouri', 'phone' => '+212 663 456 789', 'email' => 'youssef.mansouri@example.com', 'address' => 'Tangier, Morocco'],
            ['name' => 'Leila Chraibi', 'phone' => '+212 664 567 890', 'email' => 'leila.chraibi@example.com', 'address' => 'Fes, Morocco'],
            ['name' => 'Karim Idrissi', 'phone' => '+212 665 678 901', 'email' => 'karim.idrissi@example.com', 'address' => 'Asilah, Morocco'],
            ['name' => 'Sophie Laurent', 'phone' => '+33 6 12 34 56 78', 'email' => 'sophie.laurent@example.fr', 'address' => 'Paris, France'],
        ];

        foreach ($clients as $client) {
            Client::firstOrCreate(['email' => $client['email']], $client);
        }
    }
}