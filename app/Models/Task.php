<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Task extends Model
{
	protected $fillable = [
		"project_id",
		"parent_task_id",
		"sprint_id",
		"assigned_to",
		"title",
		"description",
		"type",
		"status",
		"priority",
		"story_points",
		"position",
		"github_issue_number",
		"github_pr_number",
	];

	protected $casts = [
		"story_points" => "integer",
		"position" => "integer",
	];

	public function project(): BelongsTo
	{
		return $this->belongsTo(Project::class);
	}

	public function parentTask(): BelongsTo
	{
		return $this->belongsTo(Task::class, 'parent_task_id');
	}

	public function subTasks(): HasMany
	{
		return $this->hasMany(Task::class, 'parent_task_id')->orderBy('position');
	}

	public function sprint(): BelongsTo
	{
		return $this->belongsTo(Sprint::class);
	}

	public function assignedUser(): BelongsTo
	{
		return $this->belongsTo(User::class, "assigned_to");
	}

	public function labels(): BelongsToMany
	{
		return $this->belongsToMany(Label::class, "task_label");
	}

	public function comments(): HasMany
	{
		return $this->hasMany(TaskComment::class);
	}

	public function activities(): MorphMany
	{
		return $this->morphMany(ProjectActivity::class, "subject");
	}

	public function isInBacklog(): bool
	{
		return $this->status === "Backlog";
	}

	public function isDone(): bool
	{
		return $this->status === "Completed";
	}

	public function isAssigned(): bool
	{
		return $this->assigned_to !== null;
	}

	public function isParent(): bool
	{
		return $this->subTasks()->exists();
	}

	public function hasParent(): bool
	{
		return $this->parent_task_id !== null;
	}

	public function getTotalStoryPoints(): int
	{
		$subTasksPoints = $this->subTasks()->sum('story_points') ?? 0;
		return ($this->story_points ?? 0) + $subTasksPoints;
	}
}
