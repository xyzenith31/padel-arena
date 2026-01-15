<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use Midtrans\Config;
use Midtrans\Transaction;
use Midtrans\Notification;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct()
    {
        $this->configureMidtrans();
    }

    private function configureMidtrans()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    public function checkTransactionStatus(Request $request)
    {
        $request->validate(['order_id' => 'required|string']);

        $this->configureMidtrans();

        try {
            $orderId = $request->order_id;
            $midtransStatus = Transaction::status($orderId);
            $booking = Booking::find($orderId);

            if (!$booking) {
                return response()->json(['message' => 'Booking tidak ditemukan'], 404);
            }

            $transactionStatus = $midtransStatus->transaction_status;
            $fraudStatus = $midtransStatus->fraud_status;
            $paymentType = $midtransStatus->payment_type;
            
            $newStatus = 'pending';

            if ($transactionStatus == 'capture') {
                $newStatus = ($fraudStatus == 'challenge') ? 'pending' : 'paid';
            } else if ($transactionStatus == 'settlement') {
                $newStatus = 'paid';
            } else if ($transactionStatus == 'pending') {
                $newStatus = 'pending';
            } else if ($transactionStatus == 'deny' || $transactionStatus == 'expire' || $transactionStatus == 'cancel') {
                $newStatus = 'cancelled';
            }

            if ($newStatus === 'paid') {
                $booking->update([
                    'status' => 'paid',
                ]);
            } else if ($newStatus === 'cancelled') {
                $booking->update(['status' => 'cancelled']);
            }

            return response()->json([
                'message' => 'Status berhasil diperbarui',
                'status' => $newStatus,
                'midtrans_status' => $transactionStatus,
                'data' => $booking
            ]);

        } catch (\Exception $e) {
            Log::error("Midtrans Error: " . $e->getMessage());
            return response()->json(['message' => 'Gagal mengecek status: ' . $e->getMessage()], 500);
        }
    }

    public function notificationHandler(Request $request)
    {
        $this->configureMidtrans();

        try {
            $notif = new Notification();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid Notification'], 400);
        }

        $transaction = $notif->transaction_status;
        $type = $notif->payment_type;
        $orderId = $notif->order_id;
        $fraud = $notif->fraud_status;

        $booking = Booking::find($orderId);
        if (!$booking) return response()->json(['message' => 'Booking Not Found'], 404);

        if ($transaction == 'capture') {
            if ($type == 'credit_card') {
                if ($fraud == 'challenge') {
                    $booking->update(['status' => 'pending']);
                } else {
                    $booking->update(['status' => 'paid']);
                }
            }
        } else if ($transaction == 'settlement') {
            $booking->update(['status' => 'paid']);
        } else if ($transaction == 'pending') {
            $booking->update(['status' => 'pending']);
        } else if ($transaction == 'deny' || $transaction == 'expire' || $transaction == 'cancel') {
            $booking->update(['status' => 'cancelled']);
        }

        return response()->json(['message' => 'Payment status updated']);
    }
}