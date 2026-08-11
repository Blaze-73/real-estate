<?php

namespace App\Services;

use App\Models\Property;
use App\Repositories\PropertyRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PropertyService
{
    public function __construct(
        protected PropertyRepository $propertyRepository
    ) {}

    public function list(array $filters = []): LengthAwarePaginator
    {
        return $this->propertyRepository->paginate($filters);
    }

    public function show(Property $property): Property
    {
        return $property->load(['images', 'user']);
    }

    public function create(array $data): Property
    {
        $data['slug'] = Property::makeUniqueSlug($data['title']);
        $data['user_id'] = auth()->id();

        $property = Property::create($data);

        $this->attachImages($property, $data['images'] ?? []);

        return $property->load('images');
    }

    public function update(Property $property, array $data): Property
    {
        if (isset($data['title']) && $data['title'] !== $property->title) {
            $data['slug'] = Property::makeUniqueSlug($data['title'], $property->id);
        }

        $property->update($data);

        $this->attachImages($property, $data['images'] ?? []);

        return $property->fresh()->load('images');
    }

    public function delete(Property $property): void
    {
        foreach ($property->images as $image) {
            if (Storage::disk('public')->exists($image->image_path)) {
                Storage::disk('public')->delete($image->image_path);
            }
        }
        $property->delete();
    }

    public function toggleFeatured(Property $property): Property
    {
        $property->update(['featured' => !$property->featured]);

        Cache::forget('featured_properties');

        return $property->fresh();
    }

    public function getFeatured(): Collection
    {
        return Cache::remember('featured_properties', now()->addMinutes(10), function () {
            return Property::featured()->available()->with('primaryImage')->get();
        });
    }

    private function attachImages(Property $property, array $images): void
    {
        foreach ($images as $index => $image) {
            $path = $image->store('properties', 'public');
            $property->images()->create([
                'image_path' => $path,
                'is_primary' => $index === 0 && $property->images()->count() === 0,
                'sort_order' => $property->images()->count() + $index,
            ]);
        }
    }
}