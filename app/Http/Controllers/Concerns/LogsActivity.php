<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Project;
use App\Models\ProjectActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
	protected function logActivity(
		Project $project,
		string $action,
		Model $subject,
		array $metadata = []
	): ProjectActivity {
		return ProjectActivity::create([
			'project_id' => $project->id,
			'user_id' => Auth::id(),
			'action' => $action,
			'subject_type' => get_class($subject),
			'subject_id' => $subject->id,
			'metadata' => $metadata,
		]);
	}

	protected function logDeletedActivity(
		Project $project,
		string $action,
		string $subjectType,
		int $subjectId,
		array $metadata = []
	): ProjectActivity {
		return ProjectActivity::create([
			'project_id' => $project->id,
			'user_id' => Auth::id(),
			'action' => $action,
			'subject_type' => $subjectType,
			'subject_id' => $subjectId,
			'metadata' => $metadata,
		]);
	}
}

