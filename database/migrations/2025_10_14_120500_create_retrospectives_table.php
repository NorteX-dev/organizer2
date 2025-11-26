<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create("retrospectives", function (Blueprint $table) {
            $table->id();
            $table->foreignId("sprint_id")->constrained()->cascadeOnDelete();
            $table->foreignId("created_by")->constrained("users")->cascadeOnDelete();
            $table->text("went_well")->nullable();
            $table->text("went_wrong")->nullable();
            $table->text("to_improve")->nullable();
            $table->timestamps();
        });

        Schema::create("retrospective_votes", function (Blueprint $table) {
            $table->foreignId("retrospective_id")->constrained()->cascadeOnDelete();
            $table->foreignId("user_id")->constrained()->cascadeOnDelete();
            $table->enum("vote_type", ["went_well", "went_wrong", "to_improve"]);
            $table->boolean("upvote")->default(true);
            $table->primary(["retrospective_id", "user_id", "vote_type"]);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("retrospective_votes");
        Schema::dropIfExists("retrospectives");
    }
};
