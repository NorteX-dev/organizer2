<?php

use App\Models\Team;
use App\Models\User;

test("user belongs to many teams", function () {
    $user = User::factory()->create();
    $team1 = Team::factory()->create();
    $team2 = Team::factory()->create();

    $user->teams()->attach($team1->id, ["role" => "developer"]);
    $user->teams()->attach($team2->id, ["role" => "admin"]);

    expect($user->teams)->toHaveCount(2);
});

test("getRoleInTeam returns user role in team", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $user->teams()->attach($team->id, ["role" => "scrum_master"]);

    expect($user->getRoleInTeam($team))->toBe("scrum_master");
});

test("getRoleInTeam returns null when user is not in team", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    expect($user->getRoleInTeam($team))->toBeNull();
});

test("hasRole returns true when user has specific role", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $user->teams()->attach($team->id, ["role" => "scrum_master"]);

    expect($user->hasRole($team, "scrum_master"))->toBeTrue();
});

test("hasRole returns true when user is admin", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $user->teams()->attach($team->id, ["role" => "admin"]);

    expect($user->hasRole($team, "scrum_master"))->toBeTrue();
    expect($user->hasRole($team, "developer"))->toBeTrue();
});

test("hasRole returns false when user does not have role", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $user->teams()->attach($team->id, ["role" => "developer"]);

    expect($user->hasRole($team, "scrum_master"))->toBeFalse();
});

test("hasAnyRole returns true when user has one of the roles", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $user->teams()->attach($team->id, ["role" => "scrum_master"]);

    expect($user->hasAnyRole($team, ["scrum_master", "product_owner"]))->toBeTrue();
});

test("hasAnyRole returns true when user is admin", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $user->teams()->attach($team->id, ["role" => "admin"]);

    expect($user->hasAnyRole($team, ["scrum_master", "product_owner"]))->toBeTrue();
});

test("hasAnyRole returns false when user does not have any of the roles", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $user->teams()->attach($team->id, ["role" => "developer"]);

    expect($user->hasAnyRole($team, ["scrum_master", "product_owner"]))->toBeFalse();
});

test("initials returns first letters of first two words", function () {
    $user = User::factory()->create(["name" => "John Doe"]);

    expect($user->initials())->toBe("JD");
});

test("initials returns first letter when only one word", function () {
    $user = User::factory()->create(["name" => "John"]);

    expect($user->initials())->toBe("J");
});
