<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->integer('discount_percentage');
            $table->enum('type', ['all', 'session', 'custom'])->default('all'); 
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('voucher_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('voucher_id')->constrained('vouchers')->cascadeOnDelete();
            $table->foreignUuid('booking_id')
                  ->nullable()
                  ->constrained('bookings')
                  ->onDelete('set null'); 
            $table->timestamp('used_at')->useCurrent();
        });
        
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'discount_amount')) {
                $table->decimal('discount_amount', 12, 2)->default(0)->after('total_price');
                $table->decimal('final_price', 12, 2)->default(0)->after('discount_amount');
                $table->string('voucher_code')->nullable()->after('final_price');
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voucher_usages');
        Schema::dropIfExists('vouchers');
        
        if (Schema::hasTable('bookings')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropColumn(['discount_amount', 'final_price', 'voucher_code']);
            });
        }
    }
};