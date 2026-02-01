<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PadelCourt;

class PadelCourtSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $names = [
            'Jungle Padel Surabaya', 'Graha Padel Club', 'Playground Padel Club', 'Homeground Padel Premiere', 'Uno Padel Samator',
            'Pro Padel Surabaya', 'Central Padel', 'Nano Padel Surabaya', 'Hyde Padel', 'Margomulyo Sport Center',
            'Padel Up Surabaya', 'Sport Center Puncak Permai', 'Locahaus Padel', 'Padel Plavy Brawijaya', 'Padel la Sociedad',
        ];
        $days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
        $facilities_list = ["WiFi", "Parkir Mobil", "Parkir Motor", "Toilet", "Locker Room", "Kantin", "Sewa Raket", "Sewa Bola"];

        for ($i = 1; $i <= 15; $i++) {
            $randomName = $names[$i - 1];
            
            $operational_hours = [];
            foreach ($days as $day) {
                $operational_hours[] = [
                    'day' => $day,
                    'open' => '08:00',
                    'close' => '22:00',
                    'isOpen' => true
                ];
            }

            $random_facilities = array_values(array_intersect_key(
                $facilities_list, 
                array_flip((array) array_rand($facilities_list, rand(3, 5)))
            ));

            PadelCourt::create([
                'name' => $randomName,
                'description' => "Lapangan Padel kualitas internasional di Surabaya. Fasilitas lengkap dan cocok untuk semua level pemain.",
                'operational_hours' => $operational_hours, 
                'facilities' => $random_facilities,
                'price_per_hour' => rand(150, 350) * 1000,
                'price_per_day' => rand(1500, 3000) * 1000,
                'province_id' => '35',
                'province_name' => 'JAWA TIMUR',
                'city_id' => '3578',
                'city_name' => 'KOTA SURABAYA',
                'address' => 'Jl. Padel Sport No. ' . $i . ', Surabaya',
                'postal_code' => '6011' . rand(1, 9),
                'email' => 'admin' . $i . '@' . strtolower(str_replace(' ', '', $randomName)) . '.com',
                'phone' => '0812' . rand(10000000, 99999999),
                'avatar' => null,
                'images' => [],
            ]);
        }
    }
}