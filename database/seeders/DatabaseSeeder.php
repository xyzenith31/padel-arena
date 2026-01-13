<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
        ]);
        
        User::factory()->create([
            'name' => 'Teknisi Handal',
            'username' => 'teknisi1',
            'email' => 'teknisi@example.com',
            'password' => bcrypt('password'),
            'role' => 'teknisi',
        ]);
    }
}
