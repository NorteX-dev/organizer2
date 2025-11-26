<?php

namespace App\Policies;

use App\Models\Sprint;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SprintPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Sprint $sprint): bool
    {
        $team = $sprint->project->team;
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
        return $user->hasAnyRole($team, ["admin", "scrum_master"]);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Sprint $sprint): bool
    {
        $team = $sprint->project->team;
        if (!$team) {
            return false;
        }
        return $user->hasAnyRole($team, ["admin", "scrum_master"]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Sprint $sprint): bool
    {
        $team = $sprint->project->team;
        if (!$team) {
            return false;
        }
        return $user->hasRole($team, "admin");
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Sprint $sprint): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Sprint $sprint): bool
    {
        return false;
    }
}
