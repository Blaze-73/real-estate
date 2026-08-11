<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SettingSeeder::class,
            UserSeeder::class,
            PropertySeeder::class,
            ClientSeeder::class,
            ReservationSeeder::class,
            RentalSeeder::class,
            PaymentSeeder::class,
            TestimonialSeeder::class,
            ContactSeeder::class,
        ]);
    }
}
