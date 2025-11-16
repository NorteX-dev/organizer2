<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskCommentController extends Controller
{
	use AuthorizesRequests;

	public function index(Project $project, Task $task)
	{
		$this->authorize('view', $project);

		if ($task->project_id !== $project->id) {
			return response()->json(['error' => 'Task does not belong to this project'], 404);
		}

		$comments = $task->comments()
			->with('user')
			->orderBy('created_at', 'asc')
			->get();

		return response()->json($comments);
	}

	public function store(Request $request, Project $project, Task $task)
	{
		$this->authorize('view', $project);

		if ($task->project_id !== $project->id) {
			return response()->json(['error' => 'Task does not belong to this project'], 404);
		}

		$validated = $request->validate([
			'content' => 'required|string|max:5000',
		]);

		$comment = TaskComment::create([
			'task_id' => $task->id,
			'user_id' => Auth::id(),
			'content' => $validated['content'],
		]);

		$comment->load('user');

		return response()->json($comment, 201);
	}

	public function update(Request $request, Project $project, Task $task, TaskComment $comment)
	{
		$this->authorize('view', $project);

		if ($task->project_id !== $project->id) {
			return response()->json(['error' => 'Task does not belong to this project'], 404);
		}

		if ($comment->task_id !== $task->id) {
			return response()->json(['error' => 'Comment does not belong to this task'], 404);
		}

		if ($comment->user_id !== Auth::id()) {
			return response()->json(['error' => 'You can only edit your own comments'], 403);
		}

		$validated = $request->validate([
			'content' => 'required|string|max:5000',
		]);

		$comment->update($validated);
		$comment->load('user');

		return response()->json($comment);
	}

	public function destroy(Project $project, Task $task, TaskComment $comment)
	{
		$this->authorize('view', $project);

		if ($task->project_id !== $project->id) {
			return response()->json(['error' => 'Task does not belong to this project'], 404);
		}

		if ($comment->task_id !== $task->id) {
			return response()->json(['error' => 'Comment does not belong to this task'], 404);
		}

		if ($comment->user_id !== Auth::id()) {
			return response()->json(['error' => 'You can only delete your own comments'], 403);
		}

		$comment->delete();

		return response()->json(['success' => true]);
	}
}

