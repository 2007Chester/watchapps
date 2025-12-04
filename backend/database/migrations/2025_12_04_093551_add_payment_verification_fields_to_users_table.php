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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('contract_upload_id')->nullable()->after('payment_details');
            $table->boolean('payment_sent_for_approval')->default(false)->after('contract_upload_id');
            $table->boolean('payment_approved_by_admin')->default(false)->after('payment_sent_for_approval');
            
            $table->foreign('contract_upload_id')
                ->references('id')
                ->on('uploads')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['contract_upload_id']);
            $table->dropColumn(['contract_upload_id', 'payment_sent_for_approval', 'payment_approved_by_admin']);
        });
    }
};
