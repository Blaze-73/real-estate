<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Http\Resources\PropertyDetailResource;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use App\Services\PropertyService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function __construct(
        protected PropertyService $propertyService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search', 'type', 'status', 'city',
            'min_price', 'max_price', 'min_surface', 'max_surface',
            'bedrooms', 'bathrooms', 'featured',
            'sort_by', 'sort_order', 'per_page',
        ]);

        $properties = $this->propertyService->list($filters);

        return response()->json(ApiResponse::paginate($properties, PropertyResource::collection($properties->items())));
    }

    public function show(Property $property): JsonResponse
    {
        $property = $this->propertyService->show($property);

        return response()->json(new PropertyDetailResource($property));
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
}
