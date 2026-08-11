<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Admin', 'email' => 'admin@asilah.ma', 'password' => Hash::make('password'), 'role' => 'admin', 'phone' => '+212 6XX XXX XXX'],
            ['name' => 'Manager', 'email' => 'manager@asilah.ma', 'password' => Hash::make('password'), 'role' => 'manager', 'phone' => '+212 6XX XXX XXX'],
            ['name' => 'Agent', 'email' => 'agent@asilah.ma', 'password' => Hash::make('password'), 'role' => 'agent', 'phone' => '+212 6XX XXX XXX'],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(['email' => $user['email']], $user);
        }
    }
}
