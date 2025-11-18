<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'sprint_id' => null,
            'parent_task_id' => null,
            'assigned_to' => null,
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'type' => fake()->randomElement(['story', 'task', 'bug', 'epic']),
            'status' => fake()->randomElement(['Planned', 'Backlog', 'Active', 'Completed']),
            'priority' => fake()->randomElement(['low', 'medium', 'high', 'critical']),
            'story_points' => fake()->optional()->numberBetween(1, 21),
            'position' => 0,
            'github_issue_number' => fake()->optional()->numberBetween(1, 1000),
            'github_pr_number' => fake()->optional()->numberBetween(1, 1000),
        ];
    }
}

