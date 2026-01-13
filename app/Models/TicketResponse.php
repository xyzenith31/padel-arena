<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_service_ticket_id',
        'user_id',
        'message',
        'photo_path',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}