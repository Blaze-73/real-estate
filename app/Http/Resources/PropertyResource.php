<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'type' => $this->type,
            'price' => $this->price,
            'nightly_price' => $this->nightly_price,
            'monthly_price' => $this->monthly_price,
            'min_nights' => $this->min_nights,
            'cleaning_fee' => $this->cleaning_fee,
            'deposit' => $this->deposit,
            'high_season' => [
                'from' => $this->high_season_from,
                'to' => $this->high_season_to,
                'price' => $this->high_season_price,
            ],
            'surface' => $this->surface,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'city' => $this->city,
            'location' => $this->city,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'status' => $this->status,
            'featured' => $this->featured,
            'instant_book' => (bool) $this->instant_book,
            'amenities' => $this->amenities ?? [],
            'primary_image' => PropertyImageResource::resolveUrl($this->primaryImage?->image_path),
            'cover' => PropertyImageResource::resolveUrl($this->primaryImage?->image_path),
            'cancellation_policy' => $this->cancellation_policy,
            'reviews_count' => $this->reviews()->approved()->count(),
            'rating_score' => round((float) ($this->reviews()->approved()->avg('rating') ?? 0), 1),
            'bookings_this_month' => $this->reservations()
                ->where('status', 'approved')
                ->whereBetween('check_in', [now()->startOfMonth(), now()->endOfMonth()])
                ->count(),
            'free_nights_next_month' => $this->freeNightsNextMonth(),
            'promotions' => $this->activePromotions()->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'type' => $p->type,
                'value' => (float) $p->value,
                'min_nights' => $p->min_nights,
            ])->values(),
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}