<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\RevenueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        protected RevenueService $revenueService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Payment::with(['rental.property', 'reservation.property']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('rental_id')) {
            $query->where('rental_id', $request->rental_id);
        }

        if ($request->filled('reservation_id')) {
            $query->where('reservation_id', $request->reservation_id);
        }

        if ($request->filled('date_from')) {
            $query->where('payment_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('payment_date', '<=', $request->date_to);
        }

        $payments = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json(PaymentResource::collection($payments));
    }

    public function show(Payment $payment): JsonResponse
    {
        $payment->load(['rental.property', 'reservation.property']);

        return response()->json(new PaymentResource($payment));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rental_id' => 'nullable|exists:rentals,id',
            'reservation_id' => 'nullable|exists:reservations,id',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string|max:255',
            'status' => 'nullable|in:paid,pending,overdue',
            'receipt_file' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:10240',
            'notes' => 'nullable|string',
        ]);

        if ($request->hasFile('receipt_file')) {
            $validated['receipt_file'] = $request->file('receipt_file')->store('receipts', 'public');
        }

        $payment = Payment::create($validated);
        $payment->load(['rental.property', 'reservation.property']);

        return response()->json(new PaymentResource($payment), 201);
    }

    public function update(Request $request, Payment $payment): JsonResponse
    {
        $validated = $request->validate([
            'rental_id' => 'nullable|exists:rentals,id',
            'reservation_id' => 'nullable|exists:reservations,id',
            'amount' => 'sometimes|numeric|min:0',
            'payment_date' => 'sometimes|date',
            'payment_method' => 'sometimes|string|max:255',
            'status' => 'nullable|in:paid,pending,overdue',
            'receipt_file' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:10240',
            'notes' => 'nullable|string',
        ]);

        if ($request->hasFile('receipt_file')) {
            $validated['receipt_file'] = $request->file('receipt_file')->store('receipts', 'public');
        }

        $payment->update($validated);
        $payment->load(['rental.property', 'reservation.property']);

        return response()->json(new PaymentResource($payment));
    }

    public function markPaid(Payment $payment): JsonResponse
    {
        $payment->update([
            'status' => 'paid',
            'payment_date' => now()->toDateString(),
            'payment_method' => $payment->payment_method ?: 'cash',
        ]);

        $this->confirmPendingBooking($payment);

        app(\App\Services\ActivityLogService::class)->log(
            'payment.marked_paid',
            ($payment->reservation
                ? $payment->reservation->booking_reference . ' '
                : '') . 'payment of ' . $payment->amount . ' MAD marked paid',
            ['payment_id' => $payment->id, 'reservation_id' => $payment->reservation_id, 'rental_id' => $payment->rental_id]
        );

        $payment->load(['rental.property', 'reservation.property']);

        return response()->json(new PaymentResource($payment));
    }

    private function confirmPendingBooking(Payment $payment): void
    {
        if (!$payment->reservation || $payment->reservation->status !== 'pending') {
            return;
        }

        if ((float) $payment->reservation->deposit > 0 && (float) $payment->amount < (float) $payment->reservation->deposit) {
            return;
        }

        $payment->reservation->update(['status' => 'approved']);
    }

    public function destroy(Payment $payment): JsonResponse
    {
        $payment->delete();

        return response()->json(['message' => 'Payment deleted successfully']);
    }

    public function monthlyReport(Request $request): JsonResponse
    {
        $year = $request->year ?? now()->year;
        $report = $this->revenueService->getMonthlyRevenue((int) $year);

        return response()->json($report);
    }

    public function yearlyReport(): JsonResponse
    {
        $report = $this->revenueService->getYearlyRevenue();

        return response()->json($report);
    }
}
