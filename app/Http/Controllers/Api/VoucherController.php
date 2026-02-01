<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Str; // Jangan lupa import Str
use Carbon\Carbon; // Jangan lupa import Carbon

class VoucherController extends Controller
{
    public function index(Request $request)
    {
        $vouchers = Voucher::whereNull('user_id')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $vouchers
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:vouchers,code|max:50',
            'discount_percentage' => 'required|numeric|min:1|max:100',
            'type' => 'required|in:all,session,custom',
            'valid_until' => 'required|date',
        ]);
        
        $voucher = Voucher::create([
            'user_id' => null,
            'code' => strtoupper($request->code),
            'discount_percentage' => $request->discount_percentage,
            'type' => $request->type,
            'valid_until' => Carbon::parse($request->valid_until)->endOfDay(),
            'is_active' => true,
            'is_used' => false,
        ]);

        return response()->json([
            'message' => 'Voucher berhasil dibuat oleh Admin.',
            'data' => $voucher
        ], 201);
    }

    public function destroy($id)
    {
        Voucher::destroy($id);
        return response()->json(['message' => 'Voucher dihapus']);
    }

    public function check(Request $request)
    {
        $request->validate([
            'code' => 'required',
            'booking_mode' => 'required' 
        ]);

        $voucher = Voucher::where('code', $request->code)
            ->where('is_active', true)
            ->where('valid_until', '>=', Carbon::now()) 
            ->first();

        if (!$voucher) {
            return response()->json(['message' => 'Kode voucher tidak valid atau kadaluarsa'], 404);
        }

        if ($voucher->user_id && $voucher->is_used) {
             return response()->json(['message' => 'Voucher ini sudah digunakan.'], 422);
        }

        $isUsed = DB::table('voucher_usages')
            ->where('user_id', auth()->id())
            ->where('voucher_id', $voucher->id)
            ->exists();

        if ($isUsed) {
            return response()->json(['message' => 'Anda sudah menggunakan voucher ini sebelumnya.'], 422);
        }

        if ($voucher->type !== 'all' && $voucher->type !== $request->booking_mode) {
             return response()->json(['message' => 'Voucher tidak berlaku untuk mode pesanan ini'], 422);
        }

        return response()->json([
            'message' => 'Voucher diterapkan!',
            'data' => $voucher
        ]);
    }

    public function active(Request $request)
    {
        $user = $request->user();

        $usedVoucherIds = DB::table('voucher_usages')
            ->where('user_id', $user->id)
            ->pluck('voucher_id');

        $vouchers = Voucher::where('is_active', true)
            ->where('valid_until', '>=', Carbon::now())
            ->whereNotIn('id', $usedVoucherIds) 
            ->where(function($query) use ($user) {
                $query->whereNull('user_id')
                      ->orWhere(function($q) use ($user) {
                          $q->where('user_id', $user->id)
                            ->where('is_used', false);
                      });
            })
            ->latest()
            ->get();
            
        return response()->json(['data' => $vouchers]);
    }
}