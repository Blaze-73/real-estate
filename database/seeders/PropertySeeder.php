<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\User;
use Illuminate\Database\Seeder;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        $agent = User::where('role', 'agent')->first() ?? User::first();

        if (!$agent) {
            $this->command?->warn('No user available to attach properties to. Run UserSeeder first.');

            return;
        }

        $imagePool = [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
            'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea',
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde',
            'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d',
            'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
            'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
        ];

        $properties = [
            [
                'title' => 'Modern Apartment with Sea View',
                'type' => 'apartment',
                'price' => 850000.00,
                'surface' => 85.00,
                'bedrooms' => 2,
                'bathrooms' => 1,
                'address' => 'Avenue Mohammed V',
                'description' => 'Beautiful modern apartment with panoramic sea views. Recently renovated with high-end finishes. Walking distance to the beach and medina.',
                'featured' => true,
                'status' => 'available',
                'amenities' => ['sea_view', 'balcony', 'wifi', 'kitchen', 'ac', 'washing_machine'],
            ],
            [
                'title' => 'Traditional Moroccan Villa',
                'type' => 'villa',
                'price' => 2500000.00,
                'surface' => 250.00,
                'bedrooms' => 4,
                'bathrooms' => 3,
                'address' => 'Quartier Riad',
                'description' => 'Stunning traditional Moroccan villa with a beautiful garden and courtyard. Features authentic zellige tilework and carved plaster.',
                'featured' => true,
                'status' => 'available',
                'amenities' => ['garden', 'parking', 'kitchen', 'heating', 'fireplace', 'security'],
            ],
            [
                'title' => 'Cozy Studio Near Beach',
                'type' => 'studio',
                'price' => 350000.00,
                'surface' => 35.00,
                'bedrooms' => 0,
                'bathrooms' => 1,
                'address' => 'Rue de la Plage',
                'description' => 'Charming studio apartment just 2 minutes from the beach. Perfect for singles or couples. Fully furnished.',
                'featured' => false,
                'status' => 'available',
                'amenities' => ['beachfront', 'wifi', 'kitchen', 'ac', 'tv'],
            ],
            [
                'title' => 'Family House with Garden',
                'type' => 'house',
                'price' => 1200000.00,
                'surface' => 150.00,
                'bedrooms' => 3,
                'bathrooms' => 2,
                'address' => 'Quartier Al Amal',
                'description' => 'Spacious family home with a large garden and terrace. Quiet neighborhood close to schools and shops.',
                'featured' => false,
                'status' => 'available',
                'amenities' => ['garden', 'terrace', 'parking', 'kitchen', 'family_friendly', 'barbecue'],
            ],
            [
                'title' => 'Commercial Space Downtown',
                'type' => 'commercial',
                'price' => 1800000.00,
                'surface' => 120.00,
                'bedrooms' => 0,
                'bathrooms' => 1,
                'address' => 'Place Moulay Ismail',
                'description' => 'Prime commercial space in the heart of Asilah. High foot traffic area, perfect for a retail store or caf\u00e9.',
                'featured' => true,
                'status' => 'available',
                'amenities' => ['parking', 'security', 'elevator', 'kitchen'],
            ],
            [
                'title' => 'Seasonal Beach House',
                'type' => 'seasonal',
                'price' => 4500.00,
                'nightly_price' => 4500.00,
                'surface' => 100.00,
                'bedrooms' => 2,
                'bathrooms' => 1,
                'address' => "Corniche d'Asilah",
                'description' => 'Beautiful beach house available for seasonal rental. Direct beach access, terrace with sea views, and outdoor shower.',
                'featured' => false,
                'status' => 'available',
                'latitude' => 35.4650,
                'longitude' => -6.0350,
                'amenities' => ['beachfront', 'terrace', 'garden', 'parking', 'barbecue', 'sea_view'],
            ],
            [
                'title' => 'Luxury Apartment with Pool',
                'type' => 'apartment',
                'price' => 1500000.00,
                'surface' => 130.00,
                'bedrooms' => 3,
                'bathrooms' => 2,
                'address' => 'Residence Al Andalous',
                'description' => 'High-end luxury apartment in a gated community with swimming pool, gym, and 24/7 security.',
                'featured' => true,
                'status' => 'available',
                'amenities' => ['pool', 'gym', 'security', 'parking', 'ac', 'elevator', 'wifi'],
            ],
            [
                'title' => 'Long Term Rental - Modern Flat',
                'type' => 'long_term',
                'price' => 3500.00,
                'monthly_price' => 3500.00,
                'surface' => 70.00,
                'bedrooms' => 1,
                'bathrooms' => 1,
                'address' => 'Avenue Hassan II',
                'description' => 'Modern one-bedroom flat available for long-term rental. Fully equipped kitchen, balcony, and parking space included.',
                'featured' => false,
                'status' => 'available',
                'amenities' => ['kitchen', 'balcony', 'parking', 'wifi', 'washing_machine', 'tv'],
            ],
            [
                'title' => 'Villa with Pool - Asilah Heights',
                'type' => 'villa',
                'price' => 3500000.00,
                'surface' => 350.00,
                'bedrooms' => 5,
                'bathrooms' => 4,
                'address' => 'Lotissement Al Amal',
                'description' => 'Magnificent villa in the exclusive Asilah Heights area. Private pool, landscaped garden, and panoramic ocean views.',
                'featured' => true,
                'status' => 'available',
                'amenities' => ['pool', 'garden', 'sea_view', 'parking', 'jacuzzi', 'security', 'barbecue', 'kitchen'],
            ],
            [
                'title' => 'Traditional House in Medina',
                'type' => 'house',
                'price' => 950000.00,
                'surface' => 110.00,
                'bedrooms' => 2,
                'bathrooms' => 2,
                'address' => 'Medina',
                'description' => 'Beautiful traditional house inside the historic medina of Asilah. Recently restored with modern amenities while preserving original character.',
                'featured' => false,
                'status' => 'available',
                'amenities' => ['wifi', 'heating', 'kitchen', 'terrace', 'fireplace', 'family_friendly'],
            ],
            [
                'title' => 'Penthouse Suite - Ocean View',
                'type' => 'apartment',
                'price' => 2200000.00,
                'surface' => 180.00,
                'bedrooms' => 3,
                'bathrooms' => 2,
                'address' => 'Rue des Arts',
                'description' => 'Stunning penthouse with 360-degree ocean views. Private rooftop terrace, modern design, and premium finishes throughout.',
                'featured' => true,
                'status' => 'available',
                'amenities' => ['sea_view', 'terrace', 'balcony', 'ac', 'elevator', 'jacuzzi', 'gym'],
            ],
            [
                'title' => 'Seasonal Studio - Artistic Quarter',
                'type' => 'seasonal',
                'price' => 2500.00,
                'nightly_price' => 2500.00,
                'surface' => 30.00,
                'bedrooms' => 0,
                'bathrooms' => 1,
                'address' => 'Quartier des Artistes',
                'description' => 'Charming seasonal studio in the artistic quarter. Perfect for a creative getaway. Walking distance to galleries and restaurants.',
                'featured' => false,
                'status' => 'available',
                'amenities' => ['wifi', 'kitchen', 'ac', 'tv'],
            ],
            [
                'title' => 'Commercial Property - Main Avenue',
                'type' => 'commercial',
                'price' => 3200000.00,
                'surface' => 200.00,
                'bedrooms' => 0,
                'bathrooms' => 2,
                'address' => 'Avenue de la Libert\u00e9',
                'description' => 'Large commercial property on the main avenue. Ideal for a restaurant, showroom, or office space. Double frontage.',
                'featured' => false,
                'status' => 'available',
                'amenities' => ['parking', 'security', 'elevator', 'heating', 'ac'],
            ],
            [
                'title' => 'Garden Apartment - Family Complex',
                'type' => 'apartment',
                'price' => 650000.00,
                'surface' => 90.00,
                'bedrooms' => 2,
                'bathrooms' => 1,
                'address' => 'Residence Al Firdaous',
                'description' => "Ground floor apartment with private garden access. Part of a well-maintained family complex with children's play area.",
                'featured' => false,
                'status' => 'available',
                'amenities' => ['garden', 'family_friendly', 'parking', 'kitchen', 'ac', 'wifi'],
            ],
            [
                'title' => 'Riad-Style Villa - Old Town',
                'type' => 'villa',
                'price' => 2800000.00,
                'surface' => 280.00,
                'bedrooms' => 4,
                'bathrooms' => 3,
                'address' => 'Ancienne Medina',
                'description' => 'Exquisite riad-style villa blending Andalusian and Moroccan architecture. Central courtyard with fountain, rooftop terrace, and hammam.',
                'featured' => true,
                'status' => 'available',
                'amenities' => ['terrace', 'garden', 'fireplace', 'heating', 'security', 'wifi'],
            ],
        ];

        foreach ($properties as $index => $propertyData) {
            $propertyData['city'] = 'Asilah';
            $propertyData['user_id'] = $agent->id;
            $propertyData['latitude'] = $propertyData['latitude'] ?? fake()->latitude(35.45, 35.48);
            $propertyData['longitude'] = $propertyData['longitude'] ?? fake()->longitude(-6.05, -6.02);

            $property = Property::firstOrCreate(['title' => $propertyData['title']], $propertyData);

            if (empty($property->amenities) && !empty($propertyData['amenities'])) {
                $property->update(['amenities' => $propertyData['amenities']]);
            }

            if ($property->images()->count() === 0) {
                $count = min(3, fake()->numberBetween(2, 4));
                for ($i = 0; $i < $count; $i++) {
                    $seed = (($index * 10) + $i) % count($imagePool);
                    $path = $imagePool[$seed] . '?auto=format&fit=crop&w=1200&q=80';

                    PropertyImage::create([
                        'property_id' => $property->id,
                        'image_path' => $path,
                        'is_primary' => $i === 0,
                        'sort_order' => $i,
                    ]);
                }
            }
        }
    }
}