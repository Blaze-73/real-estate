<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Resources\ReservationResource;
use App\Models\Reservation;
use App\Services\ReservationService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function __construct(
        protected ReservationService $reservationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'property_id', 'client_id', 'date_from', 'date_to', 'per_page']);
        $reservations = $this->reservationService->list($filters);

        return response()->json(ReservationResource::collection($reservations));
    }

    public function show(Reservation $reservation): JsonResponse
    {
        $reservation->load(['property', 'client']);

        return response()->json(new ReservationResource($reservation));
    }

    public function store(StoreReservationRequest $request): JsonResponse
    {
        $reservation = $this->reservationService->create($request->validated());

        return response()->json(new ReservationResource($reservation), 201);
    }

    public function destroy(Reservation $reservation): JsonResponse
    {
        $reservation->delete();

        return response()->json(['message' => 'Reservation deleted successfully']);
    }

    public function approve(Reservation $reservation): JsonResponse
    {
        try {
            $reservation = $this->reservationService->approve($reservation);
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }

        return response()->json(new ReservationResource($reservation));
    }

    public function reject(Reservation $reservation): JsonResponse
    {
        $reservation = $this->reservationService->reject($reservation);

        return response()->json(new ReservationResource($reservation));
    }

    public function cancel(Reservation $reservation): JsonResponse
    {
        $reservation = $this->reservationService->cancel($reservation);

        return response()->json(new ReservationResource($reservation));
    }

    public function archive(Reservation $reservation): JsonResponse
    {
        $reservation = $this->reservationService->archive($reservation);

        return response()->json(new ReservationResource($reservation));
    }
}
