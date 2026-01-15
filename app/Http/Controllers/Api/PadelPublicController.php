<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PadelCourt;
use App\Models\Booking;
use Illuminate\Http\Request;

class PadelPublicController extends Controller
{
    public function index(Request $request)
    {
        $query = PadelCourt::withCount('reviews');

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('city_name', 'like', '%' . $request->search . '%');
        }

        $courts = $query->get()->map(function($court) {
            return [
                'id' => $court->id,
                'name' => $court->name,
                'city' => $court->city_name,
                'price_per_hour' => $court->price_per_hour,
                'rating' => $court->average_rating,
                'total_reviews' => $court->reviews_count,
                'avatar' => $court->avatar,
                'operational_hours' => $court->operational_hours,
            ];
        });

        return response()->json(['data' => $courts]);
    }

    public function show($id, Request $request)
    {
        $court = PadelCourt::with(['reviews.user' => function($q) {
            $q->select('id', 'name');
        }])->find($id);

        if (!$court) return response()->json(['message' => 'Lapangan tidak ditemukan'], 404);

        $date = $request->query('date', date('Y-m-d'));
        
        $bookedSlots = Booking::where('padel_court_id', $id)
            ->where('booking_date', $date)
            ->whereIn('status', ['paid', 'completed'])
            ->get(['start_time', 'end_time'])
            ->map(function($slot) {
                return [
                    'start' => substr($slot->start_time, 0, 5),
                    'end' => substr($slot->end_time, 0, 5),
                ];
            });

        return response()->json([
            'data' => [
                'details' => $court,
                'average_rating' => $court->average_rating,
                'reviews' => $court->reviews,
                'schedule_status' => [
                    'date' => $date,
                    'booked_slots' => $bookedSlots
                ]
            ]
        ]);
    }
}