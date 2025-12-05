<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('watchface_files', function (Blueprint $table) {
            $table->string('version')->nullable()->after('sort_order');
            $table->integer('min_sdk')->nullable()->after('version');
            $table->integer('target_sdk')->nullable()->after('min_sdk');
            $table->integer('max_sdk')->nullable()->after('target_sdk');
        });
    }

    public function down(): void
    {
        Schema::table('watchface_files', function (Blueprint $table) {
            $table->dropColumn(['version', 'min_sdk', 'target_sdk', 'max_sdk']);
        });
    }
};
