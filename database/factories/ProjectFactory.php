<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        return [
            "team_id" => Team::factory(),
            "name" => fake()->words(3, true),
            "description" => fake()->paragraph(),
            "github_repo" => fake()->optional()->userName() . "/" . fake()->word(),
            "default_sprint_length" => 14,
            "status" => "active",
        ];
    }
}
