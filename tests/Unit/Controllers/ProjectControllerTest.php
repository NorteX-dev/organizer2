<?php

use App\Models\Project;
use App\Models\Sprint;
use App\Models\Team;

test('project default status is active when not provided', function () {
    $team = Team::factory()->create();
    
    $project = Project::factory()->create([
        'team_id' => $team->id,
        'name' => 'Test Project',
    ]);

    expect($project->status)->toBe('active');
});

test('project can have multiple sprints', function () {
    $team = Team::factory()->create();
    $project = Project::factory()->create(['team_id' => $team->id]);
    
    $sprint1 = Sprint::factory()->create(['project_id' => $project->id]);
    $sprint2 = Sprint::factory()->create(['project_id' => $project->id]);

    expect($project->sprints)->toHaveCount(2);
});

test('project activeSprint returns correct sprint', function () {
    $team = Team::factory()->create();
    $project = Project::factory()->create(['team_id' => $team->id]);
    
    Sprint::factory()->create([
        'project_id' => $project->id,
        'status' => 'completed',
    ]);
    
    $activeSprint = Sprint::factory()->create([
        'project_id' => $project->id,
        'status' => 'active',
    ]);

    expect($project->activeSprint()->id)->toBe($activeSprint->id);
});

test('project can be soft deleted', function () {
    $team = Team::factory()->create();
    $project = Project::factory()->create(['team_id' => $team->id]);
    
    $project->delete();

    expect($project->trashed())->toBeTrue();
    expect(Project::withTrashed()->find($project->id))->not->toBeNull();
});

