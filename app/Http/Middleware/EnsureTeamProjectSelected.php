<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureTeamProjectSelected
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        /** @var User|null $user */
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        $currentTeam = $user->currentTeam();
        $currentProject = $user->currentProject();

        $path = $request->path();

        if ($path === 'sprints' || str_starts_with($path, 'sprints/') || preg_match('/^projects\/\d+\/sprints/', $path)) {
            if (!$currentTeam) {
                return Inertia::render('error', [
                    'message' => 'Please select a team first to access sprints.',
                ]);
            }

            if (!$currentProject) {
                return Inertia::render('error', [
                    'message' => 'Please select a project first to view sprints.',
                ]);
            }
        }

        return $next($request);
    }
}

