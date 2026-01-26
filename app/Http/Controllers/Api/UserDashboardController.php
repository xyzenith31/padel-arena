<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Voucher; //
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class UserDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $now = Carbon::now();

        $activeBookings = Booking::where('user_id', $user->id)
            ->where('status', 'paid')
            ->where(function($q) use ($now) {
                $q->where('booking_date', '>', $now->toDateString())
                  ->orWhere(function($sub) use ($now) {
                      $sub->where('booking_date', $now->toDateString())
                          ->where('end_time', '>', $now->format('H:i:s'));
                  });
            })->count();

        $completedBookings = Booking::where('user_id', $user->id)
            ->whereIn('status', ['completed', 'paid'])
            ->where(function($q) use ($now) {
                $q->where('booking_date', '<', $now->toDateString())
                  ->orWhere(function($sub) use ($now) {
                      $sub->where('booking_date', $now->toDateString())
                          ->where('end_time', '<=', $now->format('H:i:s'));
                  })
                  ->orWhere('status', 'completed');
            })->count();

        $totalSpent = Booking::where('user_id', $user->id)
            ->whereIn('status', ['paid', 'completed'])
            ->sum('final_price');

        $usedVoucherIds = DB::table('voucher_usages')
            ->where('user_id', $user->id)
            ->pluck('voucher_id');

        $promos = Voucher::where('is_active', true)
            ->where('valid_until', '>=', $now)
            ->whereNotIn('id', $usedVoucherIds)
            ->where(function($query) use ($user) {
                $query->whereNull('user_id')
                      ->orWhere('user_id', $user->id);
            })
            ->latest()
            ->take(3)
            ->get();

        return response()->json([
            'data' => [
                'active_bookings' => $activeBookings,
                'completed_bookings' => $completedBookings,
                'total_spent' => $totalSpent,
                'promos' => $promos
            ]
        ]);
    }
}   