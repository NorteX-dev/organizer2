<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\LogsActivity;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BacklogController extends Controller
{
    use AuthorizesRequests, LogsActivity;

    public function index(Request $request, Project $project)
    {
        $this->authorize("viewBacklog", $project);

        $user = Auth::user();
        $team = $project->team;
        $canManageBacklog = $user->isAdmin() || ($team && $user->hasAnyRole($team, ["admin", "product_owner"]));

        $query = $project
            ->tasks()
            ->whereNull("sprint_id")
            ->whereNull("sprint_backlog_id")
            ->whereNull("parent_task_id")
            ->with(["assignedUser", "labels", "subTasks.assignedUser", "subTasks.labels"]);

        $search = $request->get("search", "");
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where("title", "like", "%" . $search . "%")->orWhere("description", "like", "%" . $search . "%");
            });
        }

        $type = $request->get("type", "all");
        if ($type && $type !== "all") {
            $query->where("type", $type);
        }

        $priority = $request->get("priority", "all");
        if ($priority && $priority !== "all") {
            $query->where("priority", (int) $priority);
        }

        $status = $request->get("status", "all");
        if ($status && $status !== "all") {
            $query->where("status", $status);
        }

        $perPage = (int) $request->get("per_page", 10);
        $tasks = $query->orderBy("position")->orderBy("created_at")->paginate($perPage)->withQueryString();

        $team = $project->team;
        $users = $team ? $team->users : collect();

        return Inertia::render("projects/[id]/backlog", [
            "project" => $project,
            "tasks" => $tasks,
            "users" => $users,
            "search" => $search,
            "type" => $type,
            "priority" => $priority,
            "status" => $status,
            "canManageBacklog" => $canManageBacklog,
            "isReadOnly" => !$canManageBacklog,
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $this->authorize("manageBacklog", $project);

        $validated = $request->validate([
            "title" => "required|string|max:255",
            "description" => "nullable|string",
            "type" => "nullable|in:story,task,bug,epic",
            "priority" => "nullable|integer|min:1|max:10",
            "story_points" => "nullable|integer|min:0",
            "assigned_to" => "nullable|exists:users,id",
            "parent_task_id" => "nullable|exists:tasks,id",
        ]);

        if (isset($validated["parent_task_id"])) {
            $parentTask = Task::findOrFail($validated["parent_task_id"]);
            if (
                $parentTask->project_id !== $project->id ||
                $parentTask->sprint_id !== null ||
                $parentTask->sprint_backlog_id !== null
            ) {
                return back()->withErrors([
                    "error" => "Parent task must belong to the same project and be in product backlog",
                ]);
            }
            if ($parentTask->type === "task" || $parentTask->type === "bug") {
                return back()->withErrors(["error" => "Only epic and story tasks can have subtasks"]);
            }
            if ($validated["type"] === "epic") {
                return back()->withErrors(["error" => "Epic cannot be a subtask"]);
            }
        }

        $maxPosition = $project->tasks()->whereNull("sprint_id")->whereNull("sprint_backlog_id")->max("position") ?? -1;

        $task = Task::create([
            "project_id" => $project->id,
            "parent_task_id" => $validated["parent_task_id"] ?? null,
            "sprint_id" => null,
            "sprint_backlog_id" => null,
            "title" => $validated["title"],
            "description" => $validated["description"] ?? null,
            "type" => $validated["type"] ?? "task",
            "status" => "Backlog",
            "priority" => $validated["priority"] ?? 5,
            "story_points" => $validated["story_points"] ?? null,
            "assigned_to" => $validated["assigned_to"] ?? null,
            "position" => $maxPosition + 1,
        ]);

        $task->load(["assignedUser", "labels"]);

        $this->logActivity($project, "task.created", $task, [
            "title" => $task->title,
            "in_backlog" => true,
        ]);

        return back();
    }

    public function update(Request $request, Project $project, Task $task)
    {
        $this->authorize("manageBacklog", $project);

        if ($task->project_id !== $project->id || $task->sprint_id !== null || $task->sprint_backlog_id !== null) {
            return redirect()
                ->route("projects.backlog.index", $project->id)
                ->withErrors(["error" => "Task does not belong to this product backlog"]);
        }

        $validated = $request->validate([
            "title" => "sometimes|string|max:255",
            "description" => "nullable|string",
            "type" => "sometimes|in:story,task,bug,epic",
            "priority" => "sometimes|integer|min:1|max:10",
            "story_points" => "nullable|integer|min:0",
            "assigned_to" => "nullable|exists:users,id",
            "parent_task_id" => "nullable|exists:tasks,id",
        ]);

        if (isset($validated["parent_task_id"])) {
            $parentTask = Task::findOrFail($validated["parent_task_id"]);
            if (
                $parentTask->project_id !== $project->id ||
                $parentTask->sprint_id !== null ||
                $parentTask->sprint_backlog_id !== null
            ) {
                return back()->withErrors([
                    "error" => "Parent task must belong to the same project and be in product backlog",
                ]);
            }
            if ($parentTask->type === "task" || $parentTask->type === "bug") {
                return back()->withErrors(["error" => "Only epic and story tasks can have subtasks"]);
            }
            if (isset($validated["type"]) && $validated["type"] === "epic") {
                return back()->withErrors(["error" => "Epic cannot be a subtask"]);
            }
        }

        $oldAssignedTo = $task->assigned_to;
        $task->update($validated);
        $task->load(["assignedUser", "labels"]);

        $metadata = [];
        if (isset($validated["assigned_to"]) && $oldAssignedTo !== $validated["assigned_to"]) {
            $metadata["assigned_changed"] = ["from" => $oldAssignedTo, "to" => $validated["assigned_to"]];
        }
        if (!empty($validated)) {
            $metadata["updated_fields"] = array_keys($validated);
        }

        $this->logActivity(
            $project,
            "task.updated",
            $task,
            array_merge(
                [
                    "title" => $task->title,
                    "in_backlog" => true,
                ],
                $metadata,
            ),
        );

        return back();
    }

    public function destroy(Project $project, Task $task)
    {
        $this->authorize("manageBacklog", $project);

        if ($task->project_id !== $project->id || $task->sprint_id !== null || $task->sprint_backlog_id !== null) {
            return redirect()
                ->route("projects.backlog.index", $project->id)
                ->withErrors(["error" => "Task does not belong to this product backlog"]);
        }

        $taskTitle = $task->title;
        $taskId = $task->id;
        $task->delete();

        $this->logDeletedActivity($project, "task.deleted", Task::class, $taskId, [
            "title" => $taskTitle,
            "in_backlog" => true,
        ]);

        return back();
    }

    public function reorder(Request $request, Project $project)
    {
        $this->authorize("manageBacklog", $project);

        $validated = $request->validate([
            "tasks" => "required|array",
            "tasks.*.id" => "required|exists:tasks,id",
            "tasks.*.position" => "required|integer|min:0",
        ]);

        DB::transaction(function () use ($project, $validated) {
            foreach ($validated["tasks"] as $taskData) {
                $task = Task::find($taskData["id"]);

                if (
                    $task &&
                    $task->project_id === $project->id &&
                    $task->sprint_id === null &&
                    $task->sprint_backlog_id === null
                ) {
                    $task->update([
                        "position" => $taskData["position"],
                    ]);
                }
            }
        });

        return back();
    }

    public function moveUp(Project $project, Task $task)
    {
        $this->authorize("manageBacklog", $project);

        if ($task->project_id !== $project->id || $task->sprint_id !== null) {
            return back()->withErrors(["error" => "Task does not belong to this backlog"]);
        }

        $previousTask = $project
            ->tasks()
            ->whereNull("sprint_id")
            ->whereNull("sprint_backlog_id")
            ->where("position", "<", $task->position)
            ->orderBy("position", "desc")
            ->first();

        if ($previousTask) {
            $tempPosition = $task->position;
            $task->update(["position" => $previousTask->position]);
            $previousTask->update(["position" => $tempPosition]);
        }

        return back();
    }

    public function moveDown(Project $project, Task $task)
    {
        $this->authorize("manageBacklog", $project);

        if ($task->project_id !== $project->id || $task->sprint_id !== null) {
            return back()->withErrors(["error" => "Task does not belong to this backlog"]);
        }

        $nextTask = $project
            ->tasks()
            ->whereNull("sprint_id")
            ->whereNull("sprint_backlog_id")
            ->where("position", ">", $task->position)
            ->orderBy("position", "asc")
            ->first();

        if ($nextTask) {
            $tempPosition = $task->position;
            $task->update(["position" => $nextTask->position]);
            $nextTask->update(["position" => $tempPosition]);
        }

        return back();
    }

    public function createSubtasks(Request $request, Project $project, Task $task)
    {
        $this->authorize("manageBacklog", $project);

        if ($task->project_id !== $project->id || $task->sprint_id !== null || $task->sprint_backlog_id !== null) {
            return back()->withErrors(["error" => "Task does not belong to this product backlog"]);
        }

        if ($task->type !== "epic" && $task->type !== "story") {
            return back()->withErrors(["error" => "Only epic and story tasks can have subtasks"]);
        }

        $validated = $request->validate([
            "subtasks" => "required|array|min:1",
            "subtasks.*.title" => "required|string|max:255",
            "subtasks.*.description" => "nullable|string",
            "subtasks.*.type" => "nullable|in:story,task,bug",
            "subtasks.*.priority" => "nullable|integer|min:1|max:10",
            "subtasks.*.story_points" => "nullable|integer|min:0",
            "subtasks.*.assigned_to" => "nullable|exists:users,id",
        ]);

        $createdSubtasks = [];
        DB::transaction(function () use ($project, $task, $validated, &$createdSubtasks) {
            $maxPosition =
                $project
                    ->tasks()
                    ->whereNull("sprint_id")
                    ->whereNull("sprint_backlog_id")
                    ->whereNull("parent_task_id")
                    ->max("position") ?? -1;

            foreach ($validated["subtasks"] as $index => $subtaskData) {
                $subtask = Task::create([
                    "project_id" => $project->id,
                    "parent_task_id" => $task->id,
                    "sprint_id" => null,
                    "sprint_backlog_id" => null,
                    "title" => $subtaskData["title"],
                    "description" => $subtaskData["description"] ?? null,
                    "type" => $subtaskData["type"] ?? "task",
                    "status" => "Backlog",
                    "priority" => $subtaskData["priority"] ?? "medium",
                    "story_points" => $subtaskData["story_points"] ?? null,
                    "assigned_to" => $subtaskData["assigned_to"] ?? null,
                    "position" => $maxPosition + $index + 1,
                ]);
                $createdSubtasks[] = $subtask;
            }
        });

        foreach ($createdSubtasks as $subtask) {
            $this->logActivity($project, "task.subtask_created", $subtask, [
                "title" => $subtask->title,
                "parent_task_id" => $task->id,
                "parent_task_title" => $task->title,
            ]);
        }

        return back();
    }
}
