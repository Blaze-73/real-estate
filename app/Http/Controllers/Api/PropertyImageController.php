<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyImageResource;
use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PropertyImageController extends Controller
{
    public function store(Request $request, Property $property): JsonResponse
    {
        $validated = $request->validate([
            'images' => 'required|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $isFirst = $property->images()->count() === 0;

        foreach ($validated['images'] as $index => $file) {
            $path = $file->store('properties', 'public');

            $property->images()->create([
                'image_path' => $path,
                'is_primary' => $isFirst && $index === 0,
                'sort_order' => $property->images()->count() + $index,
            ]);
        }

        return response()->json(
            PropertyImageResource::collection($property->fresh()->images),
            201
        );
    }

    public function setPrimary(PropertyImage $image): JsonResponse
    {
        $image->property->images()
            ->whereKeyNot($image->id)
            ->update(['is_primary' => false]);

        $image->update(['is_primary' => true]);

        return response()->json(
            PropertyImageResource::collection($image->property->fresh()->images)
        );
    }

    public function destroy(PropertyImage $image): JsonResponse
    {
        $property = $image->property;
        $wasPrimary = $image->is_primary;

        if (Storage::disk('public')->exists($image->image_path)) {
            Storage::disk('public')->delete($image->image_path);
        }

        $image->delete();

        if ($wasPrimary) {
            $next = $property->images()->orderBy('sort_order')->first();
            if ($next) {
                $next->update(['is_primary' => true]);
            }
        }

        return response()->json(['message' => 'Image deleted successfully']);
    }
}