<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Sprint;
use Illuminate\Database\Eloquent\Factories\Factory;

class SprintFactory extends Factory
{
    protected $model = Sprint::class;

    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-1 month', '+1 month');
        $endDate = (clone $startDate)->modify('+14 days');

        return [
            'project_id' => Project::factory(),
            'name' => 'Sprint ' . fake()->numberBetween(1, 100),
            'goal' => fake()->optional()->sentence(),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => fake()->randomElement(['planning', 'active', 'completed']),
            'planned_points' => fake()->numberBetween(0, 100),
            'completed_points' => fake()->numberBetween(0, 100),
        ];
    }
}

