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
        Schema::create('watchface_rating_replies', function (Blueprint $table) {
            $table->id();

            $table->foreignId('rating_id')
                ->constrained('watchface_ratings')
                ->cascadeOnDelete();

            $table->foreignId('developer_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->text('reply');

            $table->timestamps();

            // Один разработчик может оставить только один ответ на отзыв
            $table->unique(['rating_id', 'developer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('watchface_rating_replies');
    }
};
