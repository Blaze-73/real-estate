<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $properties = $request->user()->wishlists()
            ->with('property.primaryImage')
            ->latest()
            ->get()
            ->map(fn (Wishlist $wishlist) => $wishlist->property)
            ->filter();

        return response()->json(PropertyResource::collection($properties));
    }

    public function toggle(Property $property): JsonResponse
    {
        $exists = Wishlist::query()
            ->where('user_id', auth()->id())
            ->where('property_id', $property->id)
            ->exists();

        if ($exists) {
            Wishlist::query()
                ->where('user_id', auth()->id())
                ->where('property_id', $property->id)
                ->delete();

            return response()->json(['saved' => false, 'property_id' => $property->id]);
        }

        Wishlist::create([
            'user_id' => auth()->id(),
            'property_id' => $property->id,
        ]);

        return response()->json(['saved' => true, 'property_id' => $property->id]);
    }

    public function destroy(Property $property): JsonResponse
    {
        Wishlist::query()
            ->where('user_id', auth()->id())
            ->where('property_id', $property->id)
            ->delete();

        return response()->json(['saved' => false, 'property_id' => $property->id]);
    }
}