<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyAvailability extends Model
{
    protected $table = 'property_availability';

    protected $fillable = [
        'property_id',
        'start_date',
        'end_date',
        'reason',
        'source',
        'ical_event_id',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}