<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedSearch;
use App\Repositories\PropertyRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedSearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $searches = $request->user()->savedSearches()->latest()->get();

        return response()->json([
            'data' => $searches->map(fn (SavedSearch $search) => $this->shape($search)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:150',
            'filters' => 'required|array',
        ]);

        $search = $request->user()->savedSearches()->create([
            'name' => $validated['name'] ?? null,
            'filters' => $this->cleanFilters($validated['filters']),
        ]);

        return response()->json(['data' => $this->shape($search)], 201);
    }

    public function update(Request $request, SavedSearch $savedSearch): JsonResponse
    {
        $this->authorizeOwnership($request, $savedSearch);

        $validated = $request->validate([
            'name' => 'nullable|string|max:150',
            'filters' => 'nullable|array',
            'active' => 'nullable|boolean',
        ]);

        if (array_key_exists('name', $validated)) {
            $savedSearch->name = $validated['name'];
        }
        if (array_key_exists('filters', $validated)) {
            $savedSearch->filters = $this->cleanFilters($validated['filters']);
        }
        if (array_key_exists('active', $validated)) {
            $savedSearch->active = $validated['active'];
        }
        $savedSearch->save();

        return response()->json(['data' => $this->shape($savedSearch)]);
    }

    public function destroy(Request $request, SavedSearch $savedSearch): JsonResponse
    {
        $this->authorizeOwnership($request, $savedSearch);

        $savedSearch->delete();

        return response()->json(['deleted' => true]);
    }

    public function preview(Request $request, SavedSearch $savedSearch): JsonResponse
    {
        $this->authorizeOwnership($request, $savedSearch);

        $filters = array_merge((array) $savedSearch->filters, ['status' => 'available', 'per_page' => 5]);
        $matches = (new PropertyRepository())->paginate($filters);

        return response()->json([
            'count' => $matches->total(),
            'matches' => collect($matches->items())->map(fn ($property) => [
                'id' => $property->id,
                'slug' => $property->slug,
                'title' => $property->title,
                'type' => $property->type,
                'city' => $property->city,
                'price' => $property->price,
            ]),
        ]);
    }

    private function shape(SavedSearch $search): array
    {
        return [
            'id' => $search->id,
            'name' => $search->name,
            'filters' => $search->filters,
            'active' => $search->active,
            'last_alert_at' => $search->last_alert_at?->toDateTimeString(),
            'created_at' => $search->created_at?->toDateTimeString(),
        ];
    }

    private function cleanFilters(array $filters): array
    {
        $allowed = ['search', 'type', 'city', 'min_price', 'max_price', 'min_surface', 'max_surface', 'bedrooms', 'bathrooms', 'featured', 'amenities', 'check_in', 'check_out', 'price_mode', 'nights', 'sort_by', 'sort_order'];

        return array_filter(
            collect($filters)->only($allowed)->all(),
            fn ($value) => $value !== '' && $value !== null
        );
    }

    private function authorizeOwnership(Request $request, SavedSearch $savedSearch): void
    {
        abort_unless($savedSearch->user_id === (int) $request->user()->id, 403);
    }
}