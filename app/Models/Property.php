<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Property extends Model
{
    /** @use HasFactory<\Database\Factories\PropertyFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'type',
        'price',
        'nightly_price',
        'monthly_price',
        'min_nights',
        'cleaning_fee',
        'deposit',
        'instant_book',
        'high_season_from',
        'high_season_to',
        'high_season_price',
        'cancellation_policy',
        'ical_url',
        'video_url',
        'amenities',
        'surface',
        'bedrooms',
        'bathrooms',
        'address',
        'city',
        'latitude',
        'longitude',
        'status',
        'featured',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'nightly_price' => 'decimal:2',
            'monthly_price' => 'decimal:2',
            'cleaning_fee' => 'decimal:2',
            'deposit' => 'decimal:2',
            'high_season_price' => 'decimal:2',
            'high_season_from' => 'date',
            'high_season_to' => 'date',
            'surface' => 'decimal:2',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'featured' => 'boolean',
            'instant_book' => 'boolean',
            'amenities' => 'array',
        ];
    }

    public static function makeUniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $suffix = 2;

        while (static::query()
            ->where('slug', $slug)
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $slug = $base . '-' . $suffix;
            $suffix++;
        }

        return $slug;
    }

    protected static function booted(): void
    {
        static::creating(function (Property $property) {
            if (empty($property->slug)) {
                $property->slug = static::makeUniqueSlug($property->title);
            }
        });

        static::updating(function (Property $property) {
            if ($property->isDirty('title') && !$property->isDirty('slug')) {
                $property->slug = static::makeUniqueSlug($property->title, $property->id);
            }
        });

        static::saved(function () {
            \Illuminate\Support\Facades\Cache::forget('featured_properties');
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function images()
    {
        return $this->hasMany(PropertyImage::class)->orderBy('sort_order');
    }

    public function primaryImage()
    {
        return $this->hasOne(PropertyImage::class)->where('is_primary', true);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function availabilityBlocks()
    {
        return $this->hasMany(PropertyAvailability::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function approvedReviews()
    {
        return $this->hasMany(Review::class)->approved();
    }

    public function rentals()
    {
        return $this->hasMany(Rental::class);
    }

    public function promotions()
    {
        return $this->hasMany(Promotion::class);
    }

    public function activePromotions()
    {
        return Promotion::active()
            ->where(function ($query) {
                $query->whereNull('property_id')->orWhere('property_id', $this->id);
            })
            ->orderBy('value', 'desc')
            ->get();
    }

    public function freeNightsNextMonth(): int
    {
        if (!$this->nightly_price) {
            return 0;
        }

        $start = now()->startOfDay();
        $end = $start->copy()->addDays(29);

        $blocked = [];
        $this->availabilityBlocks()
            ->whereDate('start_date', '<=', $end->toDateString())
            ->whereDate('end_date', '>=', $start->toDateString())
            ->get()
            ->each(function ($block) use (&$blocked, $start, $end) {
                $from = $block->start_date->greaterThan($start) ? $block->start_date : $start;
                $to = $block->end_date->lessThan($end) ? $block->end_date : $end;
                for ($day = $from->copy(); $day->lte($to); $day->addDay()) {
                    $blocked[$day->toDateString()] = true;
                }
            });

        $reservations = $this->reservations()
            ->whereIn('status', ['pending', 'approved'])
            ->where('check_in', '<', $end->copy()->addDay()->toDateString())
            ->where('check_out', '>', $start->toDateString())
            ->get(['check_in', 'check_out']);

        $free = 0;
        for ($day = $start->copy(); $day->lte($end); $day->addDay()) {
            $date = $day->toDateString();

            if (isset($blocked[$date])) {
                continue;
            }

            foreach ($reservations as $reservation) {
                if ($date >= $reservation->check_in->toDateString() && $date < $reservation->check_out->toDateString()) {
                    continue 2;
                }
            }

            $free++;
        }

        return $free;
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByCity($query, $city)
    {
        return $query->where('city', $city);
    }

    public function scopePriceBetween($query, $min, $max)
    {
        return $query->whereBetween('price', [$min, $max]);
    }

    public function scopeSurfaceBetween($query, $min, $max)
    {
        return $query->whereBetween('surface', [$min, $max]);
    }
}
