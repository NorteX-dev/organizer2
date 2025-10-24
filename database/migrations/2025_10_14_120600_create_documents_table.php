<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	public function up(): void
	{
		Schema::create("documents", function (Blueprint $table) {
			$table->id();
			$table->foreignId("project_id")->constrained()->cascadeOnDelete();
			$table->foreignId("created_by")->constrained("users")->cascadeOnDelete();
			$table->string("title");
			$table->longText("content"); // markdown
			$table->integer("position")->default(0);
			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists("documents");
	}
};
