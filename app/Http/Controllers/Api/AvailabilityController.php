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
            ->where('start_date', '<=', $end->toDateString())
            ->where('end_date', '>=', $start->toDateString())
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
}