<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 
        'item_name', 
        'price', 
        'quantity',
        'description',
        'image_path',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}