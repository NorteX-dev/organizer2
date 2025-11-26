<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table("team_user", function (Blueprint $table) {
            $table
                ->enum("role", ["product_owner", "scrum_master", "developer", "admin"])
                ->default("developer")
                ->after("user_id");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table("team_user", function (Blueprint $table) {
            $table->dropColumn("role");
        });
    }
};
