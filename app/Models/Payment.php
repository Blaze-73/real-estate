<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    /** @use HasFactory<\Database\Factories\PaymentFactory> */
    use HasFactory;

    protected $fillable = [
        'rental_id',
        'reservation_id',
        'amount',
        'payment_date',
        'payment_method',
        'status',
        'gateway',
        'gateway_reference',
        'gateway_status',
        'paid_at',
        'receipt_file',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'payment_date' => 'date',
            'paid_at' => 'datetime',
        ];
    }

    public function rental()
    {
        return $this->belongsTo(Rental::class);
    }

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }
}
