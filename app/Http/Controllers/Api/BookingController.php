<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\PadelCourt;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Midtrans\Snap;
use Midtrans\Config;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['user', 'court']) 
            ->latest();

        if ($request->padel_court_id) {
            $query->where('padel_court_id', $request->padel_court_id);
        }

        if ($request->date) {
            $query->whereDate('booking_date', $request->date);
        }

        if ($request->month) {
            $query->whereMonth('booking_date', $request->month);
        }

        if ($request->year) {
            $query->whereYear('booking_date', $request->year);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $bookings = $query->get()->map(function($booking) {
            return [
                'id' => $booking->id,
                'customer_name' => $booking->user->name ?? 'User Terhapus',
                'customer_email' => $booking->user->email ?? '-',
                'court_name' => $booking->court->name ?? 'Lapangan Terhapus',
                'date' => $booking->booking_date,
                'time' => substr($booking->start_time, 0, 5) . ' - ' . substr($booking->end_time, 0, 5),
                'total_price' => $booking->total_price,
                'status' => $booking->status,
                'created_at' => $booking->created_at->format('Y-m-d H:i'),
            ];
        });

        return response()->json(['data' => $bookings]);
    }
    
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    public function store(Request $request)
    {
        $request->validate([
            'padel_court_id' => 'required|exists:padel_courts,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        $court = PadelCourt::find($request->padel_court_id);
        $date = $request->booking_date;
        $start = $request->start_time;
        $end = $request->end_time;
        $startTime = Carbon::parse("$date $start");
        $endTime = Carbon::parse("$date $end");
        
        $dayNameMap = [
            'Monday' => 'Senin', 'Tuesday' => 'Selasa', 'Wednesday' => 'Rabu',
            'Thursday' => 'Kamis', 'Friday' => 'Jumat', 'Saturday' => 'Sabtu', 'Sunday' => 'Minggu'
        ];
        $dayName = $dayNameMap[$startTime->format('l')];

        $opHours = collect($court->operational_hours)->firstWhere('day', $dayName);
        
        if (!$opHours || !$opHours['isOpen']) {
            return response()->json(['message' => "Lapangan tutup pada hari $dayName"], 422);
        }

        $shopOpen = Carbon::parse("$date " . $opHours['open']);
        $shopClose = Carbon::parse("$date " . $opHours['close']);

        if ($startTime->lt($shopOpen) || $endTime->gt($shopClose)) {
            return response()->json([
                'message' => 'Waktu booking melebihi jam operasional lapangan.',
                'detail' => "Buka: {$opHours['open']} - Tutup: {$opHours['close']}"
            ], 422);
        }

        $isBooked = Booking::where('padel_court_id', $court->id)
            ->where('booking_date', $date)
            ->whereIn('status', ['paid', 'completed']) 
            ->where(function ($query) use ($start, $end) {
                $query->where(function ($q) use ($start, $end) {
                    $q->where('start_time', '>=', $start)
                      ->where('start_time', '<', $end);
                })->orWhere(function ($q) use ($start, $end) {
                    $q->where('end_time', '>', $start)
                      ->where('end_time', '<=', $end);
                });
            })->exists();

        if ($isBooked) {
            return response()->json(['message' => 'Jam tersebut sudah dibooking oleh orang lain.'], 422);
        }

        $durationMinutes = $startTime->diffInMinutes($endTime);
        $hours = $durationMinutes / 60;
        $totalPrice = $hours * $court->price_per_hour;

        try {
            DB::beginTransaction();

            $booking = Booking::create([
                'user_id' => auth()->id(),
                'padel_court_id' => $court->id,
                'booking_date' => $date,
                'start_time' => $start,
                'end_time' => $end,
                'duration_minutes' => $durationMinutes,
                'total_price' => $totalPrice,
                'status' => 'pending'
            ]);

            $params = [
                'transaction_details' => [
                    'order_id' => $booking->id,
                    'gross_amount' => (int) $totalPrice,
                ],
                'customer_details' => [
                    'first_name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                ],
                'item_details' => [
                    [
                        'id' => 'BOOKING-PADEL',
                        'price' => (int) $totalPrice,
                        'quantity' => 1,
                        'name' => "Sewa Lapangan {$court->name} ($durationMinutes Menit)"
                    ]
                ],
                'callbacks' => [
                    'finish' => "http://localhost:8000/booking/payment/{$booking->id}"
                ]
            ];

            $snapToken = Snap::getSnapToken($params);
            $booking->update(['snap_token' => $snapToken]);

            DB::commit();

            return response()->json([
                'message' => 'Booking berhasil dibuat, silakan lakukan pembayaran.',
                'data' => [
                    'booking_id' => $booking->id,
                    'snap_token' => $snapToken,
                    'total_price' => $totalPrice,
                    'details' => "{$dayName}, $date ($start - $end)"
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat booking: ' . $e->getMessage()], 500);
        }
    }

    public function myBookings()
    {
        $bookings = Booking::with('court')
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                $statusLabel = $booking->status;
                $now = Carbon::now();
                $bookingStart = Carbon::parse($booking->booking_date . ' ' . $booking->start_time);

                if ($booking->status == 'paid') {
                    if ($bookingStart->isToday() && $now->lt($bookingStart)) {
                        $statusLabel = 'Menunggu Jadwal Hari Ini';
                    } elseif ($bookingStart->isFuture()) {
                        $statusLabel = 'Menunggu Tanggal Main';
                    } elseif ($now->gt($bookingStart)) {
                        $statusLabel = 'Sedang Berjalan / Selesai';
                    }
                }

                return [
                    'id' => $booking->id,
                    'court_name' => $booking->court->name,
                    'court_city' => $booking->court->city_name,
                    'court_avatar' => $booking->court->avatar,
                    'date' => $booking->booking_date,
                    'time' => substr($booking->start_time, 0, 5) . ' - ' . substr($booking->end_time, 0, 5),
                    'total_price' => $booking->total_price,
                    'status' => $booking->status,
                    'status_label' => $statusLabel,
                    'snap_token' => $booking->snap_token,
                    'can_review' => $booking->status == 'completed' || ($booking->status == 'paid' && $now->gt($bookingStart))
                ];
            });

        return response()->json(['data' => $bookings]);
    }
}