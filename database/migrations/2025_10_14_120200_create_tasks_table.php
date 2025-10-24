<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	public function up(): void
	{
		Schema::create("tasks", function (Blueprint $table) {
			$table->id();
			$table->foreignId("project_id")->constrained()->cascadeOnDelete();
			$table->foreignId("sprint_id")->nullable()->constrained()->nullOnDelete();
			$table->foreignId("assigned_to")->nullable()->constrained("users")->nullOnDelete();
			$table->string("title");
			$table->text("description")->nullable();
			$table->enum("type", ["story", "task", "bug", "epic"])->default("task");
			$table->enum("status", ["backlog", "todo", "in_progress", "review", "done"])->default("backlog");
			$table->enum("priority", ["low", "medium", "high", "critical"])->default("medium");
			$table->integer("story_points")->nullable();
			$table->integer("position")->default(0); // dla drag-and-drop
			$table->string("github_issue_number")->nullable();
			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists("tasks");
	}
};
