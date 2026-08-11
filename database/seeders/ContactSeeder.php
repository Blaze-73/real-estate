<?php

namespace Database\Seeders;

use App\Models\Contact;
use Illuminate\Database\Seeder;

class ContactSeeder extends Seeder
{
    public function run(): void
    {
        $contacts = [
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah.johnson@example.com',
                'phone' => '+212 6XX XXX XXX',
                'subject' => 'Property Inquiry - Medina House',
                'message' => 'Hello, I am interested in the traditional house in the Medina. Could you please provide more details about the property and schedule a visit?',
                'is_read' => false,
            ],
            [
                'name' => 'Mohamed Alami',
                'email' => 'mohamed.alami@example.com',
                'phone' => '+212 6XX XXX XXX',
                'subject' => 'Rental Availability for Summer',
                'message' => 'Good morning, I would like to inquire about seasonal rentals available for July and August. We are a family of 4 looking for a beachfront property.',
                'is_read' => false,
            ],
            [
                'name' => 'Emma Thompson',
                'email' => 'emma.thompson@example.com',
                'phone' => '+212 6XX XXX XXX',
                'subject' => 'Investment Opportunity',
                'message' => 'Dear team, I am a foreign investor interested in purchasing commercial property in Asilah. Could you send me information about current listings and the buying process for non-residents?',
                'is_read' => true,
            ],
        ];

        foreach ($contacts as $contact) {
            Contact::firstOrCreate(
                ['email' => $contact['email'], 'subject' => $contact['subject']],
                $contact
            );
        }
    }
}
