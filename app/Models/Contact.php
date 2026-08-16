<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    /** @use HasFactory<\Database\Factories\ContactFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'is_read',
        'type',
        'follow_up_1_at',
        'follow_up_2_at',
        'follow_up_3_at',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'follow_up_1_at' => 'datetime',
            'follow_up_2_at' => 'datetime',
            'follow_up_3_at' => 'datetime',
        ];
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
