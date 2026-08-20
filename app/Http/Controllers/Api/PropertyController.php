<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PublicBookingRequest;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Http\Resources\PropertyDetailResource;
use App\Http\Resources\PropertyResource;
use App\Http\Resources\ReservationResource;
use App\Models\Property;
use App\Services\BookingService;
use App\Services\PropertyService;
use App\Support\ApiResponse;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PropertyController extends Controller
{
    public function __construct(
        protected PropertyService $propertyService,
        protected BookingService $bookingService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search', 'type', 'status', 'city',
            'min_price', 'max_price', 'min_surface', 'max_surface',
            'bedrooms', 'bathrooms', 'featured', 'amenities',
            'check_in', 'check_out', 'price_mode', 'nights',
            'sort_by', 'sort_order', 'per_page',
        ]);

        $properties = $this->propertyService->list($filters);

        return response()->json(ApiResponse::paginate($properties, PropertyResource::collection($properties->items())));
    }

    public function show(Property $property): JsonResponse
    {
        $property = $this->propertyService->show($property);
        $similar = $this->propertyService->similar($property);

        return (new PropertyDetailResource($property))
            ->additional(['similar' => PropertyResource::collection($similar)])
            ->response();
    }

    public function store(StorePropertyRequest $request): JsonResponse
    {
        $property = $this->propertyService->create($request->validated());

        return response()->json(new PropertyDetailResource($property), 201);
    }

    public function update(UpdatePropertyRequest $request, Property $property): JsonResponse
    {
        $property = $this->propertyService->update($property, $request->validated());

        return response()->json(new PropertyDetailResource($property));
    }

    public function destroy(Property $property): JsonResponse
    {
        $this->propertyService->delete($property);

        return response()->json(['message' => 'Property deleted successfully']);
    }

    public function featured(): JsonResponse
    {
        $properties = $this->propertyService->getFeatured();

        return response()->json(PropertyResource::collection($properties));
    }

    public function toggleFeatured(Property $property): JsonResponse
    {
        $property = $this->propertyService->toggleFeatured($property);

        return response()->json(new PropertyResource($property));
    }

    public function quote(Request $request, Property $property): JsonResponse
    {
        $validated = $request->validate([
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
        ]);

        try {
            $quote = $this->bookingService->quote($property, $validated['check_in'], $validated['check_out']);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json($quote);
    }

    public function book(PublicBookingRequest $request, Property $property): JsonResponse
    {
        try {
            $result = $this->bookingService->createBooking($property, $request->validated());
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }

        return response()->json([
            'message' => $result['instant']
                ? 'Booking confirmed instantly. A deposit is required to finalize.'
                : 'Booking request submitted. Our team will confirm shortly.',
            'booking_reference' => $result['reservation']->booking_reference,
            'instant' => $result['instant'],
            'quote' => $result['quote'],
            'reservation' => new ReservationResource($result['reservation']),
        ], 201);
    }

    public function calendarExport(Property $property): Response
    {
        $ics = $this->bookingService->exportIcs($property);

        return response($ics, 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="' . $property->slug . '-availability.ics"',
        ]);
    }
}
