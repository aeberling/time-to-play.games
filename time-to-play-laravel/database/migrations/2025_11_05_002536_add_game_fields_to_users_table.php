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
            $table->string('username')->unique()->nullable()->after('email');
            $table->string('display_name')->after('username');
            $table->string('avatar_url')->nullable()->after('display_name');
            $table->boolean('is_guest')->default(true)->after('avatar_url');
            $table->string('guest_token')->unique()->nullable()->after('is_guest');
            $table->string('theme_id')->default('ocean-breeze')->after('guest_token');
            $table->timestamp('last_seen_at')->nullable()->after('remember_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username',
                'display_name',
                'avatar_url',
                'is_guest',
                'guest_token',
                'theme_id',
                'last_seen_at',
            ]);
        });
    }
};
