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
        Schema::create('watchface_ratings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('watchface_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Рейтинг от 1 до 5
            $table->tinyInteger('rating')
                ->unsigned();

            // Комментарий (опционально)
            $table->text('comment')->nullable();

            $table->string('ip', 45)->nullable();

            $table->timestamps();

            // Один пользователь может оставить только один отзыв на приложение
            $table->unique(['watchface_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('watchface_ratings');
    }
};
