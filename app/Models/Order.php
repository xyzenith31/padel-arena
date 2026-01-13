<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    // Pastikan semua kolom ini ada
    protected $fillable = [
        'user_id',
        'technician_id',
        'vehicle_manufacturer',
        'vehicle_series',
        'plate_number',
        'vehicle_type',
        'damage_type',
        'custom_damage',
        'damage_description',
        'damage_photos',
        'service_type',
        'province',
        'city',
        'street_address',
        'status',
        'cancel_reason',
        'is_fixable_onsite',
        'towing_cost',
        'total_cost',
        'payment_method',
        'guarantee_photo',
        'payment_status',
        'ktp_photo_path', 
        'office_id',
    ];

    use HasFactory;

    protected $guarded = ['id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function office()
    {
        return $this->belongsTo(Office::class);
    }
}