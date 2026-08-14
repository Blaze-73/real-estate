<?php

namespace App\Services\Payments;

use RuntimeException;

class PaymentGatewayManager
{
    public function driver(?string $driver = null): PaymentGatewayContract
    {
        $name = $driver ?: (string) config('payments.driver', 'sandbox');

        return match ($name) {
            'sandbox' => new SandboxPaymentGateway(),
            'cmi', 'cih' => throw new RuntimeException(
                "The '{$name}' payment driver requires merchant credentials and its adapter is not implemented yet. Use PAYMENT_DRIVER=sandbox."
            ),
            default => throw new RuntimeException("Unsupported payment driver: {$name}"),
        };
    }
}