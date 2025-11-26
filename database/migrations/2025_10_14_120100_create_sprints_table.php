<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create("sprints", function (Blueprint $table) {
            $table->id();
            $table->foreignId("project_id")->constrained()->cascadeOnDelete();
            $table->string("name");
            $table->text("goal")->nullable();
            $table->date("start_date");
            $table->date("end_date");
            $table->enum("status", ["planning", "active", "completed"])->default("planning");
            $table->integer("planned_points")->default(0);
            $table->integer("completed_points")->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("sprints");
    }
};
