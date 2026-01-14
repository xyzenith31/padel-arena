<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RegionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\PadelController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/midtrans/callback', [PaymentController::class, 'notificationHandler']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/regions/provinces', [RegionController::class, 'provinces']);
    Route::get('/regions/cities/{provinceId}', [RegionController::class, 'cities']);
    Route::post('/midtrans/check-status', [PaymentController::class, 'checkTransactionStatus']);
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
});