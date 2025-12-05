<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('watchfaces', function (Blueprint $table) {
            $table->integer('min_sdk')->nullable()->after('version');
            $table->integer('target_sdk')->nullable()->after('min_sdk');
            $table->integer('max_sdk')->nullable()->after('target_sdk');
            $table->string('wear_os_version')->nullable()->after('max_sdk');
        });
    }

    public function down(): void
    {
        Schema::table('watchfaces', function (Blueprint $table) {
            $table->dropColumn(['min_sdk', 'target_sdk', 'max_sdk', 'wear_os_version']);
        });
    }
};
