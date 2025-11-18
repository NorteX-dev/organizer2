<?php

use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\User;

test('task belongs to project', function () {
    $project = Project::factory()->create();
    $task = Task::factory()->create(['project_id' => $project->id]);

    expect($task->project)->toBeInstanceOf(Project::class);
    expect($task->project->id)->toBe($project->id);
});

test('task belongs to sprint', function () {
    $project = Project::factory()->create();
    $sprint = Sprint::factory()->create(['project_id' => $project->id]);
    $task = Task::factory()->create([
        'project_id' => $project->id,
        'sprint_id' => $sprint->id,
    ]);

    expect($task->sprint)->toBeInstanceOf(Sprint::class);
    expect($task->sprint->id)->toBe($sprint->id);
});

test('task can have parent task', function () {
    $project = Project::factory()->create();
    $parentTask = Task::factory()->create(['project_id' => $project->id]);
    $childTask = Task::factory()->create([
        'project_id' => $project->id,
        'parent_task_id' => $parentTask->id,
    ]);

    expect($childTask->parentTask)->toBeInstanceOf(Task::class);
    expect($childTask->parentTask->id)->toBe($parentTask->id);
});

test('task can have sub tasks', function () {
    $project = Project::factory()->create();
    $parentTask = Task::factory()->create(['project_id' => $project->id]);
    $childTask1 = Task::factory()->create([
        'project_id' => $project->id,
        'parent_task_id' => $parentTask->id,
        'position' => 1,
    ]);
    $childTask2 = Task::factory()->create([
        'project_id' => $project->id,
        'parent_task_id' => $parentTask->id,
        'position' => 2,
    ]);

    $subTasks = $parentTask->subTasks;
    expect($subTasks)->toHaveCount(2);
    expect($subTasks->first()->id)->toBe($childTask1->id);
});

test('task can be assigned to user', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create();
    $task = Task::factory()->create([
        'project_id' => $project->id,
        'assigned_to' => $user->id,
    ]);

    expect($task->assignedUser)->toBeInstanceOf(User::class);
    expect($task->assignedUser->id)->toBe($user->id);
});

test('isInBacklog returns true when status is Backlog', function () {
    $project = Project::factory()->create();
    $task = Task::factory()->create([
        'project_id' => $project->id,
        'status' => 'Backlog',
    ]);

    expect($task->isInBacklog())->toBeTrue();
});

test('isInBacklog returns false when status is not Backlog', function () {
    $project = Project::factory()->create();
    $task = Task::factory()->create([
        'project_id' => $project->id,
        'status' => 'Planned',
    ]);

    expect($task->isInBacklog())->toBeFalse();
});

test('isDone returns true when status is Completed', function () {
    $project = Project::factory()->create();
    $task = Task::factory()->create([
        'project_id' => $project->id,
        'status' => 'Completed',
    ]);

    expect($task->isDone())->toBeTrue();
});

test('isDone returns false when status is not Completed', function () {
    $project = Project::factory()->create();
    $task = Task::factory()->create([
        'project_id' => $project->id,
        'status' => 'Active',
    ]);

    expect($task->isDone())->toBeFalse();
});

test('isAssigned returns true when assigned_to is not null', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create();
    $task = Task::factory()->create([
        'project_id' => $project->id,
        'assigned_to' => $user->id,
    ]);

    expect($task->isAssigned())->toBeTrue();
});

test('isAssigned returns false when assigned_to is null', function () {
    $project = Project::factory()->create();
    $task = Task::factory()->create([
        'project_id' => $project->id,
        'assigned_to' => null,
    ]);

    expect($task->isAssigned())->toBeFalse();
});

test('isParent returns true when task has sub tasks', function () {
    $project = Project::factory()->create();
    $parentTask = Task::factory()->create(['project_id' => $project->id]);
    Task::factory()->create([
        'project_id' => $project->id,
        'parent_task_id' => $parentTask->id,
    ]);

    expect($parentTask->isParent())->toBeTrue();
});

test('isParent returns false when task has no sub tasks', function () {
    $project = Project::factory()->create();
    $task = Task::factory()->create(['project_id' => $project->id]);

    expect($task->isParent())->toBeFalse();
});

test('hasParent returns true when parent_task_id is not null', function () {
    $project = Project::factory()->create();
    $parentTask = Task::factory()->create(['project_id' => $project->id]);
    $childTask = Task::factory()->create([
        'project_id' => $project->id,
        'parent_task_id' => $parentTask->id,
    ]);

    expect($childTask->hasParent())->toBeTrue();
});

test('hasParent returns false when parent_task_id is null', function () {
    $project = Project::factory()->create();
    $task = Task::factory()->create(['project_id' => $project->id]);

    expect($task->hasParent())->toBeFalse();
});

test('getTotalStoryPoints returns sum of task and sub tasks story points', function () {
    $project = Project::factory()->create();
    $parentTask = Task::factory()->create([
        'project_id' => $project->id,
        'story_points' => 5,
    ]);
    Task::factory()->create([
        'project_id' => $project->id,
        'parent_task_id' => $parentTask->id,
        'story_points' => 3,
    ]);
    Task::factory()->create([
        'project_id' => $project->id,
        'parent_task_id' => $parentTask->id,
        'story_points' => 2,
    ]);

    expect($parentTask->getTotalStoryPoints())->toBe(10);
});

test('getTotalStoryPoints returns task story points when no sub tasks', function () {
    $project = Project::factory()->create();
    $task = Task::factory()->create([
        'project_id' => $project->id,
        'story_points' => 5,
    ]);

    expect($task->getTotalStoryPoints())->toBe(5);
});

