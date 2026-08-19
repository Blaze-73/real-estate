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
        return $property->load([
            'images',
            'user',
            'approvedReviews',
            'availabilityBlocks' => fn ($q) => $q
                ->whereDate('start_date', '<=', now()->addDays(29)->toDateString())
                ->whereDate('end_date', '>=', now()->toDateString()),
            'reservations' => fn ($q) => $q
                ->whereIn('status', ['pending', 'approved'])
                ->where('check_in', '<', now()->addDays(30)->toDateString())
                ->where('check_out', '>', now()->toDateString()),
        ])->loadCount([
            'reservations as bookings_this_month' => fn ($q) => $q
                ->where('status', 'approved')
                ->whereBetween('check_in', [now()->startOfMonth(), now()->endOfMonth()]),
        ]);
    }

    public function similar(Property $property, int $limit = 3): Collection
    {
        return Property::available()
            ->where('id', '!=', $property->id)
            ->where(function ($query) use ($property) {
                $query->where('type', $property->type)
                    ->orWhere('city', $property->city);
            })
            ->with([
                'primaryImage',
                'approvedReviews',
                'availabilityBlocks' => fn ($q) => $q
                    ->whereDate('start_date', '<=', now()->addDays(29)->toDateString())
                    ->whereDate('end_date', '>=', now()->toDateString()),
                'reservations' => fn ($q) => $q
                    ->whereIn('status', ['pending', 'approved'])
                    ->where('check_in', '<', now()->addDays(30)->toDateString())
                    ->where('check_out', '>', now()->toDateString()),
            ])
            ->orderBy('featured', 'desc')
            ->limit($limit)
            ->get();
    }

    public function create(array $data): Property
    {
        $data['slug'] = Property::makeUniqueSlug($data['title']);
        $data['user_id'] = auth()->id();
        $this->normalizeLocation($data);

        $property = Property::create($data);

        $this->attachImages($property, $data['images'] ?? []);

        return $property->load('images');
    }

    public function update(Property $property, array $data): Property
    {
        $this->normalizeLocation($data);

        if (isset($data['title']) && $data['title'] !== $property->title) {
            $data['slug'] = Property::makeUniqueSlug($data['title'], $property->id);
        }

        $property->update($data);

        $this->attachImages($property, $data['images'] ?? []);

        return $property->fresh()->load('images');
    }

    private function normalizeLocation(array &$data): void
    {
        if (isset($data['location']) && $data['location'] !== '' && empty($data['address'])) {
            $data['address'] = $data['location'];
        }

        unset($data['location']);
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
            return Property::featured()->available()->with([
                'primaryImage',
                'approvedReviews',
                'availabilityBlocks' => fn ($q) => $q
                    ->whereDate('start_date', '<=', now()->addDays(29)->toDateString())
                    ->whereDate('end_date', '>=', now()->toDateString()),
                'reservations' => fn ($q) => $q
                    ->whereIn('status', ['pending', 'approved'])
                    ->where('check_in', '<', now()->addDays(30)->toDateString())
                    ->where('check_out', '>', now()->toDateString()),
            ])->get();
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