<?php

namespace App\Console\Commands;

use App\Models\Team;
use App\Models\User;
use Illuminate\Console\Command;

class SetUserRole extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = "user:set-role {email : User email} {role : Role (admin, product_owner, scrum_master, developer)} {--team= : Team ID (optional, will use first team if not specified)}";

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = "Set user role in a team";

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument("email");
        $role = $this->argument("role");
        $teamId = $this->option("team");

        $validRoles = ["admin", "product_owner", "scrum_master", "developer"];
        if (!in_array($role, $validRoles)) {
            $this->error("Invalid role. Valid roles: " . implode(", ", $validRoles));
            return 1;
        }

        $user = User::where("email", $email)->first();
        if (!$user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }

        $team = null;
        if ($teamId) {
            $team = Team::find($teamId);
            if (!$team) {
                $this->error("Team with ID {$teamId} not found.");
                return 1;
            }
        } else {
            $team = $user->teams()->first();
            if (!$team) {
                $this->error("User is not a member of any team.");
                return 1;
            }
        }

        if (!$user->teams()->where("teams.id", $team->id)->exists()) {
            $this->error("User is not a member of team: {$team->name}");
            return 1;
        }

        $user->teams()->updateExistingPivot($team->id, ["role" => $role]);

        $this->info("Successfully set role '{$role}' for user {$user->name} ({$user->email}) in team '{$team->name}'.");

        return 0;
    }
}
