<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\VerificationCode;
use App\Mail\SendVerificationCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class PasswordResetLinkController extends Controller
{
    /**
     * Handle an incoming password reset link request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => ['required', 'string'],
        ]);

        $inputType = filter_var($request->input('email'), FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        $user = User::where($inputType, $request->input('email'))->first();

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        // Generate Code
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

        return response()->json([
            'message' => 'Kode verifikasi telah dikirim ke email Anda.',
            'require_verification' => true,
            'email' => $user->email,
            'purpose' => 'reset_password'
        ]);
    }
}