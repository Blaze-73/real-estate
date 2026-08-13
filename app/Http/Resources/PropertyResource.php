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
            'status' => $this->status,
            'featured' => $this->featured,
            'primary_image' => PropertyImageResource::resolveUrl($this->primaryImage?->image_path),
            'cover' => PropertyImageResource::resolveUrl($this->primaryImage?->image_path),
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}