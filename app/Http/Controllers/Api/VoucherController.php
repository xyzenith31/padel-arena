<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Voucher::latest()->get()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|unique:vouchers,code|uppercase',
            'discount_percentage' => 'required|numeric|min:1|max:100',
            'type' => 'required|in:all,session,custom',
        ]);

        Voucher::create($request->all());
        return response()->json(['message' => 'Voucher berhasil dibuat'], 201);
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
            ->first();

        if (!$voucher) {
            return response()->json(['message' => 'Kode voucher tidak valid'], 404);
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

    public function active()
    {
        $usedVoucherIds = DB::table('voucher_usages')
            ->where('user_id', auth()->id())
            ->pluck('voucher_id');

        $vouchers = Voucher::where('is_active', true)
            ->whereNotIn('id', $usedVoucherIds) 
            ->latest()
            ->get();
            
        return response()->json(['data' => $vouchers]);
    }
}