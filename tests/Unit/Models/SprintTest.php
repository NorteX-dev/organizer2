<?php

use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;

test("sprint belongs to project", function () {
    $project = Project::factory()->create();
    $sprint = Sprint::factory()->create(["project_id" => $project->id]);

    expect($sprint->project)->toBeInstanceOf(Project::class);
    expect($sprint->project->id)->toBe($project->id);
});

test("sprint has many tasks", function () {
    $project = Project::factory()->create();
    $sprint = Sprint::factory()->create(["project_id" => $project->id]);
    $task1 = Task::factory()->create([
        "project_id" => $project->id,
        "sprint_id" => $sprint->id,
    ]);
    $task2 = Task::factory()->create([
        "project_id" => $project->id,
        "sprint_id" => $sprint->id,
    ]);

    $tasks = $sprint->tasks;
    expect($tasks)->toHaveCount(2);
});

test("isActive returns true when status is active", function () {
    $project = Project::factory()->create();
    $sprint = Sprint::factory()->create([
        "project_id" => $project->id,
        "status" => "active",
    ]);

    expect($sprint->isActive())->toBeTrue();
});

test("isActive returns false when status is not active", function () {
    $project = Project::factory()->create();
    $sprint = Sprint::factory()->create([
        "project_id" => $project->id,
        "status" => "completed",
    ]);

    expect($sprint->isActive())->toBeFalse();
});

test("isCompleted returns true when status is completed", function () {
    $project = Project::factory()->create();
    $sprint = Sprint::factory()->create([
        "project_id" => $project->id,
        "status" => "completed",
    ]);

    expect($sprint->isCompleted())->toBeTrue();
});

test("isCompleted returns false when status is not completed", function () {
    $project = Project::factory()->create();
    $sprint = Sprint::factory()->create([
        "project_id" => $project->id,
        "status" => "active",
    ]);

    expect($sprint->isCompleted())->toBeFalse();
});

test("daysRemaining returns 0 when sprint is completed", function () {
    $project = Project::factory()->create();
    $sprint = Sprint::factory()->create([
        "project_id" => $project->id,
        "status" => "completed",
        "end_date" => now()->subDays(5),
    ]);

    expect($sprint->daysRemaining())->toBe(0);
});

test("daysRemaining returns correct number of days for active sprint", function () {
    $project = Project::factory()->create();
    $endDate = now()->addDays(5);
    $sprint = Sprint::factory()->create([
        "project_id" => $project->id,
        "status" => "active",
        "end_date" => $endDate,
    ]);

    expect($sprint->daysRemaining())->toBeGreaterThanOrEqual(4);
    expect($sprint->daysRemaining())->toBeLessThanOrEqual(5);
});
