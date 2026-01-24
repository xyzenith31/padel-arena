<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RegionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\PadelController;
use App\Http\Controllers\Api\PadelPublicController; 
use App\Http\Controllers\Api\RefundController;
use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ComplaintController;
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
    Route::post('/complaints', [ComplaintController::class, 'store']);
    Route::get('/my-complaints', [ComplaintController::class, 'myComplaints']);
    Route::get('/admin/complaints', [ComplaintController::class, 'index']);
    Route::post('/admin/complaints/{id}', [ComplaintController::class, 'update']);
    Route::post('/refunds', [RefundController::class, 'store']);
    Route::get('/admin/refunds', [RefundController::class, 'index']);
    Route::post('/admin/refunds/{id}/process', [RefundController::class, 'process']);
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
    Route::post('/bookings', [BookingController::class, 'store']);  
    Route::get('/admin/bookings', [BookingController::class, 'index']);
    Route::get('/my-bookings', [BookingController::class, 'myBookings']);
    Route::post('/midtrans/check-status', [PaymentController::class, 'checkTransactionStatus']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::post('/vouchers/check', [VoucherController::class, 'check']);
    Route::get('/admin/vouchers', [VoucherController::class, 'index']);
    Route::post('/admin/vouchers', [VoucherController::class, 'store']);
    Route::delete('/admin/vouchers/{id}', [VoucherController::class, 'destroy']);
    Route::get('/vouchers-active', [VoucherController::class, 'active']);
});