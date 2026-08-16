<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_reference' => $this->booking_reference,
            'check_in' => $this->check_in,
            'check_out' => $this->check_out,
            'status' => $this->status,
            'message' => $this->message,
            'total_price' => $this->total_price,
            'deposit' => $this->deposit,
            'discount' => $this->discount,
            'promotion' => $this->whenLoaded('promotion', fn () => $this->promotion ? [
                'id' => $this->promotion->id,
                'name' => $this->promotion->name,
            ] : null),
            'deposit_paid' => $this->payments->contains(fn ($payment) => $payment->status === 'paid'),
            'guests' => $this->guests,
            'guest_name' => $this->guest_name,
            'guest_email' => $this->guest_email,
            'guest_phone' => $this->guest_phone,
            'channel' => $this->channel,
            'source' => $this->source,
            'property' => new PropertyResource($this->whenLoaded('property')),
            'client' => new ClientResource($this->whenLoaded('client')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
