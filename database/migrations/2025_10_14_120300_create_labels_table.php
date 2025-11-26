<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create("labels", function (Blueprint $table) {
            $table->id();
            $table->foreignId("project_id")->constrained()->cascadeOnDelete();
            $table->string("name");
            $table->string("color", 7)->default("#3b82f6");
            $table->timestamps();
        });

        Schema::create("task_label", function (Blueprint $table) {
            $table->foreignId("task_id")->constrained()->cascadeOnDelete();
            $table->foreignId("label_id")->constrained()->cascadeOnDelete();
            $table->primary(["task_id", "label_id"]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("task_label");
        Schema::dropIfExists("labels");
    }
};
