<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'notes' => $this->notes,
            'reservations_count' => $this->whenCounted('reservations'),
            'rentals_count' => $this->whenCounted('rentals'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
