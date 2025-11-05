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
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->enum('game_type', ['WAR', 'SWOOP', 'OH_HELL']);
            $table->enum('status', ['WAITING', 'READY', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'])
                  ->default('WAITING');
            $table->integer('max_players')->default(2);
            $table->integer('current_turn')->default(0);
            $table->boolean('is_private')->default(false);
            $table->json('timer_config')->nullable();
            $table->json('timer_state')->nullable();
            $table->json('state_snapshot')->nullable(); // Final state after game ends
            $table->foreignId('winner_id')->nullable()->constrained('users');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index('status');
            $table->index('game_type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
