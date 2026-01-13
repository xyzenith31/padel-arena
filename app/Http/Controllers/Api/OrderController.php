<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\Snap;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Order::with(['user', 'technician', 'items', 'office']); 

        if ($user->role === 'user') {
            $query->where('user_id', $user->id);
        } elseif ($user->role === 'teknisi') {
             $query->where(function($q) use ($user) {
                $q->where('technician_id', $user->id)
                  ->orWhere('status', 'pending');
            });
        }

        if ($request->has('status') && $request->status === 'unpaid_debt') {
            $query->where('payment_status', 'unpaid_debt');
        } elseif ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->latest()->get();
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $request->validate([
            'vehicle_type' => 'required|string',
            'vehicle_manufacturer' => 'required|string',
            'plate_number' => 'required|string',
            'damage_description' => 'required|string',
            'service_type' => 'required|in:call_technician,visit_workshop',
            'province' => 'required|string',
            'city' => 'required|string',
            'street_address' => 'required|string',
            'damage_photos' => 'required|array|min:1',
            'damage_photos.*' => 'image|mimes:jpeg,png,jpg|max:5120',
        ], [
            'damage_photos.required' => 'Wajib upload minimal 1 foto kerusakan!',
            'damage_photos.min' => 'Wajib upload minimal 1 foto kerusakan!',
            'damage_photos.*.image' => 'File harus berupa gambar.',
        ]);

        $photoPaths = [];
        if ($request->hasFile('damage_photos')) {
            foreach ($request->file('damage_photos') as $photo) {
                $path = $photo->store('damage_reports', 'public');
                $photoPaths[] = $path;
            }
        }

        $order = Order::create([
            'user_id' => $request->user()->id,
            'order_number' => 'ORD-' . time(),
            'vehicle_type' => $request->vehicle_type,
            'vehicle_manufacturer' => $request->vehicle_manufacturer,
            'vehicle_series' => $request->vehicle_series ?? '-',
            'plate_number' => strtoupper($request->plate_number),
            'damage_type' => $request->damage_type ?? 'Lainnya',
            'damage_description' => $request->damage_description,
            'service_type' => $request->service_type,
            'province' => $request->province,
            'city' => $request->city,
            'street_address' => $request->street_address,
            'status' => 'pending',
            'payment_status' => 'pending',
            'damage_photos' => json_encode($photoPaths), 
        ]);

        return response()->json([
            'message' => 'Order berhasil dibuat',
            'data' => $order
        ], 201);
    }

    public function cancelOrder(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|min:5'
        ]);

        $order = Order::where('id', $id)->where('user_id', Auth::id())->firstOrFail();

        if (!in_array($order->status, ['pending', 'accepted', 'waiting_payment', 'negotiating'])) {
            return response()->json(['message' => 'Order tidak bisa dibatalkan pada tahap ini.'], 403);
        }

        $order->update([
            'status' => 'cancelled',
            'cancel_reason' => $request->reason
        ]);

        return response()->json(['message' => 'Order dibatalkan.', 'data' => $order]);
    }

    public function requestNegotiation($id)
    {
        $order = Order::findOrFail($id);

        if ($order->status !== 'waiting_payment') {
            return response()->json(['message' => 'Tidak bisa negosiasi saat ini.'], 400);
        }

        $order->update([
            'status' => 'negotiating'
        ]);

        return response()->json([
            'message' => 'Pengajuan negosiasi terkirim.',
            'data' => $order
        ]);
    }

    public function indexPending()
    {
        $orders = Order::with('user:id,name,email,phone_number')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function acceptOrder($id)
    {
        $order = Order::where('id', $id)->where('status', 'pending')->firstOrFail();
        
        $order->update([
            'technician_id' => Auth::id(),
            'status' => 'accepted'
        ]);

        $userPhone = $order->user->phone_number;
        
        if (substr($userPhone, 0, 1) == '0') {
            $userPhone = '62' . substr($userPhone, 1);
        }

        return response()->json([
            'message' => 'Order diterima. Silahkan hubungi user.',
            'wa_link' => "https://wa.me/{$userPhone}?text=Halo, saya teknisi dari aplikasi Pitstop. Saya akan menuju ke lokasi Anda.",
            'data' => $order->load(['user', 'technician'])
        ]);
    }

    public function confirmLocationReceived($id)
    {
        $order = Order::where('id', $id)->where('technician_id', Auth::id())->firstOrFail();
        
        $order->update(['status' => 'location_received']);

        return response()->json([
            'message' => 'Lokasi diterima, status update.', 
            'data' => $order->load(['user', 'technician']) 
        ]);
    }

    public function submitDiagnosis(Request $request, $id)
    {
        $request->validate([
            'is_fixable_onsite' => 'required',
            'towing_cost' => 'nullable', 
            'items' => 'array',
            'items.*.image' => 'nullable|image|max:2048', 
        ]);

        $order = Order::with('user')->where('id', $id)->where('technician_id', Auth::id())->firstOrFail();

        DB::transaction(function () use ($order, $request) {
            $isFixable = filter_var($request->is_fixable_onsite, FILTER_VALIDATE_BOOLEAN);
            $order->is_fixable_onsite = $isFixable;
            
            $itemsTotal = 0;
            $order->items()->delete();

            if ($request->items) {
                foreach ($request->items as $index => $itemData) {
                    $imagePath = null;

                    if ($request->hasFile("items.{$index}.image")) {
                        $file = $request->file("items.{$index}.image");
                        $sparepartName = Str::slug($itemData['name'], '_');
                        $filename = "part_{$sparepartName}_" . time() . ".jpg";
                        $imagePath = $file->storeAs('sparepart_item', $filename, 'public');
                    }

                    $order->items()->create([
                        'item_name' => $itemData['name'],
                        'price' => $itemData['price'],
                        'quantity' => $itemData['quantity'],
                        'description' => $itemData['description'] ?? null,
                        'image_path' => $imagePath
                    ]);

                    $itemsTotal += ($itemData['price'] * $itemData['quantity']);
                }
            }

            $newStatus = ($order->status === 'negotiating') ? 'waiting_payment' : ($isFixable ? 'waiting_payment' : 'towing');
            $order->status = $newStatus;
            $towingCost = $request->towing_cost ? $request->towing_cost : 0;
            $order->total_cost = $itemsTotal + ($isFixable ? 0 : $towingCost);
            $order->towing_cost = $towingCost;
            
            $order->save();
        });

        return response()->json([
            'message' => 'Estimasi berhasil dikirim', 
            'data' => $order->load(['user', 'technician', 'items'])
        ]);
    }

    public function completePayment(Request $request, $id)
    {
        $request->validate([
            'payment_method' => 'required|in:midtrans,cash,guarantee_ktp', 
        ]);

        $order = Order::findOrFail($id);

        if ($request->payment_method === 'cash') {
            $order->update([
                'payment_method' => 'cash',
                'payment_status' => 'paid', 
                'status' => 'completed' 
            ]);

            return response()->json(['message' => 'Pembayaran tunai berhasil dicatat.']);
        }

        if ($request->payment_method === 'guarantee_ktp') {
            
            $request->validate([
                'ktp_image' => 'required|image|mimes:jpeg,png,jpg|max:5120', // WAJIB
                'office_id' => 'required|exists:offices,id', // WAJIB pilih kantor
            ], [
                'ktp_image.required' => 'Foto KTP wajib diupload untuk jaminan hutang!',
                'office_id.required' => 'Wajib memilih lokasi kantor penyimpanan KTP.'
            ]);

            $ktpPath = null;
            if ($request->hasFile('ktp_image')) {
                $ktpPath = $request->file('ktp_image')->store('ktp_guarantees', 'public');
            }

            $order->update([
                'payment_method' => 'guarantee_ktp',
                'payment_status' => 'unpaid_debt',
                'status' => 'completed', 
                'ktp_photo_path' => $ktpPath,
                'office_id' => $request->office_id
            ]);

            return response()->json(['message' => 'Jaminan KTP diterima. Akun dibekukan sementara hingga lunas.']);
        }

        if ($request->payment_method === 'midtrans') {
            \Midtrans\Config::$serverKey = env('MIDTRANS_SERVER_KEY');
            \Midtrans\Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;

            $params = [
                'transaction_details' => [
                    'order_id' => 'ORDER-' . $order->id . '-' . time(),
                    'gross_amount' => (int) $order->total_cost,
                ],
                'customer_details' => [
                    'first_name' => $order->user->name,
                    'phone' => $order->user->phone_number,
                ]
            ];

            try {
                $snapToken = \Midtrans\Snap::getSnapToken($params);
                $order->update(['payment_method' => 'midtrans']); 

                return response()->json([
                    'status' => 'success',
                    'snap_token' => $snapToken
                ]);
            } catch (\Exception $e) {
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }
    
    public function history(Request $request)
    {
        $user = Auth::user();
        
        $query = Order::with(['user:id,name,phone_number', 'technician:id,name,phone_number'])
            ->orderBy('created_at', 'desc');

        if ($user->role === 'user') {
            $query->where('user_id', $user->id);
        } elseif ($user->role === 'teknisi') {
            $query->where('technician_id', $user->id);
        }

        $orders = $query->get();

        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::with(['user', 'technician', 'items'])->findOrFail($id);
        if (is_string($order->damage_photos)) {
            $order->damage_photos = json_decode($order->damage_photos);
        }
        return response()->json($order);
    }

    public function markAsUnpaidDebt(Request $request, $id)
    {
        $request->validate([
            'ktp_photo' => 'required|image|max:4096',
            'office_id' => 'required|exists:offices,id',
        ]);

        $order = Order::findOrFail($id);
        $path = $request->file('ktp_photo')->store('ktp_debts', 'public');

        $order->update([
            'status' => 'cancelled',
            'payment_status' => 'unpaid_debt', 
            'ktp_photo_path' => $path,
            'office_id' => $request->office_id
        ]);

        return response()->json(['message' => 'Laporan hutang berhasil. Akun user dibekukan.']);
    }

    public function resolveDebt($id)
    {
        $order = Order::findOrFail($id);
        
        $order->update([
            'payment_status' => 'paid',
            'status' => 'completed',
            'payment_method' => 'pay_at_office',
        ]);

        return response()->json(['message' => 'Pembayaran Tunai Diterima. Akun dibuka.']);
    }

    public function checkUserDebtStatus()
    {
        $userId = auth()->id();
        $debtOrder = Order::where('user_id', $userId)
                        ->where('payment_status', 'unpaid_debt')
                        ->with('office')
                        ->first();

        if ($debtOrder) {
            return response()->json(['is_blocked' => true, 'debt_data' => $debtOrder]);
        }
        return response()->json(['is_blocked' => false]);
    }

    public function verifyPayment($id)
    {
        $order = Order::findOrFail($id);
        $order->update([
            'status' => 'completed',
            'payment_status' => 'paid'
        ]);
        return response()->json(['message' => 'Pembayaran dikonfirmasi. Order selesai.']);
    }
}