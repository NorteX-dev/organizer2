<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ProjectController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
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
        return Redirect::route('projects.edit', $project->id)->with('success', 'Project created successfully.');
    }

    public function edit(Project $project)
    {
        $this->authorize('view', $project);
        return Inertia::render('projects/edit', [
            'project' => $project,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $this->authorize('update', $project);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'github_repo' => 'nullable|string|max:255',
            'default_sprint_length' => 'nullable|integer',
            'status' => 'nullable|string',
        ]);
        $project->update($validated);
        return Redirect::route('projects.index')->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project)
    {
        $this->authorize('delete', $project);
        $project->delete();
        return Redirect::route('projects.index')->with('success', 'Project deleted successfully.');
    }
}
