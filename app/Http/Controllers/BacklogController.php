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
            ->with(['assignedUser', 'labels'])
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
        $this->authorize('update', $project);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'nullable|in:story,task,bug,epic',
            'priority' => 'nullable|in:low,medium,high,critical',
            'story_points' => 'nullable|integer|min:0',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $maxPosition = $project->tasks()
            ->whereNull('sprint_id')
            ->max('position') ?? -1;

        $task = Task::create([
            'project_id' => $project->id,
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
        $this->authorize('update', $project);

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
        ]);

        $task->update($validated);
        $task->load(['assignedUser', 'labels']);

        return redirect()->route('projects.backlog.index', $project->id);
    }

    /**
     * Remove a task from the backlog.
     */
    public function destroy(Project $project, Task $task)
    {
        $this->authorize('update', $project);

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
        $this->authorize('update', $project);

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
        $this->authorize('update', $project);

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
        $this->authorize('update', $project);

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
}

