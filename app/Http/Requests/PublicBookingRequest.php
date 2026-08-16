<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PublicBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'guests' => 'nullable|integer|min:1|max:20',
            'guest_name' => 'required|string|max:255',
            'guest_email' => 'required|email|max:255',
            'guest_phone' => 'nullable|string|max:50',
            'message' => 'nullable|string|max:1000',
            'channel' => 'nullable|in:direct,airbnb,booking,other',
            'source' => 'nullable|string|max:255',
            'marketing_consent' => 'nullable|boolean',
        ];
    }
}