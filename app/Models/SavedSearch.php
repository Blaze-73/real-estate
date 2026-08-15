<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedSearch extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'filters',
        'active',
        'last_alert_at',
    ];

    protected function casts(): array
    {
        return [
            'filters' => 'array',
            'active' => 'boolean',
            'last_alert_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function frontendUrl(): string
    {
        $filters = (array) $this->filters;
        $params = [];

        foreach (['check_in', 'check_out', 'type', 'min_price', 'max_price', 'bedrooms', 'bathrooms'] as $key) {
            if (isset($filters[$key]) && $filters[$key] !== '' && $filters[$key] !== null) {
                $params[] = $key . '=' . urlencode($filters[$key]);
            }
        }

        if (($filters['price_mode'] ?? null) === 'total') {
            $params[] = 'price_mode=total';
        }

        $sort = ($filters['sort_by'] ?? 'created_at') . ':' . ($filters['sort_order'] ?? 'desc');
        $sortParam = match ($sort) {
            'created_at:desc' => '-createdAt',
            'created_at:asc' => 'createdAt',
            'price:desc' => '-price',
            'price:asc' => 'price',
            default => '-createdAt',
        };
        $params[] = 'sort=' . $sortParam;

        return '/properties' . ($params ? '?' . implode('&', $params) : '');
    }
}