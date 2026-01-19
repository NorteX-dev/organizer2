<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\LogsActivity;
use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SprintController extends Controller
{
    use AuthorizesRequests, LogsActivity;

    /**
     * Display a listing of the resource.
     */
    public function index(Project $project)
    {
        $sprints = Sprint::where("project_id", $project->id)->get();
        return Inertia::render("projects/[id]/sprints", ["project" => $project, "sprints" => $sprints]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Project $project)
    {
        $this->authorize("create", Sprint::class);

        $backlogTasks = $project
            ->tasks()
            ->whereNull("sprint_id")
            ->whereNull("sprint_backlog_id")
            ->with(["assignedUser", "labels"])
            ->orderBy("position")
            ->orderBy("created_at")
            ->get();

        return Inertia::render("projects/[id]/sprints/create", [
            "project" => $project,
            "backlogTasks" => $backlogTasks,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Project $project)
    {
        $this->authorize("create", Sprint::class);
        $fields = $request->validate([
            "name" => "required|string|max:255",
            "goal" => "nullable|string",
            "start_date" => "required|date",
            "end_date" => "required|date|after_or_equal:start_date",
            "planned_points" => "nullable|integer",
            "task_ids" => "nullable|array",
            "task_ids.*" => "exists:tasks,id",
        ]);

        $taskIds = $fields["task_ids"] ?? [];
        unset($fields["task_ids"]);

        $fields["project_id"] = $project->id;
        $fields["status"] = "planning";
        $sprint = Sprint::create($fields);

        if (!empty($taskIds)) {
            $tasks = Task::whereIn("id", $taskIds)
                ->where("project_id", $project->id)
                ->whereNull("sprint_id")
                ->whereNull("sprint_backlog_id")
                ->get();

            if ($tasks->count() > 0) {
                DB::transaction(function () use ($tasks, $sprint) {
                    $maxPosition = $sprint->tasks()->where("status", "Planned")->max("position") ?? -1;

                    foreach ($tasks as $index => $task) {
                        $task->update([
                            "sprint_id" => $sprint->id,
                            "status" => "Planned",
                            "position" => $maxPosition + $index + 1,
                        ]);
                    }
                });
            }
        }

        $sprint->load("tasks");
        $this->logActivity($project, "sprint.created", $sprint, [
            "name" => $sprint->name,
            "start_date" => $sprint->start_date->toDateString(),
            "end_date" => $sprint->end_date->toDateString(),
            "tasks_count" => $sprint->tasks->count(),
        ]);

        return redirect()->route("projects.sprints.index", $project->id);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project, Sprint $sprint)
    {
        $this->authorize("view", $sprint);

        $project->load("githubSyncs");

        $tasks = $sprint
            ->tasks()
            ->whereNull("parent_task_id")
            ->with(["assignedUser", "labels", "subTasks.assignedUser", "subTasks.labels"])
            ->whereIn("status", ["Planned", "Active", "Completed"])
            ->orderBy("status")
            ->orderBy("position")
            ->get();

        $backlogTasks = $project
            ->tasks()
            ->whereNull("sprint_id")
            ->where("sprint_backlog_id", $sprint->id)
            ->whereNull("parent_task_id")
            ->with(["assignedUser", "labels", "subTasks.assignedUser", "subTasks.labels"])
            ->orderBy("position")
            ->orderBy("created_at")
            ->get();

        $hasRetrospective = $sprint->retrospective()->exists();

        return Inertia::render("projects/[id]/sprints/[sprintId]/tasks", [
            "project" => $project,
            "sprint" => $sprint,
            "tasks" => $tasks,
            "backlogTasks" => $backlogTasks,
            "hasRetrospective" => $hasRetrospective,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project, Sprint $sprint)
    {
        $this->authorize("update", $sprint);

        $backlogTasks = $project
            ->tasks()
            ->whereNull("sprint_id")
            ->where("sprint_backlog_id", $sprint->id)
            ->whereNull("parent_task_id")
            ->with(["assignedUser", "labels", "subTasks.assignedUser", "subTasks.labels"])
            ->orderBy("position")
            ->orderBy("created_at")
            ->get();

        return Inertia::render("projects/[id]/sprints/[sprintId]/edit", [
            "project" => $project,
            "sprint" => $sprint,
            "backlogTasks" => $backlogTasks,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project, Sprint $sprint)
    {
        $this->authorize("update", $sprint);
        $fields = $request->validate([
            "name" => "required|string|max:255",
            "goal" => "nullable|string",
            "start_date" => "required|date",
            "end_date" => "required|date|after_or_equal:start_date",
            "status" => "required|string",
            "planned_points" => "nullable|integer",
            "completed_points" => "nullable|integer",
        ]);

        $oldStatus = $sprint->status;
        $sprint->update($fields);

        $metadata = [];
        if (isset($fields["status"]) && $oldStatus !== $fields["status"]) {
            $metadata["status_changed"] = ["from" => $oldStatus, "to" => $fields["status"]];
        }
        if (!empty($fields)) {
            $metadata["updated_fields"] = array_keys($fields);
        }

        $this->logActivity(
            $project,
            "sprint.updated",
            $sprint,
            array_merge(
                [
                    "name" => $sprint->name,
                ],
                $metadata,
            ),
        );

        return redirect()->route("projects.sprints.index", $project->id);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project, Sprint $sprint)
    {
        $this->authorize("delete", $sprint);

        $sprintName = $sprint->name;
        $sprintId = $sprint->id;
        $sprint->delete();

        $this->logDeletedActivity($project, "sprint.deleted", Sprint::class, $sprintId, [
            "name" => $sprintName,
        ]);

        return redirect()->route("projects.sprints.index", $project->id);
    }
}
