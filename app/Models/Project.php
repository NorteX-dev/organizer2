<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
	use HasFactory, SoftDeletes;

	protected $fillable = ["team_id", "name", "description", "github_repo", "default_sprint_length", "status"];

	protected $casts = [
		"default_sprint_length" => "integer",
	];

	public function team(): BelongsTo
	{
		return $this->belongsTo(Team::class);
	}

	public function sprints(): HasMany
	{
		return $this->hasMany(Sprint::class);
	}

	public function tasks(): HasMany
	{
		return $this->hasMany(Task::class);
	}

	public function labels(): HasMany
	{
		return $this->hasMany(Label::class);
	}

	public function documents(): HasMany
	{
		return $this->hasMany(Document::class);
	}

	public function githubSyncs(): HasMany
	{
		return $this->hasMany(GithubSync::class);
	}

	public function activities(): HasMany
	{
		return $this->hasMany(ProjectActivity::class);
	}

	public function activeSprint(): ?Sprint
	{
		return $this->sprints()->where("status", "active")->first();
	}
}
