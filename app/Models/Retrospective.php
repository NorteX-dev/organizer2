<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Retrospective extends Model
{
    protected $fillable = ["sprint_id", "created_by", "went_well", "went_wrong", "to_improve"];

    public function sprint(): BelongsTo
    {
        return $this->belongsTo(Sprint::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, "created_by");
    }

    public function votes(): HasMany
    {
        return $this->hasMany(RetrospectiveVote::class);
    }

    public function upvotesCount(string $voteType): int
    {
        return $this->votes()->where("vote_type", $voteType)->where("upvote", true)->count();
    }

    public function downvotesCount(string $voteType): int
    {
        return $this->votes()->where("vote_type", $voteType)->where("upvote", false)->count();
    }
}
