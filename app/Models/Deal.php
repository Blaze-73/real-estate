<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Deal extends Model
{
    /** @use HasFactory<\Database\Factories\DealFactory> */
    use HasFactory;

    public const TYPES = ['sale', 'rent', 'seasonal'];

    public const STATUSES = ['contacted', 'viewing', 'offer', 'negotiated', 'closed', 'lost'];

    protected $fillable = [
        'property_id',
        'contact_id',
        'type',
        'status',
        'client_name',
        'client_email',
        'client_phone',
        'price',
        'commission_rate',
        'commission_amount',
        'notes',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'commission_rate' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'closed_at' => 'datetime',
        ];
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }
}