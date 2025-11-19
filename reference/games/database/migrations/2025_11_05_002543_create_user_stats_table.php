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
        Schema::create('user_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // War stats
            $table->integer('war_games_played')->default(0);
            $table->integer('war_games_won')->default(0);
            $table->integer('war_games_lost')->default(0);
            $table->float('war_win_rate')->default(0);
            $table->integer('war_elo')->default(1200);

            // Swoop stats
            $table->integer('swoop_games_played')->default(0);
            $table->integer('swoop_games_won')->default(0);
            $table->integer('swoop_games_lost')->default(0);
            $table->integer('swoop_elo')->default(1200);

            // Oh Hell stats
            $table->integer('oh_hell_games_played')->default(0);
            $table->integer('oh_hell_games_won')->default(0);
            $table->integer('oh_hell_games_lost')->default(0);
            $table->integer('oh_hell_elo')->default(1200);

            // Overall stats
            $table->integer('total_games_played')->default(0);
            $table->integer('total_games_won')->default(0);
            $table->integer('longest_win_streak')->default(0);
            $table->integer('current_win_streak')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_stats');
    }
};
