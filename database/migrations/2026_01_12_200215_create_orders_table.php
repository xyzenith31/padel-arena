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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Pemilik kendaraan
            $table->foreignId('technician_id')->nullable()->constrained('users')->onDelete('set null'); // Teknisi yang ambil

            // Info Kendaraan
            $table->string('vehicle_manufacturer'); // Contoh: Honda, Yamaha
            $table->string('plate_number');
            $table->string('damage_type'); // mogok, pecah_ban, dll
            $table->string('custom_damage')->nullable(); // Jika user pilih 'lainnya'
            $table->text('damage_description'); // Penjelasan kenapa terjadi
            $table->enum('service_type', ['call_technician', 'visit_workshop']); // Panggil atau Datang

            // Status Workflow
            $table->enum('status', [
                'pending',              // Order masuk, belum diambil teknisi
                'accepted',             // Teknisi ambil, OTW minta sharelock
                'location_received',    // Teknisi klik tombol "sudah terima lokasi"
                'diagnosing',           // Teknisi sampai, cek kendaraan
                'repairing',            // Sedang diperbaiki (fixable onsite)
                'towing',               // Harus dibawa ke bengkel
                'waiting_payment',      // Menunggu user bayar/jaminan
                'completed',            // Selesai
                'cancelled'             // Batal
            ])->default('pending');

            // Logic Reparasi
            $table->boolean('is_fixable_onsite')->nullable(); // True = di tempat, False = derek
            $table->decimal('towing_cost', 12, 2)->default(0); // Biaya derek jika ada

            // Pembayaran
            $table->enum('payment_method', ['transfer', 'cod', 'guarantee_ktp'])->nullable();
            $table->decimal('total_cost', 12, 2)->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
