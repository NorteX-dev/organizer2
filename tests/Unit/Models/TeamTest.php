<?php

use App\Models\Team;
use App\Models\User;

test("team belongs to many users", function () {
    $team = Team::factory()->create();
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $team->users()->attach($user1->id, ["role" => "developer"]);
    $team->users()->attach($user2->id, ["role" => "admin"]);

    expect($team->users)->toHaveCount(2);
});

test("usersWithRole returns only users with specific role", function () {
    $team = Team::factory()->create();
    $developer1 = User::factory()->create();
    $developer2 = User::factory()->create();
    $admin = User::factory()->create();

    $team->users()->attach($developer1->id, ["role" => "developer"]);
    $team->users()->attach($developer2->id, ["role" => "developer"]);
    $team->users()->attach($admin->id, ["role" => "admin"]);

    $developers = $team->usersWithRole("developer")->get();
    expect($developers)->toHaveCount(2);
    expect($developers->pluck("id")->toArray())->toContain($developer1->id, $developer2->id);
});

test("team has many projects", function () {
    $team = Team::factory()->create();
    $project1 = \App\Models\Project::factory()->create(["team_id" => $team->id]);
    $project2 = \App\Models\Project::factory()->create(["team_id" => $team->id]);

    expect($team->projects)->toHaveCount(2);
});
