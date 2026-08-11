<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TestimonialResource;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Testimonial::query();

        if ($request->boolean('active_only')) {
            $query->active();
        }

        $testimonials = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json(TestimonialResource::collection($testimonials));
    }

    public function show(Testimonial $testimonial): JsonResponse
    {
        return response()->json(new TestimonialResource($testimonial));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'client_photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'content' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('client_photo')) {
            $validated['client_photo'] = $request->file('client_photo')->store('testimonials', 'public');
        }

        $testimonial = Testimonial::create($validated);

        return response()->json(new TestimonialResource($testimonial), 201);
    }

    public function update(Request $request, Testimonial $testimonial): JsonResponse
    {
        $validated = $request->validate([
            'client_name' => 'sometimes|string|max:255',
            'client_photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'content' => 'sometimes|string',
            'rating' => 'sometimes|integer|min:1|max:5',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('client_photo')) {
            $validated['client_photo'] = $request->file('client_photo')->store('testimonials', 'public');
        }

        $testimonial->update($validated);

        return response()->json(new TestimonialResource($testimonial));
    }

    public function destroy(Testimonial $testimonial): JsonResponse
    {
        $testimonial->delete();

        return response()->json(['message' => 'Testimonial deleted successfully']);
    }
}
