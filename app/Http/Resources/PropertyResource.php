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