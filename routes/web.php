<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/', function () {
    return view('app');
});

require __DIR__.'/auth.php';

Route::middleware('auth:sanctum')->get('/api/user', function (Request $request) {
    return $request->user();
});

Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
