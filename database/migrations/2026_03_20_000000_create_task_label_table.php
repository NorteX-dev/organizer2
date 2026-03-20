<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create("task_label", function (Blueprint $table) {
            $table->id();
            $table->foreignId("task_id")->constrained()->onDelete("cascade");
            $table->foreignId("label_id")->constrained()->onDelete("cascade");
            $table->unique(["task_id", "label_id"]);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("task_label");
    }
};
