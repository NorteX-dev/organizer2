<?php

use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;

test('sprint default status is planning when created', function () {
    $project = Project::factory()->create();
    
    $sprint = Sprint::create([
        'project_id' => $project->id,
        'name' => 'Test Sprint',
        'start_date' => now(),
        'end_date' => now()->addDays(14),
        'status' => 'planning',
    ]);

    expect($sprint->status)->toBe('planning');
});

test('sprint can have multiple tasks', function () {
    $project = Project::factory()->create();
    $sprint = Sprint::factory()->create(['project_id' => $project->id]);
    
    $task1 = Task::factory()->create([
        'project_id' => $project->id,
        'sprint_id' => $sprint->id,
    ]);
    
    $task2 = Task::factory()->create([
        'project_id' => $project->id,
        'sprint_id' => $sprint->id,
    ]);

    expect($sprint->tasks)->toHaveCount(2);
});

test('sprint daysRemaining calculates correctly for active sprint', function () {
    $project = Project::factory()->create();
    $endDate = now()->addDays(5);
    
    $sprint = Sprint::factory()->create([
        'project_id' => $project->id,
        'status' => 'active',
        'end_date' => $endDate,
    ]);

    expect($sprint->daysRemaining())->toBeGreaterThanOrEqual(4);
    expect($sprint->daysRemaining())->toBeLessThanOrEqual(5);
});

test('sprint daysRemaining returns 0 for completed sprint', function () {
    $project = Project::factory()->create();
    
    $sprint = Sprint::factory()->create([
        'project_id' => $project->id,
        'status' => 'completed',
        'end_date' => now()->subDays(5),
    ]);

    expect($sprint->daysRemaining())->toBe(0);
});

test('sprint isActive returns true for active sprint', function () {
    $project = Project::factory()->create();
    
    $sprint = Sprint::factory()->create([
        'project_id' => $project->id,
        'status' => 'active',
    ]);

    expect($sprint->isActive())->toBeTrue();
});

test('sprint isCompleted returns true for completed sprint', function () {
    $project = Project::factory()->create();
    
    $sprint = Sprint::factory()->create([
        'project_id' => $project->id,
        'status' => 'completed',
    ]);

    expect($sprint->isCompleted())->toBeTrue();
});

