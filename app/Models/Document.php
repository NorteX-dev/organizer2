<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
	protected $fillable = ["project_id", "created_by", "title", "content", "position"];

	protected $casts = [
		"position" => "integer",
	];

	public function project(): BelongsTo
	{
		return $this->belongsTo(Project::class);
	}

	public function creator(): BelongsTo
	{
		return $this->belongsTo(User::class, "created_by");
	}
}
