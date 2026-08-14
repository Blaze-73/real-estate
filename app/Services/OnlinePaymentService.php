<?php

namespace App\Services;

use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Models\Reservation;
use App\Services\Payments\PaymentGatewayManager;
use App\Services\Payments\PaymentToken;
use DomainException;

class OnlinePaymentService
{
    public function __construct(
        protected PaymentGatewayManager $gateways
    ) {}

    public function depositPaymentFor(Reservation $reservation): ?Payment
    {
        return Payment::where('reservation_id', $reservation->id)
            ->where('payment_method', 'deposit')
            ->where('status', 'pending')
            ->latest()
            ->first();
    }

    public function checkout(Reservation $reservation): array
    {
        $payment = $this->depositPaymentFor($reservation);

        if (!$payment) {
            throw new DomainException('No pending deposit payment was found for this booking.');
        }

        $gateway = $this->gateways->driver();
        $checkout = $gateway->createCheckout($payment);

        $payment->update([
            'gateway' => $gateway->name(),
            'gateway_reference' => $checkout['reference'],
            'gateway_status' => 'created',
        ]);

        return [
            'gateway' => $gateway->name(),
            'checkout_url' => $checkout['url'],
            'payment' => new PaymentResource($payment->fresh()),
        ];
    }

    public function preview(string $token): Payment
    {
        $payment = PaymentToken::parse($token);

        if (!$payment) {
            throw new DomainException('This payment link is invalid or expired.');
        }

        return $payment->load(['reservation.property']);
    }

    public function complete(array $data): Payment
    {
        $payment = PaymentToken::parse((string) ($data['token'] ?? ''));

        if (!$payment) {
            throw new DomainException('This payment link is invalid or expired.');
        }

        if ($payment->status === 'paid') {
            return $payment->load(['reservation.property']);
        }

        $gateway = $this->gateways->driver($payment->gateway ?: (string) config('payments.driver', 'sandbox'));
        $outcome = $gateway->handleCallback($data, $payment);

        if (($outcome['status'] ?? 'failed') !== 'paid') {
            $payment->update(['gateway_status' => 'failed']);

            throw new DomainException('Payment was declined. Please try another card.');
        }

        $payment->update([
            'status' => 'paid',
            'payment_method' => 'deposit',
            'gateway_status' => 'paid',
            'gateway_reference' => $outcome['reference'] ?? $payment->gateway_reference,
            'paid_at' => now(),
        ]);

        $this->confirmPendingBooking($payment);

        app(ActivityLogService::class)->log(
            'payment.online_paid',
            ($payment->reservation?->booking_reference ?? '') . ' deposit paid online (' . $payment->amount . ' MAD)',
            ['payment_id' => $payment->id, 'reservation_id' => $payment->reservation_id]
        );

        return $payment->fresh(['reservation.property']);
    }

    private function confirmPendingBooking(Payment $payment): void
    {
        $reservation = $payment->reservation;

        if (!$reservation || $reservation->status !== 'pending') {
            return;
        }

        if ((float) $reservation->deposit > 0 && (float) $payment->amount < (float) $reservation->deposit) {
            return;
        }

        $reservation->update(['status' => 'approved']);
    }
}