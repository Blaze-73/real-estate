<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Promotion extends Model
{
    /** @use HasFactory<\Database\Factories\PromotionFactory> */
    use HasFactory;

    public const TYPES = ['percent', 'fixed'];

    protected $fillable = [
        'property_id',
        'name',
        'type',
        'value',
        'min_nights',
        'valid_from',
        'valid_to',
        'book_by',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'min_nights' => 'integer',
            'valid_from' => 'date',
            'valid_to' => 'date',
            'book_by' => 'date',
            'active' => 'boolean',
        ];
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeForProperty($query, Property $property)
    {
        return $query->where(function ($query) use ($property) {
            $query->whereNull('property_id')
                ->orWhere('property_id', $property->id);
        });
    }

    public function appliesTo(int $nights, string $checkIn, ?string $checkOut = null): bool
    {
        if ($this->min_nights !== null && $nights < $this->min_nights) {
            return false;
        }

        if ($this->valid_from && $checkIn < $this->valid_from->toDateString()) {
            return false;
        }

        if ($this->valid_to && ($checkOut ?? $checkIn) > $this->valid_to->toDateString()) {
            return false;
        }

        if ($this->book_by && now()->toDateString() > $this->book_by->toDateString()) {
            return false;
        }

        return true;
    }

    public function discountFor(float $subtotal): float
    {
        if ($this->type === 'fixed') {
            return min((float) $this->value, $subtotal);
        }

        return round($subtotal * ((float) $this->value / 100), 2);
    }
}