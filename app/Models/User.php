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
        return $this->belongsToMany(Team::class)->withPivot('role')->withTimestamps();
    }

    /**
     * Get the user's role in a specific team.
     */
    public function getRoleInTeam(Team $team): ?string
    {
        $pivot = $this->teams()->where('teams.id', $team->id)->first()?->pivot;
        return $pivot?->role ?? null;
    }

    /**
     * Check if the user has a specific role in a team.
     */
    public function hasRole(Team $team, string $role): bool
    {
        $userRole = $this->getRoleInTeam($team);
        if ($userRole === 'admin') {
            return true;
        }
        return $userRole === $role;
    }

    /**
     * Check if the user has any of the specified roles in a team.
     */
    public function hasAnyRole(Team $team, array $roles): bool
    {
        $userRole = $this->getRoleInTeam($team);
        if ($userRole === 'admin') {
            return true;
        }
        return in_array($userRole, $roles);
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
     * Get the user's current project.
     */
    public function currentProject(): ?\App\Models\Project
    {
        $team = $this->currentTeam();
        
        if (!$team) {
            return null;
        }

        $projectId = session("current_project_id");

        if ($projectId) {
            $project = $team->projects()->find($projectId);
            return $project;
        }

        $project = $team->projects()->first();
        return $project;
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
