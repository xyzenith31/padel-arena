<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Booking;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string'
        ]);

        $booking = Booking::where('id', $request->booking_id)
                          ->where('user_id', auth()->id())
                          ->first();

        if (!$booking) {
            return response()->json(['message' => 'Booking tidak ditemukan.'], 404);
        }

        if ($booking->status !== 'completed' && $booking->status !== 'paid') {
            return response()->json(['message' => 'Anda belum menyelesaikan permainan ini.'], 403);
        }

        if (Review::where('booking_id', $booking->id)->exists()) {
            return response()->json(['message' => 'Anda sudah memberikan ulasan.'], 400);
        }

        Review::create([
            'user_id' => auth()->id(),
            'padel_court_id' => $booking->padel_court_id,
            'booking_id' => $booking->id,
            'rating' => $request->rating,
            'comment' => $request->comment
        ]);
        
        $booking->update(['status' => 'completed']);

        return response()->json(['message' => 'Terima kasih atas ulasan Anda!']);
    }
}