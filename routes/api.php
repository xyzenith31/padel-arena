<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CustomerServiceController;
use App\Http\Controllers\Api\OfficeController;
use App\Http\Controllers\Api\RegionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\UserManagementController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/midtrans/callback', [PaymentController::class, 'notificationHandler']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/regions/provinces', [RegionController::class, 'provinces']);
    Route::get('/regions/cities/{provinceId}', [RegionController::class, 'cities']);
    Route::get('/customer-service', [CustomerServiceController::class, 'index']);
    Route::post('/customer-service', [CustomerServiceController::class, 'store']);
    Route::get('/customer-service/{id}', [CustomerServiceController::class, 'show']);
    Route::post('/customer-service/{id}/reply', [CustomerServiceController::class, 'reply']);
    Route::patch('/customer-service/{id}/status', [CustomerServiceController::class, 'updateStatus']);
    Route::post('/customer-service/{id}/resolve', [CustomerServiceController::class, 'markAsResolved']);
    Route::get('/offices', [OfficeController::class, 'index']);
    Route::post('/offices', [OfficeController::class, 'store']);
    Route::delete('/offices/{id}', [OfficeController::class, 'destroy']);
    Route::post('/midtrans/check-status', [PaymentController::class, 'checkTransactionStatus']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/history', [OrderController::class, 'history']);
    Route::get('/orders/pending', [OrderController::class, 'indexPending']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/negotiate', [OrderController::class, 'requestNegotiation']);
    Route::post('/orders/{id}/accept', [OrderController::class, 'acceptOrder']);
    Route::post('/orders/{id}/confirm-location', [OrderController::class, 'confirmLocationReceived']);
    Route::post('/orders/{id}/diagnose', [OrderController::class, 'submitDiagnosis']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancelOrder']);
    Route::post('/orders/{id}/negotiate', [OrderController::class, 'requestNegotiation']);
    Route::post('/orders/{id}/pay', [OrderController::class, 'completePayment']); 
    Route::post('/orders/{id}/verify-payment', [OrderController::class, 'verifyPayment']); 
    Route::post('/orders/{id}/mark-unpaid', [OrderController::class, 'markAsUnpaidDebt']);
    Route::post('/orders/{id}/resolve-debt', [OrderController::class, 'resolveDebt']);
    Route::get('/user/debt-status', [OrderController::class, 'checkUserDebtStatus']);
    Route::get('/admin/users', [UserManagementController::class, 'index']);
    Route::get('/admin/users/{id}', [UserManagementController::class, 'show']);
    Route::post('/admin/users', [UserManagementController::class, 'store']);
    Route::post('/admin/users/{id}', [UserManagementController::class, 'update']);
    Route::delete('/admin/users/{id}', [UserManagementController::class, 'destroy']); 
});