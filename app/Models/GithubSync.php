<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GithubSync extends Model
{
	protected $fillable = ["project_id", "type", "data", "synced_at"];

	protected $casts = [
		"data" => "array",
		"synced_at" => "datetime",
	];

	public function project(): BelongsTo
	{
		return $this->belongsTo(Project::class);
	}
}
