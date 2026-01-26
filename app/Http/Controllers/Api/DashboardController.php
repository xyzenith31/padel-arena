<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Booking;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Total User (Role User)
        $totalUsers = User::where('role', 'user')->count();

        // 2. Total Pendapatan (Hanya yang status paid/completed)
        $totalIncome = Booking::whereIn('status', ['paid', 'completed'])
            ->sum('final_price');

        // 3. Servis Aktif (Booking yang sudah dibayar tapi jadwalnya hari ini atau masa depan)
        $activeServices = Booking::where('status', 'paid')
            ->where(function($q) {
                $q->where('booking_date', '>', now()->toDateString())
                  ->orWhere(function($sub) {
                      $sub->where('booking_date', now()->toDateString())
                          ->where('end_time', '>', now()->format('H:i:s'));
                  });
            })->count();

        $incomeThisMonth = Booking::whereIn('status', ['paid', 'completed'])
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('final_price');

        $incomeLastMonth = Booking::whereIn('status', ['paid', 'completed'])
            ->whereMonth('created_at', Carbon::now()->subMonth()->month)
            ->whereYear('created_at', Carbon::now()->subMonth()->year)
            ->sum('final_price');

        $performance = 0;
        if ($incomeLastMonth > 0) {
            $performance = (($incomeThisMonth - $incomeLastMonth) / $incomeLastMonth) * 100;
        } else {
            $performance = $incomeThisMonth > 0 ? 100 : 0;
        }

        $latestUsers = User::latest()
            ->take(3)
            ->get()
            ->map(function ($user) {
                return [
                    'description' => "User Baru: {$user->name}",
                    'created_at' => $user->created_at->diffForHumans(),
                    'type' => 'user'
                ];
            });

        $latestBookings = Booking::with('user')
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($booking) {
                return [
                    'description' => "Booking Baru dari " . ($booking->user->name ?? 'User'),
                    'created_at' => $booking->created_at->diffForHumans(),
                    'type' => 'booking'
                ];
            });

        $recentActivities = $latestUsers->merge($latestBookings)
            ->sortByDesc('created_at') 
            ->values()
            ->take(5);

        return response()->json([
            'data' => [
                'total_users' => $totalUsers,
                'total_income' => $totalIncome,
                'active_services' => $activeServices,
                'performance_percentage' => round($performance, 1),
                'recent_activities' => $recentActivities
            ]
        ]);
    }
}