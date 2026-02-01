<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Padel Admin',
            'email' => 'simorejogang3@gmail.com',
            'phone_number' => '085198342110',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        User::factory()->create([
            'name' => 'Padel User',
            'email' => 'suprazr535@gmail.com',
            'phone_number' => '085198342115',
            'password' => Hash::make('user123'),
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        User::factory()->create([
            'name' => 'User Dimas',
            'email' => 'dimasrosadibaru@gmail.com',
            'phone_number' => '085198342115',
            'password' => Hash::make('user1234'),
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $this->call([
            PadelCourtSeeder::class,
            VoucherSeeder::class,
        ]);
    }
}