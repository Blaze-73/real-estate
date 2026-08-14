<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Reservation;
use App\Services\OnlinePaymentService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicPaymentController extends Controller
{
    public function __construct(
        protected OnlinePaymentService $onlinePayment
    ) {}

    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_reference' => 'required|string|exists:reservations,booking_reference',
        ]);

        $reservation = Reservation::where('booking_reference', $validated['booking_reference'])->firstOrFail();

        try {
            $result = $this->onlinePayment->checkout($reservation);
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json($result);
    }

    public function preview(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        try {
            $payment = $this->onlinePayment->preview($validated['token']);
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $reservation = $payment->reservation;

        return response()->json([
            'payment' => new PaymentResource($payment),
            'booking_reference' => $reservation?->booking_reference,
            'property_title' => $reservation?->property?->title,
            'property_slug' => $reservation?->property?->slug,
            'check_in' => $reservation?->check_in,
            'check_out' => $reservation?->check_out,
        ]);
    }

    public function callback(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        try {
            $payment = $this->onlinePayment->complete($request->all());
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 402);
        }

        $reservation = $payment->reservation;

        return response()->json([
            'message' => 'Payment received successfully.',
            'payment' => new PaymentResource($payment),
            'booking_reference' => $reservation?->booking_reference,
            'property_slug' => $reservation?->property?->slug,
        ]);
    }
}