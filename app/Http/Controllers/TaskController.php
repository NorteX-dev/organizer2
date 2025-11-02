<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
	use AuthorizesRequests;

	public function index(Project $project, Sprint $sprint)
	{
		$this->authorize('view', $sprint);

		$tasks = $sprint->tasks()
			->with(['assignedUser', 'labels'])
			->orderBy('status')
			->orderBy('position')
			->get();

		return redirect()->route('projects.sprints.show', [$project->id, $sprint->id]);
	}

	public function store(Request $request, Project $project, Sprint $sprint)
	{
		$this->authorize('update', $sprint);

		$validated = $request->validate([
			'title' => 'required|string|max:255',
			'description' => 'nullable|string',
			'type' => 'nullable|in:story,task,bug,epic',
			'status' => 'required|in:Planned,Backlog,Active,Completed',
			'priority' => 'nullable|in:low,medium,high,critical',
			'story_points' => 'nullable|integer|min:0',
			'assigned_to' => 'nullable|exists:users,id',
			'github_issue_number' => 'nullable|string',
			'github_pr_number' => 'nullable|string',
		]);

		$maxPosition = $sprint->tasks()
			->where('status', $validated['status'])
			->max('position') ?? -1;

		$task = Task::create([
			'project_id' => $project->id,
			'sprint_id' => $sprint->id,
			'title' => $validated['title'],
			'description' => $validated['description'] ?? null,
			'type' => $validated['type'] ?? 'task',
			'status' => $validated['status'],
			'priority' => $validated['priority'] ?? 'medium',
			'story_points' => $validated['story_points'] ?? null,
			'assigned_to' => $validated['assigned_to'] ?? null,
			'position' => $maxPosition + 1,
			'github_issue_number' => $validated['github_issue_number'] ?? null,
			'github_pr_number' => $validated['github_pr_number'] ?? null,
		]);

		$task->load(['assignedUser', 'labels']);

		return redirect()->route('projects.sprints.show', [$project->id, $sprint->id]);
	}

	public function update(Request $request, Project $project, Sprint $sprint, Task $task)
	{
		$this->authorize('update', $sprint);

		if ($task->sprint_id !== $sprint->id || $task->project_id !== $project->id) {
			return redirect()->route('projects.sprints.show', [$project->id, $sprint->id])
				->withErrors(['error' => 'Task does not belong to this sprint']);
		}

		$validated = $request->validate([
			'title' => 'sometimes|string|max:255',
			'description' => 'nullable|string',
			'type' => 'sometimes|in:story,task,bug,epic',
			'status' => 'sometimes|in:Planned,Backlog,Active,Completed',
			'priority' => 'sometimes|in:low,medium,high,critical',
			'story_points' => 'nullable|integer|min:0',
			'assigned_to' => 'nullable|exists:users,id',
			'position' => 'sometimes|integer|min:0',
			'github_issue_number' => 'nullable|string',
			'github_pr_number' => 'nullable|string',
		]);

		$oldStatus = $task->status;
		$newStatus = $validated['status'] ?? $oldStatus;

		if (isset($validated['status']) && $oldStatus !== $newStatus) {
			DB::transaction(function () use ($task, $validated, $oldStatus, $newStatus, $sprint) {
				$task->update($validated);

				$tasksInOldStatus = $sprint->tasks()
					->where('status', $oldStatus)
					->where('id', '!=', $task->id)
					->orderBy('position')
					->get();

				foreach ($tasksInOldStatus as $index => $t) {
					$t->update(['position' => $index]);
				}

				if (!isset($validated['position'])) {
					$maxPosition = $sprint->tasks()
						->where('status', $newStatus)
						->where('id', '!=', $task->id)
						->max('position') ?? -1;

					$task->update(['position' => $maxPosition + 1]);
				}
			});
		} else {
			$task->update($validated);
		}

		$task->load(['assignedUser', 'labels']);

		return redirect()->route('projects.sprints.show', [$project->id, $sprint->id]);
	}

	public function reorder(Request $request, Project $project, Sprint $sprint)
	{
		$this->authorize('update', $sprint);

		$validated = $request->validate([
			'tasks' => 'required|array',
			'tasks.*.id' => 'required|exists:tasks,id',
			'tasks.*.status' => 'required|in:Planned,Backlog,Active,Completed',
			'tasks.*.position' => 'required|integer|min:0',
		]);

		DB::transaction(function () use ($sprint, $validated) {
			foreach ($validated['tasks'] as $taskData) {
				$task = Task::find($taskData['id']);

				if ($task && $task->sprint_id === $sprint->id) {
					$task->update([
						'status' => $taskData['status'],
						'position' => $taskData['position'],
					]);
				}
			}

			$statuses = ['Planned', 'Backlog', 'Active', 'Completed'];
			foreach ($statuses as $status) {
				$tasksInStatus = $sprint->tasks()
					->where('status', $status)
					->orderBy('position')
					->get();

				foreach ($tasksInStatus as $index => $task) {
					$task->update(['position' => $index]);
				}
			}
		});

		return redirect()->route('projects.sprints.show', [$project->id, $sprint->id]);
	}
}
