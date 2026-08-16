<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class TestimonialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client_name' => $this->client_name,
            'client_photo' => $this->client_photo
                ? (str_starts_with($this->client_photo, 'http')
                    ? $this->client_photo
                    : Storage::disk('public')->url($this->client_photo))
                : null,
            'content' => $this->content,
            'rating' => $this->rating,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
        ];
    }
}
