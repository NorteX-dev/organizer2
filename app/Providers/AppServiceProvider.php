<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        View::composer('app', function ($view) {
            /** @var User|null $user */
            $user = Auth::user();
            $teams = $user ? $user->teams : collect();
            $currentTeam = $user ? $user->currentTeam() : null;
            $projects = $currentTeam ? $currentTeam->projects : collect();
            $currentProject = $user ? $user->currentProject() : null;

            $view->with([
                'teams' => $teams,
                'currentTeam' => $currentTeam,
                'projects' => $projects,
                'currentProject' => $currentProject,
            ]);
        });
    }
}
