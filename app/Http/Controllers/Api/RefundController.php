<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Refund;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Midtrans\Config;
use Midtrans\Transaction;

class RefundController extends Controller
{
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
            'booking_id' => 'required|exists:bookings,id',
            'reason' => 'required|string|min:10',
            'bank_name' => 'required|string',
            'account_number' => 'required|string',
            'account_holder' => 'required|string',
        ]);

        $booking = Booking::where('id', $request->booking_id)
                          ->where('user_id', auth()->id())
                          ->firstOrFail();

        if ($booking->status !== 'paid') {
            return response()->json(['message' => 'Hanya booking lunas yang bisa di-refund.'], 422);
        }

        if (Refund::where('booking_id', $booking->id)->exists()) {
            return response()->json(['message' => 'Permintaan refund sudah diajukan sebelumnya.'], 422);
        }

        DB::transaction(function () use ($request, $booking) {
            Refund::create([
                'booking_id' => $booking->id,
                'user_id' => auth()->id(),
                'reason' => $request->reason,
                'bank_name' => $request->bank_name,
                'account_number' => $request->account_number,
                'account_holder' => $request->account_holder,
                'status' => 'pending'
            ]);

            $booking->update(['status' => 'refund_requested']);
        });

        return response()->json(['message' => 'Permintaan refund berhasil dikirim. Menunggu persetujuan Admin.']);
    }

    public function index()
    {
        $refunds = Refund::with(['booking', 'user', 'booking.court'])
            ->latest()
            ->get();
            
        return response()->json(['data' => $refunds]);
    }

    public function process(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|in:approve,reject',
            'admin_note' => 'nullable|string'
        ]);

        $refund = Refund::with('booking')->findOrFail($id);
        $booking = $refund->booking;

        if ($refund->status !== 'pending') {
            return response()->json(['message' => 'Refund ini sudah diproses sebelumnya.'], 422);
        }

        if ($request->action === 'reject') {
            $refund->update([
                'status' => 'rejected',
                'admin_note' => $request->admin_note ?? 'Ditolak oleh Admin.'
            ]);
            $booking->update(['status' => 'paid']);
            
            return response()->json(['message' => 'Permintaan refund ditolak.']);
        }

        if ($request->action === 'approve') {
            $midtransMessage = '';
            $finalStatus = 'approved';

            try {
                $params = [
                    'refund_key' => 'refund-' . uniqid(),
                    'amount' => (int) $booking->total_price,
                    'reason' => $refund->reason
                ];

                $response = Transaction::refund($booking->id, $params);
                
                $midtransMessage = "Midtrans Auto-Refund Success: " . json_encode($response);

            } catch (\Exception $e) {
                $midtransMessage = "Midtrans Auto-Refund Failed/Not Supported: " . $e->getMessage();
                $finalStatus = 'approved';
            }

            $refund->update([
                'status' => $finalStatus,
                'admin_note' => ($request->admin_note ?? 'Disetujui.') . " | System Log: " . $midtransMessage
            ]);

            $booking->update(['status' => 'refunded']);

            return response()->json([
                'message' => 'Refund disetujui.',
                'system_note' => $midtransMessage,
                'manual_needed' => strpos($midtransMessage, 'Failed') !== false
            ]);
        }
    }
}