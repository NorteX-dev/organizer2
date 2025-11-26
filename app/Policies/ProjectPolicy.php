<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProjectPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->currentTeam() !== null;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Project $project): bool
    {
        $team = $project->team;
        if (!$team) {
            return false;
        }
        return $user->teams()->where("teams.id", $team->id)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        $team = $user->currentTeam();
        if (!$team) {
            return false;
        }
        return $user->hasAnyRole($team, ["admin", "product_owner", "scrum_master"]);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Project $project): bool
    {
        $team = $project->team;
        if (!$team) {
            return false;
        }
        return $user->hasAnyRole($team, ["admin", "product_owner", "scrum_master"]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Project $project): bool
    {
        $team = $project->team;
        if (!$team) {
            return false;
        }
        return $user->hasRole($team, "admin");
    }

    /**
     * Determine whether the user can manage backlog.
     */
    public function manageBacklog(User $user, Project $project): bool
    {
        $team = $project->team;
        if (!$team) {
            return false;
        }
        return $user->hasAnyRole($team, ["admin", "product_owner"]);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Project $project): bool
    {
        return $user->teams()->where("teams.id", $project->team_id)->exists();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Project $project): bool
    {
        return $user->teams()->where("teams.id", $project->team_id)->exists();
    }
}
