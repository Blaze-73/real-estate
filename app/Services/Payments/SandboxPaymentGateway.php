<?php

namespace App\Services\Payments;

use App\Models\Payment;
use Illuminate\Support\Str;

class SandboxPaymentGateway implements PaymentGatewayContract
{
    public function name(): string
    {
        return 'sandbox';
    }

    public function createCheckout(Payment $payment): array
    {
        $url = rtrim((string) config('payments.frontend_url'), '/') . '/pay/' . PaymentToken::issue($payment);

        return [
            'url' => $url,
            'reference' => 'sandbox-' . $payment->id,
        ];
    }

    public function handleCallback(array $payload, Payment $payment): array
    {
        $card = preg_replace('/\D/', '', (string) ($payload['card_number'] ?? ''));
        $declined = strlen($card) > 0 && str_ends_with($card, '0001');

        return [
            'status' => $declined ? 'failed' : 'paid',
            'reference' => 'sandbox-' . $payment->id . '-' . strtoupper(Str::random(8)),
        ];
    }
}