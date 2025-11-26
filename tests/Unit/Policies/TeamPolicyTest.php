<?php

use App\Models\Team;
use App\Models\User;
use App\Policies\TeamPolicy;

test("viewAny returns true", function () {
    $user = User::factory()->create();

    $policy = new TeamPolicy();
    expect($policy->viewAny($user))->toBeTrue();
});

test("view returns true when user belongs to team", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->teams()->attach($team->id, ["role" => "developer"]);

    $policy = new TeamPolicy();
    expect($policy->view($user, $team))->toBeTrue();
});

test("view returns false when user does not belong to team", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $policy = new TeamPolicy();
    expect($policy->view($user, $team))->toBeFalse();
});

test("create returns true", function () {
    $user = User::factory()->create();

    $policy = new TeamPolicy();
    expect($policy->create($user))->toBeTrue();
});

test("update returns true when user has admin role", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->teams()->attach($team->id, ["role" => "admin"]);

    $policy = new TeamPolicy();
    expect($policy->update($user, $team))->toBeTrue();
});

test("update returns false when user has developer role", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->teams()->attach($team->id, ["role" => "developer"]);

    $policy = new TeamPolicy();
    expect($policy->update($user, $team))->toBeFalse();
});

test("delete returns true when user has admin role", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->teams()->attach($team->id, ["role" => "admin"]);

    $policy = new TeamPolicy();
    expect($policy->delete($user, $team))->toBeTrue();
});

test("delete returns false when user has developer role", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->teams()->attach($team->id, ["role" => "developer"]);

    $policy = new TeamPolicy();
    expect($policy->delete($user, $team))->toBeFalse();
});
