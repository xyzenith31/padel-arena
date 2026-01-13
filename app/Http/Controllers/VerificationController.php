<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\VerificationCode;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
}