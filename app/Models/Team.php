<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Team extends Model
{
	protected $fillable = ["name"];

	/**
	 * The users that belong to the team.
	 */
	public function users(): BelongsToMany
	{
		return $this->belongsToMany(User::class)->withPivot('role')->withTimestamps();
	}

	/**
	 * Get users with a specific role.
	 */
	public function usersWithRole(string $role): BelongsToMany
	{
		return $this->belongsToMany(User::class)
			->wherePivot('role', $role)
			->withPivot('role')
			->withTimestamps();
	}

	/**
	 * Projects owned by the team.
	 */
	public function projects(): \Illuminate\Database\Eloquent\Relations\HasMany
	{
		return $this->hasMany(Project::class);
	}
}
