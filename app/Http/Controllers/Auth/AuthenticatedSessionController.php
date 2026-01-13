<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\VerificationCode;
use App\Models\User;
use App\Mail\SendVerificationCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request)
    {
        $request->authenticate(); 

        $user = $request->user(); 
        if (!$user) {
            $inputType = filter_var($request->input('login'), FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
            $user = User::where($inputType, $request->input('login'))->first();
        }
        
        Auth::guard('web')->logout(); 

        $code = rand(100000, 999999);
        
        VerificationCode::updateOrCreate(
            ['user_id' => $user->id],
            ['code' => $code, 'expires_at' => Carbon::now()->addMinutes(10)]
        );

        try {
             Mail::to($user->email)->send(new SendVerificationCode($code, $user->name));
        } catch (\Exception $e) {
             return response()->json(['message' => 'Gagal mengirim email: ' . $e->getMessage()], 500);
        }

        return response()->json([
            'message' => 'Kredensial valid. Silakan verifikasi kode.',
            'require_verification' => true,
            'email' => $user->email
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['message' => 'Logged out']);
    }
}