<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Team extends Model
{
    use HasFactory;

    protected $fillable = ["name"];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot("role")->withTimestamps();
    }

    public function usersWithRole(string $role): BelongsToMany
    {
        return $this->belongsToMany(User::class)->wherePivot("role", $role)->withPivot("role")->withTimestamps();
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }
}
