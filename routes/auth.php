<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\ProfileController; 
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::post('register', [RegisteredUserController::class, 'store']);
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
    Route::post('verify-code', [VerificationController::class, 'verify']);
    Route::get('auth/google/redirect', [SocialAuthController::class, 'redirect']);
    Route::get('auth/google/callback', [SocialAuthController::class, 'callback']);
    Route::post('complete-registration', [SocialAuthController::class, 'completeRegistration']);
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.store');
    Route::post('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('password-update', [ProfileController::class, 'updatePassword']);
    Route::delete('admin/profile-avatar', [ProfileController::class, 'destroyAvatar']);
});