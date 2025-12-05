<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('watchface_files', function (Blueprint $table) {
            $table->string('wear_os_version')->nullable()->after('max_sdk');
        });
    }

    public function down(): void
    {
        Schema::table('watchface_files', function (Blueprint $table) {
            $table->dropColumn('wear_os_version');
        });
    }
};
