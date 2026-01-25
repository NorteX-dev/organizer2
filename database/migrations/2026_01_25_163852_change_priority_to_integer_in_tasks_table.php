<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'tasks_priority_check'
                ) THEN
                    ALTER TABLE tasks DROP CONSTRAINT tasks_priority_check;
                END IF;
            END $$;
        ");

        DB::statement("ALTER TABLE tasks ALTER COLUMN priority DROP DEFAULT");

        DB::statement("ALTER TABLE tasks ALTER COLUMN priority TYPE VARCHAR(20) USING priority::text");

        DB::statement("UPDATE tasks SET priority = CASE 
            WHEN priority = 'low' THEN '3'
            WHEN priority = 'medium' THEN '5'
            WHEN priority = 'high' THEN '7'
            WHEN priority = 'critical' THEN '10'
            ELSE '5'
        END");

        DB::statement("ALTER TABLE tasks ALTER COLUMN priority TYPE INTEGER USING priority::integer");

        DB::statement("ALTER TABLE tasks ALTER COLUMN priority SET DEFAULT 5");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE tasks ALTER COLUMN priority TYPE VARCHAR(20) USING priority::text");

        DB::statement("UPDATE tasks SET priority = CASE 
            WHEN priority::integer <= 3 THEN 'low'
            WHEN priority::integer <= 5 THEN 'medium'
            WHEN priority::integer <= 7 THEN 'high'
            WHEN priority::integer >= 8 THEN 'critical'
            ELSE 'medium'
        END");

        DB::statement("DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tasks_priority_enum') THEN
                CREATE TYPE tasks_priority_enum AS ENUM ('low', 'medium', 'high', 'critical');
            END IF;
        END $$;");

        DB::statement(
            "ALTER TABLE tasks ALTER COLUMN priority TYPE tasks_priority_enum USING priority::tasks_priority_enum",
        );
        DB::statement("ALTER TABLE tasks ALTER COLUMN priority SET DEFAULT 'medium'");
    }
};
