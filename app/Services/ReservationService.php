<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Reservation;
use App\Repositories\ReservationRepository;
use DomainException;
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
        if ((float) ($reservation->deposit ?? 0) > 0 && $this->hasPaidDeposit($reservation) === false) {
            throw new DomainException('Deposit must be received before approving this booking.');
        }

        $reservation->update(['status' => 'approved']);
        $this->logBooking('booking.approved', $reservation);

        return $reservation->fresh(['property', 'client']);
    }

    public function reject(Reservation $reservation): Reservation
    {
        $reservation->update(['status' => 'rejected']);
        $this->clearPendingDeposit($reservation);
        $this->logBooking('booking.rejected', $reservation);

        return $reservation->fresh(['property', 'client']);
    }

    public function cancel(Reservation $reservation): Reservation
    {
        $reservation->update(['status' => 'cancelled']);
        $this->clearPendingDeposit($reservation);
        $this->logBooking('booking.cancelled', $reservation);

        return $reservation->fresh(['property', 'client']);
    }

    public function archive(Reservation $reservation): Reservation
    {
        $reservation->update(['status' => 'archived']);
        $this->logBooking('booking.archived', $reservation);

        return $reservation->fresh(['property', 'client']);
    }

    private function logBooking(string $action, Reservation $reservation): void
    {
        app(ActivityLogService::class)->log(
            $action,
            "{$reservation->booking_reference} ({$reservation->property->title}) {$action}",
            ['reference' => $reservation->booking_reference, 'property_id' => $reservation->property_id]
        );
    }

    public function hasPaidDeposit(Reservation $reservation): bool
    {
        return Payment::where('reservation_id', $reservation->id)
            ->where('status', 'paid')
            ->exists();
    }

    public function clearPendingDeposit(Reservation $reservation): void
    {
        Payment::where('reservation_id', $reservation->id)
            ->where('status', 'pending')
            ->delete();
    }
}