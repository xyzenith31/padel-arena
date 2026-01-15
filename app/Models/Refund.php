<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Refund extends Model
{
    protected $fillable = [
        'booking_id', 'user_id', 'reason', 
        'bank_name', 'account_number', 'account_holder', 
        'status', 'admin_note'
    ];

    public function booking() {
        return $this->belongsTo(Booking::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}