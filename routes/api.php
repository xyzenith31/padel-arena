<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RegionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\PadelController;
use App\Http\Controllers\Api\PadelPublicController; 
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ReviewController;

/*
|--------------------------------------------------------------------------
| API Routes (Prefix: /api)
|--------------------------------------------------------------------------
*/

Route::get('/regions/provinces', [RegionController::class, 'provinces']);
Route::get('/regions/cities/{provinceId}', [RegionController::class, 'cities']);
Route::post('/midtrans/callback', [PaymentController::class, 'notificationHandler']);
Route::get('/padel-courts-public', [PadelPublicController::class, 'index']);
Route::get('/padel-courts-public/{id}', [PadelPublicController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/admin/users', [UserManagementController::class, 'index']);
    Route::get('/admin/users/{id}', [UserManagementController::class, 'show']);
    Route::post('/admin/users', [UserManagementController::class, 'store']);
    Route::post('/admin/users/{id}', [UserManagementController::class, 'update']);
    Route::delete('/admin/users/{id}', [UserManagementController::class, 'destroy']);
    Route::get('/admin/padel-courts', [PadelController::class, 'index']);
    Route::get('/admin/padel-courts/{id}', [PadelController::class, 'show']);
    Route::post('/admin/padel-courts', [PadelController::class, 'store']); 
    Route::post('/admin/padel-courts/{id}', [PadelController::class, 'update']); 
    Route::delete('/admin/padel-courts/{id}', [PadelController::class, 'destroy']);
    Route::post('/bookings', [BookingController::class, 'store']);       // Buat Order
    Route::get('/my-bookings', [BookingController::class, 'myBookings']); // History Order
    Route::post('/midtrans/check-status', [PaymentController::class, 'checkTransactionStatus']);
    Route::post('/reviews', [ReviewController::class, 'store']);
});