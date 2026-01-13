<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RegionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\UserManagementController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Payment Callback (Public)
Route::post('/midtrans/callback', [PaymentController::class, 'notificationHandler']);

Route::middleware('auth:sanctum')->group(function () {
    
    // Region Routes
    Route::get('/regions/provinces', [RegionController::class, 'provinces']);
    Route::get('/regions/cities/{provinceId}', [RegionController::class, 'cities']);

    // Payment Routes (Check Status)
    Route::post('/midtrans/check-status', [PaymentController::class, 'checkTransactionStatus']);

    // User Management Routes (Admin)
    Route::get('/admin/users', [UserManagementController::class, 'index']);
    Route::get('/admin/users/{id}', [UserManagementController::class, 'show']);
    Route::post('/admin/users', [UserManagementController::class, 'store']);
    Route::post('/admin/users/{id}', [UserManagementController::class, 'update']);
    Route::delete('/admin/users/{id}', [UserManagementController::class, 'destroy']); 
});