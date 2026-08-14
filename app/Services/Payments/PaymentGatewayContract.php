<?php

namespace App\Services\Payments;

use App\Models\Payment;

interface PaymentGatewayContract
{
    public function name(): string;

    /**
     * Create a checkout session for a pending payment.
     *
     * @return array{url: string, reference: string}
     */
    public function createCheckout(Payment $payment): array;

    /**
     * Validate an inbound gateway payload and resolve the payment outcome.
     *
     * @return array{status: 'paid'|'failed', reference?: ?string}
     */
    public function handleCallback(array $payload, Payment $payment): array;
}