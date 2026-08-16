<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    /** @use HasFactory<\Database\Factories\ReservationFactory> */
    use HasFactory;

    protected $fillable = [
        'property_id',
        'client_id',
        'check_in',
        'check_out',
        'status',
        'message',
        'booking_reference',
        'total_price',
        'deposit',
        'promotion_id',
        'discount',
        'guests',
        'guest_name',
        'guest_email',
        'guest_phone',
        'channel',
        'source',
        'marketing_consent',
    ];

    protected function casts(): array
    {
        return [
            'check_in' => 'date',
            'check_out' => 'date',
            'total_price' => 'decimal:2',
            'deposit' => 'decimal:2',
            'discount' => 'decimal:2',
            'marketing_consent' => 'boolean',
        ];
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function promotion()
    {
        return $this->belongsTo(Promotion::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
