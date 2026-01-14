<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PadelCourt extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'operational_hours',
        'facilities',
        'price_per_hour',
        'price_per_day',
        'province_id',
        'province_name',
        'city_id',
        'city_name',
        'address',
        'postal_code',
        'email',
        'phone',
        'avatar',
        'images',
    ];

    protected $casts = [
        'operational_hours' => 'array',
        'facilities' => 'array',
        'images' => 'array',
        'price_per_hour' => 'decimal:2',
        'price_per_day' => 'decimal:2',
    ];
}