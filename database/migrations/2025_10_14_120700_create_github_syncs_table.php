<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create("github_syncs", function (Blueprint $table) {
            $table->id();
            $table->foreignId("project_id")->constrained()->cascadeOnDelete();
            $table->enum("type", ["commits", "issues", "prs"]);
            $table->json("data");
            $table->timestamp("synced_at");
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("github_syncs");
    }
};
