<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'amount' => $this->amount,
            'payment_date' => $this->payment_date,
            'payment_method' => $this->payment_method,
            'status' => $this->status,
            'receipt_file' => $this->receipt_file,
            'notes' => $this->notes,
            'rental' => new RentalResource($this->whenLoaded('rental')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
