<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\LogsActivity;
use App\Models\GithubSync;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ProjectController extends Controller
{
    use AuthorizesRequests, LogsActivity;

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
        
        $this->logActivity($project, 'project.created', $project, [
            'name' => $project->name,
        ]);
        
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
        
        $metadata = [];
        if (!empty($validated)) {
            $metadata['updated_fields'] = array_keys($validated);
        }
        
        $project->update($validated);
        
        $this->logActivity($project, 'project.updated', $project, array_merge([
            'name' => $project->name,
        ], $metadata));
        
        return redirect()->route('projects.index')->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project)
    {
        $redirect = $this->ensureCurrentTeam();
        if ($redirect) {
            return $redirect;
        }
        
        $this->authorize('delete', $project);
        
        $projectName = $project->name;
        $projectId = $project->id;
        $project->delete();
        
        $this->logDeletedActivity($project, 'project.deleted', Project::class, $projectId, [
            'name' => $projectName,
        ]);
        
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
     * Fetch GitHub issues and PRs for a project.
     */
    public function fetchGithubIssuesAndPRs(Project $project)
    {
        $redirect = $this->ensureCurrentTeam();
        if ($redirect) {
            return $redirect;
        }
        
        $this->authorize('view', $project);

        if (!$project->github_repo) {
            return response()->json(['error' => 'No GitHub repository configured.'], 400);
        }

        $repoPath = $this->parseGithubRepoUrl($project->github_repo);
        if (!$repoPath) {
            return response()->json(['error' => 'Invalid GitHub repository URL.'], 400);
        }

        try {
            $issuesResponse = Http::get("https://api.github.com/repos/{$repoPath}/issues", [
                'state' => 'open',
                'per_page' => 100,
            ]);
            
            $prsResponse = Http::get("https://api.github.com/repos/{$repoPath}/pulls", [
                'state' => 'open',
                'per_page' => 100,
            ]);

            if ($issuesResponse->failed() || $prsResponse->failed()) {
                return response()->json(['error' => 'Failed to fetch data from GitHub.'], 500);
            }

            $issues = $issuesResponse->json();
            $prs = $prsResponse->json();

            
            $issuesOnly = array_filter($issues, fn($issue) => !isset($issue['pull_request']));
            
            $formattedIssues = array_map(function ($issue) {
                return [
                    'number' => $issue['number'],
                    'title' => $issue['title'],
                    'state' => $issue['state'],
                    'type' => 'issue',
                    'url' => $issue['html_url'],
                ];
            }, $issuesOnly);

            $formattedPRs = array_map(function ($pr) {
                return [
                    'number' => $pr['number'],
                    'title' => $pr['title'],
                    'state' => $pr['state'],
                    'type' => 'pr',
                    'url' => $pr['html_url'],
                ];
            }, $prs);

            return response()->json([
                'issues' => array_values($formattedIssues),
                'prs' => array_values($formattedPRs),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch GitHub data: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display project activities history.
     */
    public function activities(Request $request, Project $project)
    {
        $this->authorize('view', $project);
        
        $query = $project->activities()
            ->with(['user', 'subject'])
            ->orderBy('created_at', 'desc');
        
        $filters = $request->only(['action', 'user_id', 'date_from', 'date_to']);
        
        if (isset($filters['action']) && $filters['action']) {
            $query->where('action', $filters['action']);
        }
        
        if (isset($filters['user_id']) && $filters['user_id']) {
            $query->where('user_id', $filters['user_id']);
        }
        
        if (isset($filters['date_from']) && $filters['date_from']) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        
        if (isset($filters['date_to']) && $filters['date_to']) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }
        
        $perPage = $request->get('per_page', 20);
        $activities = $query->paginate($perPage)->withQueryString();
        
        $team = $project->team;
        $users = $team ? $team->users : collect();
        
        $availableActions = [
            'task.created',
            'task.updated',
            'task.deleted',
            'task.added_to_sprint',
            'task.moved_to_backlog',
            'task.subtask_created',
            'sprint.created',
            'sprint.updated',
            'sprint.deleted',
            'project.created',
            'project.updated',
            'project.deleted',
        ];
        
        return Inertia::render('projects/[id]/activities', [
            'project' => $project,
            'activities' => $activities,
            'users' => $users,
            'filters' => $filters,
            'availableActions' => $availableActions,
        ]);
    }

    /**
     * Parse GitHub repository URL to extract owner/repo path.
     */
    private function parseGithubRepoUrl(string $url): ?string
    {
        $url = trim($url);
        
        $url = preg_replace('/\.git$/', '', $url);
        
        if (preg_match('/github\.com[/:]([^\/]+)\/([^\/\s]+)/', $url, $matches)) {
            return $matches[1] . '/' . $matches[2];
        }
        
        if (preg_match('/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/', $url)) {
            return $url;
        }
        
        return null;
    }
}
