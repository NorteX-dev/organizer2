<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RetrospectiveVote extends Model
{
    protected $fillable = ["retrospective_id", "user_id", "vote_type", "upvote"];

    protected $casts = [
        "upvote" => "boolean",
    ];

    public function retrospective(): BelongsTo
    {
        return $this->belongsTo(Retrospective::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
