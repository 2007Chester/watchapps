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
        Schema::table('watchfaces', function (Blueprint $table) {
            $table->dateTime('discount_start_at')->nullable()->after('discount_end_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('watchfaces', function (Blueprint $table) {
            $table->dropColumn('discount_start_at');
        });
    }
};
