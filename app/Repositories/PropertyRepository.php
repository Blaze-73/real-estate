<?php

namespace App\Repositories;

use App\Models\Property;
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

        if (isset($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        if (isset($filters['min_surface'])) {
            $query->where('surface', '>=', $filters['min_surface']);
        }

        if (isset($filters['max_surface'])) {
            $query->where('surface', '<=', $filters['max_surface']);
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
}
