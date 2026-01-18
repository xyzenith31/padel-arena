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
            'name' => 'Moch Donny Indra Prayuda',
            'email' => 'mochdonnyindraprayuda@gmail.com',
            'phone_number' => '085198342115',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        User::factory()->create([
            'name' => 'Donny User',
            'email' => 'm.donnyindraprayuda@gmail.com',
            'phone_number' => '085194928331',
            'password' => Hash::make('user123'),
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $this->call([
            PadelCourtSeeder::class,
        ]);
    }
}