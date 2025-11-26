<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Sprint extends Model
{
    use HasFactory;

    protected $fillable = [
        "project_id",
        "name",
        "goal",
        "start_date",
        "end_date",
        "status",
        "planned_points",
        "completed_points",
    ];

    protected $casts = [
        "start_date" => "date",
        "end_date" => "date",
        "planned_points" => "integer",
        "completed_points" => "integer",
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function retrospective(): HasOne
    {
        return $this->hasOne(Retrospective::class);
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(ProjectActivity::class, "subject");
    }

    public function isActive(): bool
    {
        return $this->status === "active";
    }

    public function isCompleted(): bool
    {
        return $this->status === "completed";
    }

    public function daysRemaining(): int
    {
        if ($this->isCompleted()) {
            return 0;
        }

        return now()->diffInDays($this->end_date, false);
    }
}
