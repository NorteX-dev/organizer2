<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	public function up(): void
	{
		Schema::create("project_activities", function (Blueprint $table) {
			$table->id();
			$table->foreignId("project_id")->constrained()->cascadeOnDelete();
			$table->foreignId("user_id")->nullable()->constrained()->nullOnDelete();
			$table->string("action"); // np. "task_created", "sprint_completed"
			$table->morphs("subject"); // polimorficzna relacja do task/sprint/etc
			$table->json("metadata")->nullable();
			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists("project_activities");
	}
};
