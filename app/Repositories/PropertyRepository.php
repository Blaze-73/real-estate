<?php

namespace App\Repositories;

use App\Models\Property;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;

class PropertyRepository
{
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        $query = Property::query()->with(['primaryImage', 'user']);

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['city'])) {
            $query->where('city', $filters['city']);
        }

        $this->applyPriceFilter($query, $filters);

        $this->applyAvailabilityFilter($query, $filters);

        if (isset($filters['min_surface'])) {
            $query->where('surface', '>=', (int) $filters['min_surface']);
        }

        if (isset($filters['max_surface'])) {
            $query->where('surface', '<=', (int) $filters['max_surface']);
        }

        if (isset($filters['bedrooms'])) {
            $query->where('bedrooms', $filters['bedrooms']);
        }

        if (isset($filters['bathrooms'])) {
            $query->where('bathrooms', $filters['bathrooms']);
        }

        if (isset($filters['featured'])) {
            $query->where('featured', $filters['featured']);
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $allowedSortFields = ['price', 'created_at', 'title', 'surface', 'bedrooms'];

        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortOrder === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest();
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->paginate($perPage);
    }

    private function effectiveRateExpression(): string
    {
        return 'COALESCE(NULLIF(nightly_price, 0), price)';
    }

    private function applyPriceFilter($query, array $filters): void
    {
        $rateExpression = $this->effectiveRateExpression();

        if (($filters['price_mode'] ?? 'night') === 'total') {
            $nights = min(max((int) ($filters['nights'] ?? 1), 1), 90);
            $rateExpression = sprintf(
                '((CASE WHEN %d >= 28 AND monthly_price > 0 THEN monthly_price / 30.4375 ELSE %s END) * %d) + COALESCE(cleaning_fee, 0)',
                $nights,
                $rateExpression,
                $nights
            );
        }

        if (isset($filters['min_price'])) {
            $query->whereRaw("{$rateExpression} >= ?", [(int) $filters['min_price']]);
        }

        if (isset($filters['max_price'])) {
            $query->whereRaw("{$rateExpression} <= ?", [(int) $filters['max_price']]);
        }
    }

    private function applyAvailabilityFilter($query, array $filters): void
    {
        if (empty($filters['check_in']) || empty($filters['check_out'])) {
            return;
        }

        try {
            $checkIn = Carbon::parse($filters['check_in'])->toDateString();
            $checkOut = Carbon::parse($filters['check_out'])->toDateString();
        } catch (\Throwable) {
            return;
        }

        if ($checkIn >= $checkOut) {
            return;
        }

        $query->whereDoesntHave('reservations', function ($q) use ($checkIn, $checkOut) {
            $q->whereIn('status', ['pending', 'approved'])
                ->where('check_in', '<', $checkOut)
                ->where('check_out', '>', $checkIn);
        });

        $query->whereDoesntHave('availabilityBlocks', function ($q) use ($checkIn, $checkOut) {
            $q->where('start_date', '<', $checkOut)
                ->where('end_date', '>', $checkIn);
        });

        $nights = Carbon::parse($checkIn)->diffInDays(Carbon::parse($checkOut));
        $query->where(function ($q) use ($nights) {
            $q->whereNull('min_nights')->orWhere('min_nights', '<=', $nights);
        });
    }
}
