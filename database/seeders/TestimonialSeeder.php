<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $testimonials = [
            [
                'client_name' => 'Ahmed Benbrahim',
                'content' => 'Excellent service! Found the perfect apartment in Asilah within a week. The team was very professional and helpful throughout the process.',
                'rating' => 5,
                'is_active' => true,
            ],
            [
                'client_name' => 'Fatima Zahra El Ouafi',
                'content' => 'I highly recommend Asilah Real Estate for anyone looking to buy property in Northern Morocco. Their knowledge of the local market is outstanding.',
                'rating' => 5,
                'is_active' => true,
            ],
            [
                'client_name' => 'Youssef Mansouri',
                'content' => 'Great experience renting a seasonal house for the summer. The property was exactly as described, and the staff was very responsive.',
                'rating' => 4,
                'is_active' => true,
            ],
            [
                'client_name' => 'Leila Chraibi',
                'content' => 'Professional and trustworthy agency. They helped us sell our villa at a great price. The whole process was smooth and transparent.',
                'rating' => 5,
                'is_active' => true,
            ],
            [
                'client_name' => 'Karim Idrissi',
                'content' => 'Good selection of properties and helpful staff. Would have liked more options in the lower price range, but overall a positive experience.',
                'rating' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($testimonials as $testimonial) {
            Testimonial::updateOrCreate(['client_name' => $testimonial['client_name']], $testimonial);
        }
    }
}
