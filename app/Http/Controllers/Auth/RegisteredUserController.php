<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\VerificationCode;
use App\Models\Voucher; //
use App\Mail\SendVerificationCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Illuminate\Support\Str;
use Carbon\Carbon;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:'.User::class],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:'.User::class],
            'phone_number' => ['nullable', 'string', 'max:20', 'unique:'.User::class],
            'date_of_birth' => ['nullable', 'date'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'date_of_birth' => $request->date_of_birth,
            'password' => Hash::make($request->password),
        ]);

        Voucher::create([
            'user_id' => $user->id,
            'name' => 'Voucher Pengguna Baru',
            'code' => 'WELCOME-' . strtoupper(Str::random(6)),
            'description' => 'Diskon khusus untuk pendaftaran akun baru.',
            'amount' => 20000,
            'type' => 'fixed',
            'is_used' => false,
            'valid_from' => Carbon::now(),
            'valid_until' => Carbon::now()->addWeeks(2), 
        ]);

        $code = rand(100000, 999999);

        VerificationCode::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => Carbon::now()->addMinutes(10)
        ]);

        Mail::to($user->email)->send(new SendVerificationCode($code, $user->name));

        return response()->json([
            'message' => 'Registrasi berhasil. Voucher pengguna baru telah ditambahkan. Silakan cek email untuk kode verifikasi.',
            'require_verification' => true,
            'email' => $user->email
        ], 201);
    }
}