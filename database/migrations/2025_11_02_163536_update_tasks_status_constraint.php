<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver !== "sqlite") {
            DB::statement("ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check");
            DB::statement(
                "ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('Planned', 'Backlog', 'Active', 'Completed'))",
            );
        }

        DB::statement("UPDATE tasks SET status = CASE 
			WHEN status = 'backlog' THEN 'Backlog'
			WHEN status = 'todo' THEN 'Planned'
			WHEN status = 'in_progress' THEN 'Active'
			WHEN status = 'review' THEN 'Active'
			WHEN status = 'done' THEN 'Completed'
			ELSE 'Backlog'
		END WHERE status NOT IN ('Planned', 'Backlog', 'Active', 'Completed')");
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver !== "sqlite") {
            DB::statement("ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check");
            DB::statement(
                "ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'done'))",
            );
        }

        DB::statement("UPDATE tasks SET status = CASE 
			WHEN status = 'Backlog' THEN 'backlog'
			WHEN status = 'Planned' THEN 'todo'
			WHEN status = 'Active' THEN 'in_progress'
			WHEN status = 'Completed' THEN 'done'
			ELSE 'backlog'
		END WHERE status NOT IN ('backlog', 'todo', 'in_progress', 'review', 'done')");
    }
};
