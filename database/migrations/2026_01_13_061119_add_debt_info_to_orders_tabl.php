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
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('payment_status', ['pending', 'paid', 'unpaid_debt'])->default('pending'); 
            $table->string('ktp_photo_path')->nullable(); 
            $table->foreignId('office_id')->nullable()->constrained('offices')->nullOnDelete(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['office_id']);
            $table->dropColumn(['payment_status', 'ktp_photo_path', 'office_id']);
        });
    }
};
