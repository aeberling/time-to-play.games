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
        Schema::create('game_players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('player_index'); // 0, 1, 2, etc.
            $table->boolean('is_ready')->default(false);
            $table->boolean('is_connected')->default(false);
            $table->timestamp('last_connected_at')->nullable();
            $table->integer('placement')->nullable(); // 1st, 2nd, 3rd place at end of game
            $table->integer('score')->nullable(); // Final score for this player
            $table->timestamps();

            // Unique constraints
            $table->unique(['game_id', 'user_id']);
            $table->unique(['game_id', 'player_index']);

            // Indexes
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_players');
    }
};
