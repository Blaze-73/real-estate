<?php

namespace App\Services;

use App\Mail\BookingConfirmation;
use App\Mail\NewBookingNotification;
use App\Models\Property;
use App\Models\PropertyAvailability;
use App\Models\Reservation;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class BookingService
{
    private const ACTIVE_STATUSES = ['pending', 'approved'];

    public function quote(Property $property, string $checkIn, string $checkOut): array
    {
        $start = Carbon::parse($checkIn)->startOfDay();
        $end = Carbon::parse($checkOut)->startOfDay();
        $nights = $start->diffInDays($end);

        $useMonthly = $nights >= 28 && $property->monthly_price;

        if ($useMonthly) {
            $rate = (float) $property->monthly_price;
            $rateType = 'month';
            $subtotal = round($rate * ($nights / 30.4375), 2);
        } else {
            $rate = $this->rateForNight($property, $start);
            $rateType = 'night';
            $subtotal = round($rate * $nights, 2);
        }

        $cleaningFee = (float) $property->cleaning_fee;
        $deposit = (float) $property->deposit;
        $total = round($subtotal + $cleaningFee, 2);

        return [
            'check_in' => $start->toDateString(),
            'check_out' => $end->toDateString(),
            'nights' => $nights,
            'min_nights' => (int) $property->min_nights,
            'rate' => round($rate, 2),
            'rate_type' => $rateType,
            'subtotal' => $subtotal,
            'cleaning_fee' => $cleaningFee,
            'deposit' => $deposit,
            'total' => $total,
            'available' => $this->isAvailable($property, $start, $end),
            'instant_book' => (bool) $property->instant_book,
        ];
    }

    public function rateForNight(Property $property, Carbon $date): float
    {
        $highStart = $property->high_season_from ? Carbon::parse($property->high_season_from) : null;
        $highEnd = $property->high_season_to ? Carbon::parse($property->high_season_to) : null;

        if ($highStart && $highEnd && $date->between($highStart, $highEnd) && $property->high_season_price) {
            return (float) $property->high_season_price;
        }

        return (float) ($property->nightly_price ?? $property->price);
    }

    public function isAvailable(Property $property, string|Carbon $checkIn, string|Carbon $checkOut, ?int $ignoreReservationId = null): bool
    {
        $start = $checkIn instanceof Carbon ? $checkIn->startOfDay() : Carbon::parse($checkIn)->startOfDay();
        $end = $checkOut instanceof Carbon ? $checkOut->startOfDay() : Carbon::parse($checkOut)->startOfDay();

        if ($start >= $end) {
            return false;
        }

        if ((int) $property->min_nights > $start->diffInDays($end)) {
            return false;
        }

        $hasOverlap = Reservation::where('property_id', $property->id)
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->when($ignoreReservationId, fn ($query) => $query->where('id', '!=', $ignoreReservationId))
            ->where('check_in', '<', $end->toDateString())
            ->where('check_out', '>', $start->toDateString())
            ->exists();

        if ($hasOverlap) {
            return false;
        }

        $hasBlock = PropertyAvailability::where('property_id', $property->id)
            ->where('start_date', '<', $end->toDateString())
            ->where('end_date', '>', $start->toDateString())
            ->exists();

        return !$hasBlock;
    }

    public function createBooking(Property $property, array $data): array
    {
        $checkIn = Carbon::parse($data['check_in'])->startOfDay();
        $checkOut = Carbon::parse($data['check_out'])->startOfDay();

        if (!$this->isAvailable($property, $checkIn, $checkOut)) {
            throw new \DomainException('This property is not available for the selected dates.');
        }

        if ($checkIn->diffInDays($checkOut) < (int) $property->min_nights) {
            throw new \DomainException("Minimum stay is {$property->min_nights} night(s).");
        }

        $quote = $this->quote($property, $checkIn, $checkOut);

        $client = null;

        if (!empty($data['guest_phone'])) {
            $client = \App\Models\Client::where('phone', $data['guest_phone'])->first();
        }

        if (!$client) {
            $client = \App\Models\Client::create([
                'name' => $data['guest_name'] ?? ($data['guest_email'] ?? 'Guest'),
                'phone' => $data['guest_phone'] ?? null,
                'email' => $data['guest_email'] ?? null,
            ]);
        }

        $instantBook = (bool) $property->instant_book;

        $reservation = Reservation::create([
            'property_id' => $property->id,
            'client_id' => $client->id,
            'check_in' => $checkIn->toDateString(),
            'check_out' => $checkOut->toDateString(),
            'status' => $instantBook ? 'approved' : 'pending',
            'message' => $data['message'] ?? null,
            'booking_reference' => $this->uniqueReference(),
            'total_price' => $quote['total'],
            'deposit' => $quote['deposit'],
            'guests' => $data['guests'] ?? null,
            'guest_name' => $data['guest_name'] ?? $client->name,
            'guest_email' => $data['guest_email'] ?? $client->email,
            'guest_phone' => $data['guest_phone'] ?? $client->phone,
            'channel' => $data['channel'] ?? 'direct',
            'source' => $data['source'] ?? null,
        ])->load(['property', 'client']);

        $this->createDepositPayment($reservation, $quote['deposit']);
        $this->notifyBookingCreated($reservation);

        app(ActivityLogService::class)->log(
            'booking.created',
            "{$reservation->booking_reference} booking created for {$property->title}",
            ['reference' => $reservation->booking_reference, 'property_id' => $property->id]
        );

        return [
            'reservation' => $reservation,
            'quote' => $quote,
            'instant' => $instantBook,
        ];
    }

    private function createDepositPayment(Reservation $reservation, float $deposit): void
    {
        if ($deposit <= 0) {
            return;
        }

        Payment::create([
            'reservation_id' => $reservation->id,
            'amount' => $deposit,
            'payment_date' => now()->toDateString(),
            'payment_method' => 'deposit',
            'status' => 'pending',
            'notes' => 'Booking deposit for ' . $reservation->booking_reference,
        ]);
    }

    private function notifyBookingCreated(Reservation $reservation): void
    {
        if (!empty($reservation->guest_email)) {
            Mail::to($reservation->guest_email)->queue(new BookingConfirmation($reservation));
        }

        User::whereIn('role', ['admin', 'agent'])->each(function (User $user) use ($reservation) {
            Mail::to($user->email)->queue(new NewBookingNotification($reservation));
            app(NotificationService::class)->sendToUser(
                $user,
                'booking',
                'New Booking ' . $reservation->booking_reference,
                "New booking request for {$reservation->property->title} from {$reservation->check_in->format('d M Y')} to {$reservation->check_out->format('d M Y')}."
            );
        });
    }

    public function blockDates(Property $property, string $start, string $end, string $reason = 'blocked', string $source = 'manual'): PropertyAvailability
    {
        return PropertyAvailability::create([
            'property_id' => $property->id,
            'start_date' => $start,
            'end_date' => $end,
            'reason' => $reason,
            'source' => $source,
        ]);
    }

    public function uniqueReference(): string
    {
        do {
            $reference = 'ASL-' . strtoupper(Str::random(6));
        } while (Reservation::where('booking_reference', $reference)->exists());

        return $reference;
    }

    public function exportIcs(Property $property): string
    {
        $now = now();

        $events = [];

        $reservations = Reservation::where('property_id', $property->id)
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->where('check_out', '>=', $now->toDateString())
            ->get();

        foreach ($reservations as $reservation) {
            $events[] = $this->buildEvent(
                uid: $reservation->booking_reference ?: ('res-' . $reservation->id),
                summary: 'Reserved',
                start: $reservation->check_in->format('Ymd'),
                end: $reservation->check_out->copy()->addDay()->format('Ymd'),
            );
        }

        $blocks = PropertyAvailability::where('property_id', $property->id)
            ->where('end_date', '>=', $now->toDateString())
            ->get();

        foreach ($blocks as $block) {
            $events[] = $this->buildEvent(
                uid: $block->ical_event_id ?: ('block-' . $block->id),
                summary: 'Blocked',
                start: $block->start_date->format('Ymd'),
                end: $block->end_date->copy()->addDay()->format('Ymd'),
            );
        }

        $lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//RealEstatePlatform//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:' . $property->title . ' - Availability',
        ];

        foreach ($events as $event) {
            $lines = array_merge($lines, $event);
        }

        $lines[] = 'END:VCALENDAR';

        return implode("\r\n", $lines);
    }

    private function buildEvent(string $uid, string $summary, string $start, string $end): array
    {
        $stamp = now()->format('Ymd\THis\Z');

        return [
            'BEGIN:VEVENT',
            'UID:' . $uid,
            'DTSTAMP:' . $stamp,
            'DTSTART;VALUE=DATE:' . $start,
            'DTEND;VALUE=DATE:' . $end,
            'SUMMARY:' . $summary,
            'END:VEVENT',
        ];
    }
}