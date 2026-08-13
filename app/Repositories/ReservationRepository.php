<?php

namespace App\Repositories;

use App\Models\Reservation;
use Illuminate\Pagination\LengthAwarePaginator;

class ReservationRepository
{
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        $query = Reservation::query()->with(['property', 'client', 'payments']);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['property_id'])) {
            $query->where('property_id', $filters['property_id']);
        }

        if (isset($filters['client_id'])) {
            $query->where('client_id', $filters['client_id']);
        }

        if (isset($filters['date_from'])) {
            $query->where('check_in', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('check_out', '<=', $filters['date_to']);
        }

        return $query->latest()->paginate($filters['per_page'] ?? 15);
    }
}
