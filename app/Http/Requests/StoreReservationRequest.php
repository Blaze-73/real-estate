<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property_id' => 'required|exists:properties,id',
            'client_id' => 'required|exists:clients,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'message' => 'nullable|string',
            'booking_reference' => 'nullable|string|max:50',
            'total_price' => 'nullable|numeric|min:0',
            'deposit' => 'nullable|numeric|min:0',
            'guests' => 'nullable|integer|min:1',
            'guest_name' => 'nullable|string|max:255',
            'guest_email' => 'nullable|email|max:255',
            'guest_phone' => 'nullable|string|max:50',
            'channel' => 'nullable|in:direct,airbnb,booking,other',
            'source' => 'nullable|string|max:255',
        ];
    }
}
