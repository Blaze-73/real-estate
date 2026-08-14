<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Property;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function byProperty(Property $property): JsonResponse
    {
        $reviews = $property->reviews()->approved()->latest()->get();

        return response()->json(ReviewResource::collection($reviews));
    }

    public function store(Request $request, Property $property): JsonResponse
    {
        $validated = $request->validate([
            'guest_name' => 'required|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:2000',
        ]);

        $review = $property->reviews()->create([
            ...$validated,
            'is_approved' => false,
        ]);

        return response()->json(new ReviewResource($review), 201);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Review::query()->with('property:id,title,slug');

        if ($request->filled('property_id')) {
            $query->where('property_id', $request->integer('property_id'));
        }

        if ($request->boolean('pending_only')) {
            $query->pending();
        }

        $reviews = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json(ReviewResource::collection($reviews));
    }

    public function approve(Review $review): JsonResponse
    {
        $review->update(['is_approved' => true]);

        return response()->json(new ReviewResource($review));
    }

    public function destroy(Review $review): JsonResponse
    {
        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }
}
