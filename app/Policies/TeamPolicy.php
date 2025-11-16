<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TeamPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any teams.
     */
    public function viewAny(User $user)
    {
        return true;
    }

    /**
     * Determine whether the user can view the team.
     */
    public function view(User $user, Team $team)
    {
        return $user->teams()->where('team_id', $team->id)->exists();
    }

    /**
     * Determine whether the user can create teams.
     */
    public function create(User $user)
    {
        return true;
    }

    /**
     * Determine whether the user can update the team.
     */
    public function update(User $user, Team $team)
    {
        return $user->hasRole($team, 'admin');
    }

    /**
     * Determine whether the user can delete the team.
     */
    public function delete(User $user, Team $team)
    {
        return $user->hasRole($team, 'admin');
    }
}