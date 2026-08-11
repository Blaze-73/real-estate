<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RentalResource;
use App\Models\Rental;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RentalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Rental::with(['property', 'client']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        $rentals = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json(RentalResource::collection($rentals));
    }

    public function show(Rental $rental): JsonResponse
    {
        $rental->load(['property', 'client', 'payments']);

        return response()->json(new RentalResource($rental));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'client_id' => 'required|exists:clients,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'deposit' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,upcoming,expired',
            'contract_file' => 'nullable|file|mimes:pdf|max:10240',
            'notes' => 'nullable|string',
        ]);

        if ($request->hasFile('contract_file')) {
            $validated['contract_file'] = $request->file('contract_file')->store('contracts', 'public');
        }

        $rental = Rental::create($validated);
        $rental->load(['property', 'client']);

        return response()->json(new RentalResource($rental), 201);
    }

    public function update(Request $request, Rental $rental): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => 'sometimes|exists:properties,id',
            'client_id' => 'sometimes|exists:clients,id',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'monthly_rent' => 'sometimes|numeric|min:0',
            'deposit' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,upcoming,expired',
            'contract_file' => 'nullable|file|mimes:pdf|max:10240',
            'notes' => 'nullable|string',
        ]);

        if ($request->hasFile('contract_file')) {
            $validated['contract_file'] = $request->file('contract_file')->store('contracts', 'public');
        }

        $rental->update($validated);
        $rental->load(['property', 'client']);

        return response()->json(new RentalResource($rental));
    }

    public function destroy(Rental $rental): JsonResponse
    {
        $rental->delete();

        return response()->json(['message' => 'Rental deleted successfully']);
    }

    public function active(): JsonResponse
    {
        $rentals = Rental::active()->with(['property', 'client'])->latest()->get();

        return response()->json(RentalResource::collection($rentals));
    }

    public function upcoming(): JsonResponse
    {
        $rentals = Rental::upcoming()->with(['property', 'client'])->latest()->get();

        return response()->json(RentalResource::collection($rentals));
    }

    public function expired(): JsonResponse
    {
        $rentals = Rental::expired()->with(['property', 'client'])->latest()->get();

        return response()->json(RentalResource::collection($rentals));
    }
}
