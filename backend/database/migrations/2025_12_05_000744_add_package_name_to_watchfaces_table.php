<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('watchfaces', function (Blueprint $table) {
            $table->string('package_name')->nullable()->after('wear_os_version');
        });
    }

    public function down(): void
    {
        Schema::table('watchfaces', function (Blueprint $table) {
            $table->dropColumn('package_name');
        });
    }
};
