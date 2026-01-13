<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class RegionController extends Controller
{
    public function provinces()
    {
        $provinces = Cache::remember('provinces', 60 * 24, function () {
            $response = Http::get('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json');
            return $response->json();
        });

        return response()->json($provinces);
    }

    public function cities($provinceId)
    {
        $cities = Cache::remember("cities_{$provinceId}", 60 * 24, function () use ($provinceId) {
            $response = Http::get("https://emsifa.github.io/api-wilayah-indonesia/api/regencies/{$provinceId}.json");
            return $response->json();
        });

        return response()->json($cities);
    }
}