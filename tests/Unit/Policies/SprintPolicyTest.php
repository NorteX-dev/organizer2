<?php

use App\Models\Project;
use App\Models\Sprint;
use App\Models\Team;
use App\Models\User;
use App\Policies\SprintPolicy;

test('viewAny returns true', function () {
    $user = User::factory()->create();

    $policy = new SprintPolicy();
    expect($policy->viewAny($user))->toBeTrue();
});

test('view returns true when user belongs to sprint project team', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $project = Project::factory()->create(['team_id' => $team->id]);
    $sprint = Sprint::factory()->create(['project_id' => $project->id]);
    $user->teams()->attach($team->id, ['role' => 'developer']);

    $policy = new SprintPolicy();
    expect($policy->view($user, $sprint))->toBeTrue();
});

test('view returns false when user does not belong to sprint project team', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $project = Project::factory()->create(['team_id' => $team->id]);
    $sprint = Sprint::factory()->create(['project_id' => $project->id]);

    $policy = new SprintPolicy();
    expect($policy->view($user, $sprint))->toBeFalse();
});

test('create returns true when user has admin role', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->teams()->attach($team->id, ['role' => 'admin']);
    
    session(['current_team_id' => $team->id]);

    $policy = new SprintPolicy();
    expect($policy->create($user))->toBeTrue();
});

test('create returns true when user has scrum_master role', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->teams()->attach($team->id, ['role' => 'scrum_master']);
    
    session(['current_team_id' => $team->id]);

    $policy = new SprintPolicy();
    expect($policy->create($user))->toBeTrue();
});

test('create returns false when user has developer role', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->teams()->attach($team->id, ['role' => 'developer']);
    
    session(['current_team_id' => $team->id]);

    $policy = new SprintPolicy();
    expect($policy->create($user))->toBeFalse();
});

test('update returns true when user has admin role', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $project = Project::factory()->create(['team_id' => $team->id]);
    $sprint = Sprint::factory()->create(['project_id' => $project->id]);
    $user->teams()->attach($team->id, ['role' => 'admin']);

    $policy = new SprintPolicy();
    expect($policy->update($user, $sprint))->toBeTrue();
});

test('update returns false when user has developer role', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $project = Project::factory()->create(['team_id' => $team->id]);
    $sprint = Sprint::factory()->create(['project_id' => $project->id]);
    $user->teams()->attach($team->id, ['role' => 'developer']);

    $policy = new SprintPolicy();
    expect($policy->update($user, $sprint))->toBeFalse();
});

test('delete returns true when user has admin role', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $project = Project::factory()->create(['team_id' => $team->id]);
    $sprint = Sprint::factory()->create(['project_id' => $project->id]);
    $user->teams()->attach($team->id, ['role' => 'admin']);

    $policy = new SprintPolicy();
    expect($policy->delete($user, $sprint))->toBeTrue();
});

test('delete returns false when user has scrum_master role', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $project = Project::factory()->create(['team_id' => $team->id]);
    $sprint = Sprint::factory()->create(['project_id' => $project->id]);
    $user->teams()->attach($team->id, ['role' => 'scrum_master']);

    $policy = new SprintPolicy();
    expect($policy->delete($user, $sprint))->toBeFalse();
});

