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
        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(50) NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        //
    }
};
