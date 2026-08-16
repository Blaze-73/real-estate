<?php

namespace Tests\Feature;

use App\Models\Promotion;
use App\Models\Property;
use App\Services\BookingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PromotionTest extends TestCase
{
    use RefreshDatabase;

    private function makeProperty(array $overrides = []): Property
    {
        return Property::factory()->create(array_merge([
            'nightly_price' => 1000,
            'cleaning_fee' => 150,
            'deposit' => 500,
            'status' => 'available',
        ], $overrides));
    }

    public function test_quote_applies_percent_promotion_for_min_nights(): void
    {
        $property = $this->makeProperty();
        Promotion::create([
            'name' => 'Moussem early-bird',
            'type' => 'percent',
            'value' => 15,
            'min_nights' => 3,
        ]);

        $quote = app(BookingService::class)->quote($property, '2026-09-10', '2026-09-15');

        $this->assertEquals(5000, $quote['subtotal']);
        $this->assertEquals(750, $quote['discount']);
        $this->assertEquals('Moussem early-bird', $quote['promotion']['name']);
        $this->assertEquals(4400, $quote['total']);
    }

    public function test_quote_skips_promotion_below_min_nights(): void
    {
        $property = $this->makeProperty();
        Promotion::create([
            'name' => 'Long stay',
            'type' => 'percent',
            'value' => 20,
            'min_nights' => 7,
        ]);

        $quote = app(BookingService::class)->quote($property, '2026-09-10', '2026-09-12');

        $this->assertEquals(0, $quote['discount']);
        $this->assertNull($quote['promotion']);
    }

    public function test_quote_skips_promotion_outside_valid_window(): void
    {
        $property = $this->makeProperty();
        Promotion::create([
            'name' => 'Seasonal',
            'type' => 'percent',
            'value' => 10,
            'valid_from' => '2026-07-01',
            'valid_to' => '2026-08-31',
        ]);

        $quote = app(BookingService::class)->quote($property, '2026-09-10', '2026-09-12');

        $this->assertEquals(0, $quote['discount']);
    }

    public function test_quote_respects_early_bird_deadline(): void
    {
        $property = $this->makeProperty();
        Promotion::create([
            'name' => 'Early bird',
            'type' => 'percent',
            'value' => 10,
            'book_by' => now()->subDay()->toDateString(),
        ]);

        $quote = app(BookingService::class)->quote($property, '2026-09-10', '2026-09-12');

        $this->assertEquals(0, $quote['discount']);
    }

    public function test_quote_applies_fixed_amount_capped_at_subtotal(): void
    {
        $property = $this->makeProperty();
        Promotion::create([
            'name' => 'Flat discount',
            'type' => 'fixed',
            'value' => 100000,
        ]);

        $quote = app(BookingService::class)->quote($property, '2026-09-10', '2026-09-12');

        $this->assertEquals(2000, $quote['discount']);
        $this->assertEquals(2000, $quote['subtotal']);
    }

    public function test_quote_ignores_paused_and_other_property_promotions(): void
    {
        $property = $this->makeProperty();
        $other = $this->makeProperty();

        Promotion::create(['name' => 'Paused', 'type' => 'percent', 'value' => 50, 'active' => false]);
        Promotion::create(['name' => 'Other property', 'type' => 'percent', 'value' => 50, 'property_id' => $other->id]);

        $quote = app(BookingService::class)->quote($property, '2026-09-10', '2026-09-12');

        $this->assertEquals(0, $quote['discount']);
        $this->assertNull($quote['promotion']);
    }

    public function test_quote_picks_the_biggest_discount_when_several_apply(): void
    {
        $property = $this->makeProperty();
        Promotion::create(['name' => 'Small', 'type' => 'percent', 'value' => 5]);
        Promotion::create(['name' => 'Big', 'type' => 'percent', 'value' => 25]);

        $quote = app(BookingService::class)->quote($property, '2026-09-10', '2026-09-12');

        $this->assertEquals('Big', $quote['promotion']['name']);
        $this->assertEquals(500, $quote['discount']);
    }

    public function test_create_booking_persists_promotion_and_discount(): void
    {
        $property = $this->makeProperty();
        $promotion = Promotion::create([
            'name' => 'Moussem early-bird',
            'type' => 'percent',
            'value' => 15,
            'min_nights' => 3,
        ]);

        $result = app(BookingService::class)->createBooking($property, [
            'check_in' => '2026-09-10',
            'check_out' => '2026-09-15',
            'guest_name' => 'Test Guest',
            'guest_email' => 'guest@example.com',
        ]);

        $this->assertEquals($promotion->id, $result['reservation']->promotion_id);
        $this->assertEquals(750, (float) $result['reservation']->discount);
        $this->assertEquals(4400, (float) $result['reservation']->total_price);
    }
}