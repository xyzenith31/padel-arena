<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('padel_courts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->json('operational_hours'); 
            $table->json('facilities'); 
            $table->decimal('price_per_hour', 12, 2);
            $table->decimal('price_per_day', 12, 2);
            $table->string('province_id'); 
            $table->string('province_name');
            $table->string('city_id');
            $table->string('city_name');
            $table->text('address');
            $table->string('postal_code');
            $table->string('email');
            $table->string('phone');
            $table->string('avatar')->nullable(); 
            $table->json('images')->nullable(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('padel_courts');
    }
};
