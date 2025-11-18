<?php

use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;

test('task position is calculated correctly when creating task', function () {
    $project = Project::factory()->create();
    $sprint = Sprint::factory()->create(['project_id' => $project->id]);
    
    Task::factory()->create([
        'project_id' => $project->id,
        'sprint_id' => $sprint->id,
        'status' => 'Planned',
        'position' => 0,
    ]);
    
    Task::factory()->create([
        'project_id' => $project->id,
        'sprint_id' => $sprint->id,
        'status' => 'Planned',
        'position' => 1,
    ]);

    $maxPosition = $sprint->tasks()
        ->where('status', 'Planned')
        ->max('position') ?? -1;

    expect($maxPosition)->toBe(1);
});

test('task reordering maintains correct positions', function () {
    $project = Project::factory()->create();
    $sprint = Sprint::factory()->create(['project_id' => $project->id]);
    
    $task1 = Task::factory()->create([
        'project_id' => $project->id,
        'sprint_id' => $sprint->id,
        'status' => 'Planned',
        'position' => 0,
    ]);
    
    $task2 = Task::factory()->create([
        'project_id' => $project->id,
        'sprint_id' => $sprint->id,
        'status' => 'Planned',
        'position' => 1,
    ]);

    $task1->update(['position' => 1]);
    $task2->update(['position' => 0]);

    expect($task1->fresh()->position)->toBe(1);
    expect($task2->fresh()->position)->toBe(0);
});

test('task status change updates positions correctly', function () {
    $project = Project::factory()->create();
    $sprint = Sprint::factory()->create(['project_id' => $project->id]);
    
    $task1 = Task::factory()->create([
        'project_id' => $project->id,
        'sprint_id' => $sprint->id,
        'status' => 'Planned',
        'position' => 0,
    ]);
    
    $task2 = Task::factory()->create([
        'project_id' => $project->id,
        'sprint_id' => $sprint->id,
        'status' => 'Planned',
        'position' => 1,
    ]);

    $maxPositionInActive = $sprint->tasks()
        ->where('status', 'Active')
        ->max('position') ?? -1;

    $task1->update([
        'status' => 'Active',
        'position' => $maxPositionInActive + 1,
    ]);

    expect($task1->fresh()->status)->toBe('Active');
    expect($task1->fresh()->position)->toBe(0);
});

test('backlog task position is calculated correctly', function () {
    $project = Project::factory()->create();
    
    Task::factory()->create([
        'project_id' => $project->id,
        'sprint_id' => null,
        'status' => 'Backlog',
        'position' => 0,
    ]);
    
    Task::factory()->create([
        'project_id' => $project->id,
        'sprint_id' => null,
        'status' => 'Backlog',
        'position' => 1,
    ]);

    $maxBacklogPosition = $project->tasks()
        ->whereNull('sprint_id')
        ->max('position') ?? -1;

    expect($maxBacklogPosition)->toBe(1);
});

