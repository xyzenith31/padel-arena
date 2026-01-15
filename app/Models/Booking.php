<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'id', 'user_id', 'padel_court_id', 'booking_date', 
        'start_time', 'end_time', 'duration_minutes', 
        'total_price', 'status', 'snap_token'
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function court() {
        return $this->belongsTo(PadelCourt::class, 'padel_court_id');
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
    
    public function review() {
        return $this->hasOne(Review::class);
    }
}