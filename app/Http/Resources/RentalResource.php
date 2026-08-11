<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RentalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'monthly_rent' => $this->monthly_rent,
            'deposit' => $this->deposit,
            'status' => $this->status,
            'contract_file' => $this->contract_file,
            'notes' => $this->notes,
            'property' => new PropertyResource($this->whenLoaded('property')),
            'client' => new ClientResource($this->whenLoaded('client')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
