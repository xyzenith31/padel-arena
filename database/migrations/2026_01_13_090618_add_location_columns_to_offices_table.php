<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('offices', function (Blueprint $table) {
            $table->string('province')->after('name')->nullable();
            $table->string('city')->after('province')->nullable();
            $table->string('postal_code')->after('city')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('offices', function (Blueprint $table) {
            $table->dropColumn(['province', 'city', 'postal_code']);
        });
    }
};
