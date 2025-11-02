<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ProjectController extends Controller
{
    use AuthorizesRequests;

    protected function ensureCurrentTeam()
    {
        /** @var User|null $user */
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('teams.index');
        }
        
        $team = $user->currentTeam();
        
        if (!$team) {
            return redirect()->route('teams.index');
        }
        
        return null;
    }

    public function index(Request $request)
    {
        $redirect = $this->ensureCurrentTeam();
        if ($redirect) {
            return $redirect;
        }
        
        /** @var User $user */
        $user = Auth::user();
        $team = $user->currentTeam();
        $projects = Project::where('team_id', $team->id)->get();
        return Inertia::render('projects/index', [
            'projects' => $projects,
            'team' => $team,
        ]);
    }

    public function store(Request $request)
    {
        $redirect = $this->ensureCurrentTeam();
        if ($redirect) {
            return $redirect;
        }
        
        /** @var User $user */
        $user = Auth::user();
        $team = $user->currentTeam();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'github_repo' => 'nullable|string|max:255',
            'default_sprint_length' => 'nullable|integer',
            'status' => 'nullable|string',
        ]);
        if (!isset($validated['status']) || $validated['status'] === null) {
            $validated['status'] = 'active';
        }
        $validated['team_id'] = $team->id;
        $project = Project::create($validated);
        return redirect()->route('projects.edit', $project->id)->with('success', 'Project created successfully.');
    }

    public function edit(Project $project)
    {
        $redirect = $this->ensureCurrentTeam();
        if ($redirect) {
            return $redirect;
        }
        
        $this->authorize('view', $project);
        return Inertia::render('projects/[id]/edit', [
            'project' => $project,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $redirect = $this->ensureCurrentTeam();
        if ($redirect) {
            return $redirect;
        }
        
        $this->authorize('update', $project);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'github_repo' => 'nullable|string|max:255',
            'default_sprint_length' => 'nullable|integer',
            'status' => 'nullable|string',
        ]);
        $project->update($validated);
        return redirect()->route('projects.index')->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project)
    {
        $redirect = $this->ensureCurrentTeam();
        if ($redirect) {
            return $redirect;
        }
        
        $this->authorize('delete', $project);
        $project->delete();
        return redirect()->route('projects.index')->with('success', 'Project deleted successfully.');
    }

    /**
     * Switch to a different project.
     */
    public function switch(Request $request, Project $project)
    {
        $this->authorize('view', $project);

        session(['current_project_id' => $project->id]);

        return back()->with('success', 'Project switched successfully.');
    }
}
