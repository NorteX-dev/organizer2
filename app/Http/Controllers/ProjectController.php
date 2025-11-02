<?php

namespace App\Http\Controllers;

use App\Models\GithubSync;
use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
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
        
        $latestSync = $project->githubSyncs()
            ->orderBy('synced_at', 'desc')
            ->first();
        
        return Inertia::render('projects/[id]/edit', [
            'project' => $project,
            'latestGithubSync' => $latestSync,
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

    /**
     * Sync GitHub repository data.
     */
    public function syncGithub(Project $project)
    {
        $redirect = $this->ensureCurrentTeam();
        if ($redirect) {
            return $redirect;
        }
        
        $this->authorize('update', $project);

        if (!$project->github_repo) {
            return back()->withErrors(['error' => 'No GitHub repository configured.']);
        }

        $repoPath = $this->parseGithubRepoUrl($project->github_repo);
        if (!$repoPath) {
            return back()->withErrors(['error' => 'Invalid GitHub repository URL.']);
        }

        try {
            $response = Http::get("https://api.github.com/repos/{$repoPath}");
            
            if ($response->failed()) {
                if ($response->status() === 404) {
                    return back()->withErrors(['error' => 'Repository not found or is private. Only public repositories are supported.']);
                }
                return back()->withErrors(['error' => 'Failed to fetch repository data from GitHub.']);
            }

            $repoData = $response->json();
            
            GithubSync::create([
                'project_id' => $project->id,
                'type' => 'commits',
                'data' => [
                    'name' => $repoData['full_name'] ?? $repoData['name'] ?? '',
                    'description' => $repoData['description'] ?? null,
                    'stars' => $repoData['stargazers_count'] ?? 0,
                    'forks' => $repoData['forks_count'] ?? 0,
                    'language' => $repoData['language'] ?? null,
                    'url' => $repoData['html_url'] ?? $project->github_repo,
                ],
                'synced_at' => now(),
            ]);

            $latestSync = $project->githubSyncs()
                ->orderBy('synced_at', 'desc')
                ->first();

            return back()->with('success', 'GitHub repository synced successfully.')
                ->with('latestGithubSync', $latestSync);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to sync GitHub repository: ' . $e->getMessage()]);
        }
    }

    /**
     * Parse GitHub repository URL to extract owner/repo path.
     */
    private function parseGithubRepoUrl(string $url): ?string
    {
        // Handle various GitHub URL formats:
        // https://github.com/owner/repo
        // https://github.com/owner/repo.git
        // github.com/owner/repo
        // owner/repo
        
        $url = trim($url);
        
        // Remove .git suffix if present
        $url = preg_replace('/\.git$/', '', $url);
        
        // Extract owner/repo from URL
        if (preg_match('/github\.com[\/:]([^\/]+)\/([^\/\s]+)/', $url, $matches)) {
            return $matches[1] . '/' . $matches[2];
        }
        
        // Check if it's already in owner/repo format
        if (preg_match('/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/', $url)) {
            return $url;
        }
        
        return null;
    }
}
