<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\VerificationCode;
use App\Mail\SendVerificationCode;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class VerificationController extends Controller
{
    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->first();
        
        $verification = VerificationCode::where('user_id', $user->id)
            ->where('code', $request->code)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$verification) {
            return response()->json(['message' => 'Kode verifikasi salah atau sudah kedaluwarsa.'], 422);
        }

        Auth::login($user);
        $request->session()->regenerate();

        $verification->delete();

        return response()->json([
            'message' => 'Verifikasi berhasil, login sukses.',
            'user' => $user,
            'redirect' => '/dashboard'
        ]);
    }

    public function resend(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        $lastCode = VerificationCode::where('user_id', $user->id)
            ->where('created_at', '>', Carbon::now()->subMinute())
            ->first();

        if ($lastCode) {
            return response()->json(['message' => 'Mohon tunggu 60 detik sebelum meminta kode baru.'], 429);
        }

        $code = rand(100000, 999999);

        VerificationCode::updateOrCreate(
            ['user_id' => $user->id],
            ['code' => $code, 'expires_at' => Carbon::now()->addMinutes(10)]
        );

        try {
            Mail::to($user->email)->send(new SendVerificationCode($code, $user->name));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengirim email.'], 500);
        }

        return response()->json(['message' => 'Kode verifikasi baru telah dikirim ke email Anda.']);
    }
}