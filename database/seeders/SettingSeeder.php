<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'company_name', 'value' => 'Asilah Real Estate'],
            ['key' => 'company_email', 'value' => 'contact@asilahrealestate.ma'],
            ['key' => 'company_phone', 'value' => '+212 5XX XXX XXX'],
            ['key' => 'company_address', 'value' => 'Asilah, Morocco'],
            ['key' => 'whatsapp_number', 'value' => '2126XXXXXXX'],
            ['key' => 'social_facebook', 'value' => '#'],
            ['key' => 'social_instagram', 'value' => '#'],
            ['key' => 'social_whatsapp', 'value' => '#'],
            ['key' => 'about_us', 'value' => 'Premium real estate agency in Asilah, offering exceptional properties and rental services across Northern Morocco.'],
            ['key' => 'mission', 'value' => 'To provide exceptional real estate services that exceed client expectations, combining local expertise with global standards.'],
            ['key' => 'vision', 'value' => 'To be the leading real estate agency in Northern Morocco, known for integrity, innovation, and outstanding client satisfaction.'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], ['value' => $setting['value']]);
        }
    }
}
