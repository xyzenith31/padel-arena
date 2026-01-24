<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Voucher;
use Illuminate\Support\Str;

class VoucherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = ['all', 'session', 'custom'];

        for ($i = 0; $i < 100; $i++) {
            do {
                $code = 'PADEL-' . strtoupper(Str::random(5));
            } while (Voucher::where('code', $code)->exists());

            Voucher::create([
                'code' => $code,
                'discount_percentage' => rand(1, 10) * 5, 
                'type' => $types[array_rand($types)],
                'is_active' => true,
            ]);
        }
    }
}