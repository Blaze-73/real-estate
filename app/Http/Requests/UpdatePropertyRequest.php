<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|in:house,villa,apartment,studio,commercial,seasonal,long_term',
            'price' => 'sometimes|numeric|min:0',
            'nightly_price' => 'nullable|numeric|min:0',
            'monthly_price' => 'nullable|numeric|min:0',
            'min_nights' => 'nullable|integer|min:1',
            'cleaning_fee' => 'nullable|numeric|min:0',
            'deposit' => 'nullable|numeric|min:0',
            'high_season_from' => 'nullable|date',
            'high_season_to' => 'nullable|date|after_or_equal:high_season_from',
            'high_season_price' => 'nullable|numeric|min:0',
            'ical_url' => 'nullable|url|max:500',
            'surface' => 'sometimes|numeric|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'status' => 'nullable|in:available,rented,pending,maintenance',
            'featured' => 'nullable|boolean',
            'instant_book' => 'nullable|boolean',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ];
    }
}
