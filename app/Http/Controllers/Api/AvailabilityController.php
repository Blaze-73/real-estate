<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyAvailabilityResource;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use App\Models\PropertyAvailability;
use App\Models\Reservation;
use App\Services\BookingService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    private const ACTIVE_STATUSES = ['pending', 'approved'];

    public function calendar(Request $request, Property $property): JsonResponse
    {
        $month = $request->month ?? now()->format('Y-m');
        $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $blocks = PropertyAvailability::where('property_id', $property->id)
            ->whereDate('start_date', '<=', $end->toDateString())
            ->whereDate('end_date', '>=', $start->toDateString())
            ->get();

        $reservations = Reservation::where('property_id', $property->id)
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->where('check_in', '<', $end->copy()->addDay()->toDateString())
            ->where('check_out', '>', $start->toDateString())
            ->get();

        $days = [];
        for ($day = $start->copy(); $day->lte($end); $day->addDay()) {
            $date = $day->toDateString();
            $status = 'free';

            foreach ($blocks as $block) {
                if ($date >= $block->start_date->toDateString() && $date <= $block->end_date->toDateString()) {
                    $status = 'blocked';
                    break;
                }
            }

            if ($status === 'free') {
                foreach ($reservations as $reservation) {
                    if ($date >= $reservation->check_in->toDateString() && $date < $reservation->check_out->toDateString()) {
                        $status = 'booked';
                        break;
                    }
                }
            }

            $days[$date] = $status;
        }

        return response()->json([
            'month' => $month,
            'property' => new PropertyResource($property),
            'days' => $days,
        ]);
    }

    public function index(Property $property): JsonResponse
    {
        $blocks = PropertyAvailability::where('property_id', $property->id)
            ->where('end_date', '>=', now()->toDateString())
            ->orderBy('start_date')
            ->get();

        return response()->json(PropertyAvailabilityResource::collection($blocks));
    }

    public function store(Request $request, Property $property): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string|max:255',
        ]);

        $block = app(BookingService::class)->blockDates(
            $property,
            $validated['start_date'],
            $validated['end_date'],
            $validated['reason'] ?? 'blocked',
            'manual'
        );

        return response()->json(new PropertyAvailabilityResource($block), 201);
    }

    public function destroy(PropertyAvailability $availability): JsonResponse
    {
        $availability->delete();

        return response()->json(['message' => 'Blocked dates removed successfully']);
    }

    public function importIcs(Request $request, Property $property): JsonResponse
    {
        $validated = $request->validate([
            'ical' => 'required|file|mimes:txt,ics,text/calendar|max:5120',
        ]);

        $ics = file_get_contents($validated['ical']->getRealPath());
        preg_match_all('/BEGIN:VEVENT(.*?)END:VEVENT/s', $ics, $matches);

        $created = 0;
        $total = count($matches[0]);

        foreach ($matches[1] as $block) {
            $start = $this->extractDateProp($block, 'DTSTART');
            $end = $this->extractDateProp($block, 'DTEND');
            $summary = $this->extractProp($block, 'SUMMARY');

            if (!$start) {
                continue;
            }

            if (!$end) {
                $end = $start;
            }

            $exists = PropertyAvailability::where('property_id', $property->id)
                ->where('start_date', $start)
                ->where('end_date', $end)
                ->exists();

            if ($exists) {
                continue;
            }

            PropertyAvailability::create([
                'property_id' => $property->id,
                'start_date' => $start,
                'end_date' => $end,
                'reason' => $summary ?: 'iCal import',
                'source' => 'ical',
            ]);

            $created++;
        }

        return response()->json([
            'message' => "Imported {$created} of {$total} calendar entries",
            'created' => $created,
            'total' => $total,
        ]);
    }

    private function extractProp(string $block, string $key): ?string
    {
        if (preg_match('/^' . $key . '(?:;[^:]*)?:(.*)$/mi', $block, $m)) {
            return trim($m[1]) ?: null;
        }

        return null;
    }

    private function extractDateProp(string $block, string $key): ?string
    {
        $value = $this->extractProp($block, $key);

        if (!$value) {
            return null;
        }

        if (preg_match('/^\d{8}$/', $value)) {
            $date = Carbon::createFromFormat('Ymd', $value)->toDateString();
            // Date-only VEVENT ends are exclusive: store inclusive (minus one day)
            if ($key === 'DTEND') {
                $date = Carbon::parse($date)->subDay()->toDateString();
            }

            return $date;
        }

        if (preg_match('/^(\d{8})T/', $value, $m)) {
            return Carbon::createFromFormat('Ymd', $m[1])->toDateString();
        }

        return null;
    }
}