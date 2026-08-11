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
            'surface' => 'decimal:2',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'featured' => 'boolean',
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

    public function rentals()
    {
        return $this->hasMany(Rental::class);
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
