<?php

use App\Models\Sprint;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('sprint.{sprintId}', function ($user, $sprintId) {
    $sprint = Sprint::find($sprintId);
    if (!$sprint) {
        return false;
    }
    return $user->can('view', $sprint);
});
