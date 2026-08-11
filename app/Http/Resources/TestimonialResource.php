<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TestimonialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client_name' => $this->client_name,
            'client_photo' => $this->client_photo,
            'content' => $this->content,
            'rating' => $this->rating,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
        ];
    }
}
