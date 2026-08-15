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
            ['key' => 'commission_sale_rate', 'value' => '2.5'],
            ['key' => 'commission_rent_rate', 'value' => '10'],
            ['key' => 'social_facebook', 'value' => '#'],
            ['key' => 'social_instagram', 'value' => '#'],
            ['key' => 'social_whatsapp', 'value' => '#'],
            ['key' => 'about_us', 'value' => 'We are a small agency based in Asilah. We look after holiday rentals, long-term lets and sales along the northern coast — mostly for people we know by name.'],
            ['key' => 'mission', 'value' => 'To manage properties the way we would manage our own — honest pricing, clear contracts and someone on the ground who picks up when guests call.'],
            ['key' => 'vision', 'value' => 'To stay a small, known team — trusted by the owners who leave us their keys and by the guests who keep coming back.'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], ['value' => $setting['value']]);
        }
    }
}
