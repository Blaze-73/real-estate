<?php

namespace App\Services\Payments;

use App\Models\Payment;

class PaymentToken
{
    public static function issue(Payment $payment): string
    {
        return $payment->id . '.' . self::signature($payment);
    }

    public static function parse(string $token): ?Payment
    {
        $parts = explode('.', $token, 2);

        if (count($parts) !== 2) {
            return null;
        }

        [$id, $signature] = $parts;
        $payment = Payment::find((int) $id);

        if (!$payment || !hash_equals(self::signature($payment), $signature)) {
            return null;
        }

        return $payment;
    }

    public static function signature(Payment $payment): string
    {
        return hash_hmac('sha256', "pay:{$payment->id}:{$payment->amount}", self::secret());
    }

    private static function secret(): string
    {
        return (string) config('payments.sandbox.hmac_secret');
    }
}