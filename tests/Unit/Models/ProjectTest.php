<?php

use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\Team;

test('project belongs to team', function () {
    $team = Team::factory()->create();
    $project = Project::factory()->create(['team_id' => $team->id]);

    expect($project->team)->toBeInstanceOf(Team::class);
    expect($project->team->id)->toBe($team->id);
});

test('project has many sprints', function () {
    $project = Project::factory()->create();
    $sprint1 = Sprint::factory()->create(['project_id' => $project->id]);
    $sprint2 = Sprint::factory()->create(['project_id' => $project->id]);

    $sprints = $project->sprints;
    expect($sprints)->toHaveCount(2);
});

test('project has many tasks', function () {
    $project = Project::factory()->create();
    $task1 = Task::factory()->create(['project_id' => $project->id]);
    $task2 = Task::factory()->create(['project_id' => $project->id]);

    $tasks = $project->tasks;
    expect($tasks)->toHaveCount(2);
});

test('activeSprint returns active sprint when exists', function () {
    $project = Project::factory()->create();
    $activeSprint = Sprint::factory()->create([
        'project_id' => $project->id,
        'status' => 'active',
    ]);
    Sprint::factory()->create([
        'project_id' => $project->id,
        'status' => 'completed',
    ]);

    expect($project->activeSprint())->toBeInstanceOf(Sprint::class);
    expect($project->activeSprint()->id)->toBe($activeSprint->id);
});

test('activeSprint returns null when no active sprint exists', function () {
    $project = Project::factory()->create();
    Sprint::factory()->create([
        'project_id' => $project->id,
        'status' => 'completed',
    ]);

    expect($project->activeSprint())->toBeNull();
});

