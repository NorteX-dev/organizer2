<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BacklogController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display the product backlog for a project.
     */
    public function index(Project $project)
    {
        $this->authorize('view', $project);

        $tasks = $project->tasks()
            ->whereNull('sprint_id')
            ->whereNull('parent_task_id')
            ->with(['assignedUser', 'labels', 'subTasks.assignedUser', 'subTasks.labels'])
            ->orderBy('position')
            ->orderBy('created_at')
            ->get();

        $team = $project->team;
        $users = $team ? $team->users : collect();

        return Inertia::render('projects/[id]/backlog', [
            'project' => $project,
            'tasks' => $tasks,
            'users' => $users,
        ]);
    }

    /**
     * Store a new task in the backlog.
     */
    public function store(Request $request, Project $project)
    {
        $this->authorize('manageBacklog', $project);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'nullable|in:story,task,bug,epic',
            'priority' => 'nullable|in:low,medium,high,critical',
            'story_points' => 'nullable|integer|min:0',
            'assigned_to' => 'nullable|exists:users,id',
            'parent_task_id' => 'nullable|exists:tasks,id',
        ]);

        if (isset($validated['parent_task_id'])) {
            $parentTask = Task::findOrFail($validated['parent_task_id']);
            if ($parentTask->project_id !== $project->id || $parentTask->sprint_id !== null) {
                return back()->withErrors(['error' => 'Parent task must belong to the same project and be in backlog']);
            }
            if ($parentTask->type === 'task' || $parentTask->type === 'bug') {
                return back()->withErrors(['error' => 'Only epic and story tasks can have subtasks']);
            }
            if ($validated['type'] === 'epic') {
                return back()->withErrors(['error' => 'Epic cannot be a subtask']);
            }
        }

        $maxPosition = $project->tasks()
            ->whereNull('sprint_id')
            ->max('position') ?? -1;

        $task = Task::create([
            'project_id' => $project->id,
            'parent_task_id' => $validated['parent_task_id'] ?? null,
            'sprint_id' => null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'] ?? 'task',
            'status' => 'Backlog',
            'priority' => $validated['priority'] ?? 'medium',
            'story_points' => $validated['story_points'] ?? null,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'position' => $maxPosition + 1,
        ]);

        $task->load(['assignedUser', 'labels']);

        return redirect()->route('projects.backlog.index', $project->id);
    }

    /**
     * Update a task in the backlog.
     */
    public function update(Request $request, Project $project, Task $task)
    {
        $this->authorize('manageBacklog', $project);

        if ($task->project_id !== $project->id || $task->sprint_id !== null) {
            return redirect()->route('projects.backlog.index', $project->id)
                ->withErrors(['error' => 'Task does not belong to this backlog']);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|in:story,task,bug,epic',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'story_points' => 'nullable|integer|min:0',
            'assigned_to' => 'nullable|exists:users,id',
            'parent_task_id' => 'nullable|exists:tasks,id',
        ]);

        if (isset($validated['parent_task_id'])) {
            $parentTask = Task::findOrFail($validated['parent_task_id']);
            if ($parentTask->project_id !== $project->id || $parentTask->sprint_id !== null) {
                return back()->withErrors(['error' => 'Parent task must belong to the same project and be in backlog']);
            }
            if ($parentTask->type === 'task' || $parentTask->type === 'bug') {
                return back()->withErrors(['error' => 'Only epic and story tasks can have subtasks']);
            }
            if (isset($validated['type']) && $validated['type'] === 'epic') {
                return back()->withErrors(['error' => 'Epic cannot be a subtask']);
            }
        }

        $task->update($validated);
        $task->load(['assignedUser', 'labels']);

        return redirect()->route('projects.backlog.index', $project->id);
    }

    /**
     * Remove a task from the backlog.
     */
    public function destroy(Project $project, Task $task)
    {
        $this->authorize('manageBacklog', $project);

        if ($task->project_id !== $project->id || $task->sprint_id !== null) {
            return redirect()->route('projects.backlog.index', $project->id)
                ->withErrors(['error' => 'Task does not belong to this backlog']);
        }

        $task->delete();

        return redirect()->route('projects.backlog.index', $project->id);
    }

    /**
     * Reorder tasks in the backlog.
     */
    public function reorder(Request $request, Project $project)
    {
        $this->authorize('manageBacklog', $project);

        $validated = $request->validate([
            'tasks' => 'required|array',
            'tasks.*.id' => 'required|exists:tasks,id',
            'tasks.*.position' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($project, $validated) {
            foreach ($validated['tasks'] as $taskData) {
                $task = Task::find($taskData['id']);

                if ($task && $task->project_id === $project->id && $task->sprint_id === null) {
                    $task->update([
                        'position' => $taskData['position'],
                    ]);
                }
            }
        });

        return redirect()->route('projects.backlog.index', $project->id);
    }

    /**
     * Move task up in the backlog order.
     */
    public function moveUp(Project $project, Task $task)
    {
        $this->authorize('manageBacklog', $project);

        if ($task->project_id !== $project->id || $task->sprint_id !== null) {
            return back()->withErrors(['error' => 'Task does not belong to this backlog']);
        }

        $previousTask = $project->tasks()
            ->whereNull('sprint_id')
            ->where('position', '<', $task->position)
            ->orderBy('position', 'desc')
            ->first();

        if ($previousTask) {
            $tempPosition = $task->position;
            $task->update(['position' => $previousTask->position]);
            $previousTask->update(['position' => $tempPosition]);
        }

        return back();
    }

    /**
     * Move task down in the backlog order.
     */
    public function moveDown(Project $project, Task $task)
    {
        $this->authorize('manageBacklog', $project);

        if ($task->project_id !== $project->id || $task->sprint_id !== null) {
            return back()->withErrors(['error' => 'Task does not belong to this backlog']);
        }

        $nextTask = $project->tasks()
            ->whereNull('sprint_id')
            ->where('position', '>', $task->position)
            ->orderBy('position', 'asc')
            ->first();

        if ($nextTask) {
            $tempPosition = $task->position;
            $task->update(['position' => $nextTask->position]);
            $nextTask->update(['position' => $tempPosition]);
        }

        return back();
    }

    /**
     * Create subtasks for a parent task.
     */
    public function createSubtasks(Request $request, Project $project, Task $task)
    {
        $this->authorize('manageBacklog', $project);

        if ($task->project_id !== $project->id || $task->sprint_id !== null) {
            return back()->withErrors(['error' => 'Task does not belong to this backlog']);
        }

        if ($task->type !== 'epic' && $task->type !== 'story') {
            return back()->withErrors(['error' => 'Only epic and story tasks can have subtasks']);
        }

        $validated = $request->validate([
            'subtasks' => 'required|array|min:1',
            'subtasks.*.title' => 'required|string|max:255',
            'subtasks.*.description' => 'nullable|string',
            'subtasks.*.type' => 'nullable|in:story,task,bug',
            'subtasks.*.priority' => 'nullable|in:low,medium,high,critical',
            'subtasks.*.story_points' => 'nullable|integer|min:0',
            'subtasks.*.assigned_to' => 'nullable|exists:users,id',
        ]);

        DB::transaction(function () use ($project, $task, $validated) {
            $maxPosition = $project->tasks()
                ->whereNull('sprint_id')
                ->whereNull('parent_task_id')
                ->max('position') ?? -1;

            foreach ($validated['subtasks'] as $index => $subtaskData) {
                Task::create([
                    'project_id' => $project->id,
                    'parent_task_id' => $task->id,
                    'sprint_id' => null,
                    'title' => $subtaskData['title'],
                    'description' => $subtaskData['description'] ?? null,
                    'type' => $subtaskData['type'] ?? 'task',
                    'status' => 'Backlog',
                    'priority' => $subtaskData['priority'] ?? 'medium',
                    'story_points' => $subtaskData['story_points'] ?? null,
                    'assigned_to' => $subtaskData['assigned_to'] ?? null,
                    'position' => $maxPosition + $index + 1,
                ]);
            }
        });

        return redirect()->route('projects.backlog.index', $project->id);
    }
}

