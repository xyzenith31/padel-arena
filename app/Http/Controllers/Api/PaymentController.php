<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Midtrans\Config;
use Midtrans\Transaction;
use Midtrans\Notification;

class PaymentController extends Controller
{
    public function __construct()
    {
        $this->configureMidtrans();
    }

    private function configureMidtrans()
    {
        Config::$serverKey = config('services.midtrans.server_key') ?? env('MIDTRANS_SERVER_KEY');
        Config::$isProduction = config('services.midtrans.is_production') ?? env('MIDTRANS_IS_PRODUCTION', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    public function checkTransactionStatus(Request $request)
    {
        $request->validate(['midtrans_order_id' => 'required|string']);

        $this->configureMidtrans();

        try {
            $midtransStatus = Transaction::status($request->midtrans_order_id);
            $parts = explode('-', $request->midtrans_order_id);
            $realOrderId = $parts[1] ?? null;
            
            $order = Order::find($realOrderId);

            if (!$order) {
                return response()->json(['message' => 'Order database tidak ditemukan'], 404);
            }

            $status = $midtransStatus->transaction_status;
            $type = $midtransStatus->payment_type;
            $fraud = $midtransStatus->fraud_status;
            $newPaymentStatus = null;

            if ($status == 'capture') {
                $newPaymentStatus = ($fraud == 'challenge') ? 'waiting_approval' : 'paid';
            } else if ($status == 'settlement') {
                $newPaymentStatus = 'paid'; 
            } else if ($status == 'pending') {
                $newPaymentStatus = 'pending';
            } else if ($status == 'deny' || $status == 'expire' || $status == 'cancel') {
                $newPaymentStatus = 'failed';
            }

            if ($newPaymentStatus === 'paid') {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'completed',
                    'payment_method' => 'midtrans (' . $type . ')'
                ]);
            } else if ($newPaymentStatus) {
                $order->update(['payment_status' => $newPaymentStatus]);
            }

            return response()->json([
                'message' => 'Status checked',
                'current_status' => $newPaymentStatus,
                'order_id' => $order->id
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Midtrans Error: ' . $e->getMessage()], 500);
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
        $orderIdRaw = $notif->order_id;
        $fraud = $notif->fraud_status;

        $parts = explode('-', $orderIdRaw);
        $realOrderId = $parts[1] ?? null;

        if (!$realOrderId) return response()->json(['message' => 'Invalid Order ID Format'], 400);

        $order = Order::find($realOrderId);
        if (!$order) return response()->json(['message' => 'Order Not Found'], 404);

        if ($transaction == 'capture') {
            if ($type == 'credit_card') {
                if ($fraud == 'challenge') {
                    $order->update(['payment_status' => 'waiting_approval']);
                } else {
                    $order->update(['payment_status' => 'paid', 'status' => 'completed']);
                }
            }
        } else if ($transaction == 'settlement') {
            $order->update(['payment_status' => 'paid', 'status' => 'completed']);
        } else if ($transaction == 'pending') {
            $order->update(['payment_status' => 'pending']);
        } else if ($transaction == 'deny') {
            $order->update(['payment_status' => 'failed']);
        } else if ($transaction == 'expire') {
            $order->update(['payment_status' => 'expired']);
        } else if ($transaction == 'cancel') {
            $order->update(['payment_status' => 'cancelled']);
        }

        return response()->json(['message' => 'Payment status updated']);
    }
}