<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $promotions = Promotion::query()
            ->with('property:id,title,slug')
            ->when($request->property_id, fn ($q) => $q->where('property_id', $request->property_id))
            ->when($request->active !== null, fn ($q) => $q->where('active', $request->boolean('active')))
            ->orderByDesc('updated_at')
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return response()->json($promotions);
    }

    public function store(Request $request): JsonResponse
    {
        $promotion = Promotion::create($this->validated($request));

        return response()->json($promotion->load('property'), 201);
    }

    public function show(Promotion $promotion): JsonResponse
    {
        return response()->json($promotion->load('property'));
    }

    public function update(Request $request, Promotion $promotion): JsonResponse
    {
        $promotion->update($this->validated($request));

        return response()->json($promotion->load('property'));
    }

    public function destroy(Promotion $promotion): JsonResponse
    {
        $promotion->delete();

        return response()->json(['message' => 'Promotion deleted.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'property_id' => 'nullable|exists:properties,id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:' . implode(',', Promotion::TYPES),
            'value' => 'required|numeric|min:0.01',
            'min_nights' => 'nullable|integer|min:1',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date|after_or_equal:valid_from',
            'book_by' => 'nullable|date',
            'active' => 'sometimes|boolean',
        ]);
    }
}