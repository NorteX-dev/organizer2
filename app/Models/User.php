<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        "name",
        "email",
        "github_id",
        "github_token",
        "github_refresh_token",
        "email_verified_at",
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = ["github_token", "github_refresh_token", "remember_token"];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
        ];
    }

    /**
     * Get the user's initials
     */
    public function initials(): string
    {
        return Str::of($this->name)->explode(" ")->take(2)->map(fn($word) => Str::substr($word, 0, 1))->implode("");
    }

    /**
     * The teams that the user belongs to.
     */
    public function teams(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Team::class)->withTimestamps();
    }

    /**
     * Get the user's current team.
     */
    public function currentTeam(): ?\App\Models\Team
    {
        $teamId = session("current_team_id");

        if ($teamId) {
            $team = $this->teams()->find($teamId);
            return $team;
        }

        $team = $this->teams()->first();
        return $team;
    }

    /**
     * Tasks assigned to the user.
     */
    public function assignedTasks(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Task::class, "assigned_to");
    }

    /**
     * Comments made by the user.
     */
    public function taskComments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TaskComment::class);
    }

    /**
     * Retrospectives created by the user.
     */
    public function retrospectives(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Retrospective::class, "created_by");
    }

    /**
     * Documents created by the user.
     */
    public function documents(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Document::class, "created_by");
    }

    /**
     * Activities performed by the user.
     */
    public function activities(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProjectActivity::class);
    }
}
