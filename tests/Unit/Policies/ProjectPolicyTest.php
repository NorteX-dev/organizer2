<?php

use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use App\Policies\ProjectPolicy;

test("viewAny returns true when user has current team", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->teams()->attach($team->id, ["role" => "developer"]);

    session(["current_team_id" => $team->id]);

    $policy = new ProjectPolicy();
    expect($policy->viewAny($user))->toBeTrue();
});

test("viewAny returns false when user has no current team", function () {
    $user = User::factory()->create();

    $policy = new ProjectPolicy();
    expect($policy->viewAny($user))->toBeFalse();
});

test("view returns true when user belongs to project team", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $project = Project::factory()->create(["team_id" => $team->id]);
    $user->teams()->attach($team->id, ["role" => "developer"]);

    $policy = new ProjectPolicy();
    expect($policy->view($user, $project))->toBeTrue();
});

test("view returns false when user does not belong to project team", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $project = Project::factory()->create(["team_id" => $team->id]);

    $policy = new ProjectPolicy();
    expect($policy->view($user, $project))->toBeFalse();
});

test("create returns true when user has admin role", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->teams()->attach($team->id, ["role" => "admin"]);

    session(["current_team_id" => $team->id]);

    $policy = new ProjectPolicy();
    expect($policy->create($user))->toBeTrue();
});

test("create returns true when user has product_owner role", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->teams()->attach($team->id, ["role" => "product_owner"]);

    session(["current_team_id" => $team->id]);

    $policy = new ProjectPolicy();
    expect($policy->create($user))->toBeTrue();
});

test("create returns true when user has scrum_master role", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->teams()->attach($team->id, ["role" => "scrum_master"]);

    session(["current_team_id" => $team->id]);

    $policy = new ProjectPolicy();
    expect($policy->create($user))->toBeTrue();
});

test("create returns false when user has developer role", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->teams()->attach($team->id, ["role" => "developer"]);

    session(["current_team_id" => $team->id]);

    $policy = new ProjectPolicy();
    expect($policy->create($user))->toBeFalse();
});

test("update returns true when user has admin role", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $project = Project::factory()->create(["team_id" => $team->id]);
    $user->teams()->attach($team->id, ["role" => "admin"]);

    $policy = new ProjectPolicy();
    expect($policy->update($user, $project))->toBeTrue();
});

test("update returns false when user has developer role", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $project = Project::factory()->create(["team_id" => $team->id]);
    $user->teams()->attach($team->id, ["role" => "developer"]);

    $policy = new ProjectPolicy();
    expect($policy->update($user, $project))->toBeFalse();
});

test("delete returns true when user has admin role", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $project = Project::factory()->create(["team_id" => $team->id]);
    $user->teams()->attach($team->id, ["role" => "admin"]);

    $policy = new ProjectPolicy();
    expect($policy->delete($user, $project))->toBeTrue();
});

test("delete returns false when user has product_owner role", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $project = Project::factory()->create(["team_id" => $team->id]);
    $user->teams()->attach($team->id, ["role" => "product_owner"]);

    $policy = new ProjectPolicy();
    expect($policy->delete($user, $project))->toBeFalse();
});

test("manageBacklog returns true when user has product_owner role", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $project = Project::factory()->create(["team_id" => $team->id]);
    $user->teams()->attach($team->id, ["role" => "product_owner"]);

    $policy = new ProjectPolicy();
    expect($policy->manageBacklog($user, $project))->toBeTrue();
});

test("manageBacklog returns false when user has developer role", function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $project = Project::factory()->create(["team_id" => $team->id]);
    $user->teams()->attach($team->id, ["role" => "developer"]);

    $policy = new ProjectPolicy();
    expect($policy->manageBacklog($user, $project))->toBeFalse();
});
