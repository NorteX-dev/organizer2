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
            Schema::rename("retrospective_votes", "retrospective_votes_old");

            Schema::create("retrospective_votes", function (Blueprint $table) {
                $table->id();
                $table->foreignId("retrospective_id")->constrained()->cascadeOnDelete();
                $table->foreignId("user_id")->constrained()->cascadeOnDelete();
                $table->enum("vote_type", ["went_well", "went_wrong", "to_improve"]);
                $table->boolean("upvote")->default(true);
                $table->unique(["retrospective_id", "user_id", "vote_type"], "retrospective_votes_unique");
                $table->timestamps();
            });

            DB::statement("
                INSERT INTO retrospective_votes (retrospective_id, user_id, vote_type, upvote, created_at, updated_at)
                SELECT retrospective_id, user_id, vote_type, upvote, created_at, updated_at
                FROM retrospective_votes_old
            ");

            Schema::drop("retrospective_votes_old");
        } else {
            Schema::table("retrospective_votes", function (Blueprint $table) {
                $table->dropPrimary(["retrospective_id", "user_id", "vote_type"]);
            });

            Schema::table("retrospective_votes", function (Blueprint $table) {
                $table->id()->first();
                $table->unique(["retrospective_id", "user_id", "vote_type"], "retrospective_votes_unique");
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === "sqlite") {
            Schema::rename("retrospective_votes", "retrospective_votes_old");

            Schema::create("retrospective_votes", function (Blueprint $table) {
                $table->foreignId("retrospective_id")->constrained()->cascadeOnDelete();
                $table->foreignId("user_id")->constrained()->cascadeOnDelete();
                $table->enum("vote_type", ["went_well", "went_wrong", "to_improve"]);
                $table->boolean("upvote")->default(true);
                $table->primary(["retrospective_id", "user_id", "vote_type"]);
                $table->timestamps();
            });

            DB::statement("
                INSERT INTO retrospective_votes (retrospective_id, user_id, vote_type, upvote, created_at, updated_at)
                SELECT retrospective_id, user_id, vote_type, upvote, created_at, updated_at
                FROM retrospective_votes_old
            ");

            Schema::drop("retrospective_votes_old");
        } else {
            Schema::table("retrospective_votes", function (Blueprint $table) {
                $table->dropUnique("retrospective_votes_unique");
                $table->dropColumn("id");
                $table->primary(["retrospective_id", "user_id", "vote_type"]);
            });
        }
    }
};
