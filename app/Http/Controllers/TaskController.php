<?php

namespace App\Http\Controllers;

use App\Events\TaskCreated;
use App\Events\TaskDeleted;
use App\Events\TaskReordered;
use App\Events\TaskUpdated;
use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
	use AuthorizesRequests;

	public function index(Project $project, Sprint $sprint)
	{
		$this->authorize('view', $sprint);

		$tasks = $sprint->tasks()
			->whereNull('parent_task_id')
			->with(['assignedUser', 'labels', 'subTasks.assignedUser', 'subTasks.labels'])
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
			'status' => 'required|in:Planned,Active,Completed',
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

		event(new TaskCreated($sprint, $task));

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
			'status' => 'sometimes|in:Planned,Active,Completed',
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

		event(new TaskUpdated($sprint, $task));

		return redirect()->route('projects.sprints.show', [$project->id, $sprint->id]);
	}

	public function reorder(Request $request, Project $project, Sprint $sprint)
	{
		$this->authorize('update', $sprint);

		$validated = $request->validate([
			'tasks' => 'required|array',
			'tasks.*.id' => 'required|exists:tasks,id',
			'tasks.*.status' => 'required|in:Planned,Active,Completed',
			'tasks.*.position' => 'required|integer|min:0',
		]);

		$reorderedTasks = [];
		
		DB::transaction(function () use ($sprint, $validated, &$reorderedTasks) {
			foreach ($validated['tasks'] as $taskData) {
				$task = Task::find($taskData['id']);

				if ($task && $task->sprint_id === $sprint->id) {
					$task->update([
						'status' => $taskData['status'],
						'position' => $taskData['position'],
					]);
				}
			}

			$statuses = ['Planned', 'Active', 'Completed'];
			foreach ($statuses as $status) {
				$tasksInStatus = $sprint->tasks()
					->where('status', $status)
					->orderBy('position')
					->get();

				foreach ($tasksInStatus as $index => $task) {
					$task->update(['position' => $index]);
					$reorderedTasks[] = [
						'id' => $task->id,
						'status' => $task->status,
						'position' => $index,
					];
				}
			}
		});

		event(new TaskReordered($sprint, $reorderedTasks));

		return redirect()->route('projects.sprints.show', [$project->id, $sprint->id]);
	}

	public function addFromBacklog(Request $request, Project $project, Sprint $sprint)
	{
		$this->authorize('update', $sprint);

		$validated = $request->validate([
			'task_ids' => 'required|array',
			'task_ids.*' => 'required|exists:tasks,id',
			'include_subtasks' => 'nullable|boolean',
		]);

		$includeSubtasks = $validated['include_subtasks'] ?? false;

		$tasks = Task::whereIn('id', $validated['task_ids'])
			->where('project_id', $project->id)
			->whereNull('sprint_id')
			->whereNull('parent_task_id')
			->with('subTasks')
			->get();

		if ($tasks->count() !== count($validated['task_ids'])) {
			return back()->withErrors(['error' => 'Some tasks are not available in the backlog or belong to another project']);
		}

		$addedTasks = [];
		DB::transaction(function () use ($tasks, $sprint, $includeSubtasks, &$addedTasks) {
			$maxPosition = $sprint->tasks()
				->where('status', 'Planned')
				->max('position') ?? -1;

			$positionOffset = 0;

			foreach ($tasks as $task) {
				$task->update([
					'sprint_id' => $sprint->id,
					'status' => 'Planned',
					'position' => $maxPosition + $positionOffset + 1,
				]);
				$task->load(['assignedUser', 'labels']);
				$addedTasks[] = $task;
				$positionOffset++;

				if ($includeSubtasks && $task->subTasks) {
					foreach ($task->subTasks as $subtask) {
						$subtask->update([
							'sprint_id' => $sprint->id,
							'status' => 'Planned',
							'position' => $maxPosition + $positionOffset + 1,
						]);
						$positionOffset++;
					}
				}
			}
		});

		foreach ($addedTasks as $task) {
			event(new TaskCreated($sprint, $task));
		}

		return redirect()->route('projects.sprints.show', [$project->id, $sprint->id]);
	}

	public function moveToBacklog(Project $project, Sprint $sprint, Task $task)
	{
		$this->authorize('update', $sprint);

		if ($task->sprint_id !== $sprint->id || $task->project_id !== $project->id) {
			return back()->withErrors(['error' => 'Task does not belong to this sprint']);
		}

		$maxBacklogPosition = $project->tasks()
			->whereNull('sprint_id')
			->max('position') ?? -1;

		$taskId = $task->id;
		$task->update([
			'sprint_id' => null,
			'status' => 'Backlog',
			'position' => $maxBacklogPosition + 1,
		]);

		event(new TaskDeleted($sprint, $taskId));

		return redirect()->route('projects.sprints.show', [$project->id, $sprint->id]);
	}
}
