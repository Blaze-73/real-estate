<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSellRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'email' => 'required|email|max:255',
            'purpose' => 'required|in:sale,rent',
            'property_type' => 'required|in:house,villa,apartment,studio,commercial,seasonal,long_term',
            'neighborhood' => 'required|string|max:255',
            'message' => 'nullable|string|max:2000',
        ];
    }
}