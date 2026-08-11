<?php

namespace App\Services;

use App\Models\Reservation;
use App\Repositories\ReservationRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class ReservationService
{
    public function __construct(
        protected ReservationRepository $reservationRepository
    ) {}

    public function list(array $filters = []): LengthAwarePaginator
    {
        return $this->reservationRepository->paginate($filters);
    }

    public function create(array $data): Reservation
    {
        $reservation = Reservation::create($data);
        return $reservation->load(['property', 'client']);
    }

    public function approve(Reservation $reservation): Reservation
    {
        $reservation->update(['status' => 'approved']);
        return $reservation->fresh();
    }

    public function reject(Reservation $reservation): Reservation
    {
        $reservation->update(['status' => 'rejected']);
        return $reservation->fresh();
    }

    public function archive(Reservation $reservation): Reservation
    {
        $reservation->update(['status' => 'archived']);
        return $reservation->fresh();
    }
}
