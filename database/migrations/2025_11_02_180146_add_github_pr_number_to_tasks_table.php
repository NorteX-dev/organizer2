<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table("tasks", function (Blueprint $table) {
            $table->string("github_pr_number")->nullable()->after("github_issue_number");
        });
    }

    public function down(): void
    {
        Schema::table("tasks", function (Blueprint $table) {
            $table->dropColumn("github_pr_number");
        });
    }
};
