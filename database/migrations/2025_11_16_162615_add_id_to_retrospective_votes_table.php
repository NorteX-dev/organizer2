<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === "sqlite") {
            return;
        }

        if (Schema::hasColumn("retrospective_votes", "id")) {
            return;
        }

        Schema::table("retrospective_votes", function (Blueprint $table) {
            $table->dropPrimary(["retrospective_id", "user_id", "vote_type"]);
        });

        Schema::table("retrospective_votes", function (Blueprint $table) {
            $table->id()->first();
        });

        Schema::table("retrospective_votes", function (Blueprint $table) {
            $table->unique(["retrospective_id", "user_id", "vote_type"], "retrospective_votes_unique");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table("retrospective_votes", function (Blueprint $table) {
            $table->dropUnique("retrospective_votes_unique");
            $table->dropColumn("id");
            $table->primary(["retrospective_id", "user_id", "vote_type"]);
        });
    }
};
