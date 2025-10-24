<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TeamController extends Controller
{
    use AuthorizesRequests;
    
    /**
     * Display a listing of teams.
     */
    public function index()
    {
        $user = Auth::user();
        $teams = $user->teams()->with('users')->get();

        return Inertia::render('teams/index', [
            'teams' => $teams,
            'currentTeam' => $user->currentTeam(),
        ]);
    }

    /**
     * Show the form for creating a new team.
     */
    public function create()
    {
        return Inertia::render('teams/create');
    }

    /**
     * Store a newly created team.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $team = Team::create([
            'name' => $request->name,
        ]);

        // Add the creator as a member
        $team->users()->attach(Auth::id());

        return redirect()->route('teams.index')
            ->with('success', 'Team created successfully.');
    }

    /**
     * Display the specified team.
     */
    public function show(Team $team)
    {
        $this->authorize('view', $team);

        $team->load('users');

        return Inertia::render('teams/show', [
            'team' => $team,
        ]);
    }

    /**
     * Show the form for editing the team.
     */
    public function edit(Team $team)
    {
        $this->authorize('update', $team);

        $team->load('users');

        return Inertia::render('teams/edit', [
            'team' => $team,
        ]);
    }

    /**
     * Update the specified team.
     */
    public function update(Request $request, Team $team)
    {
        $this->authorize('update', $team);

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $team->update([
            'name' => $request->name,
        ]);

        return redirect()->route('teams.index')
            ->with('success', 'Team updated successfully.');
    }

    /**
     * Remove the specified team.
     */
    public function destroy(Team $team)
    {
        $this->authorize('delete', $team);

        $team->delete();

        return redirect()->route('teams.index')
            ->with('success', 'Team deleted successfully.');
    }

    /**
     * Add a member to the team.
     */
    public function addMember(Request $request, Team $team)
    {
        $this->authorize('update', $team);

        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if ($team->users()->where('user_id', $user->id)->exists()) {
            return back()->withErrors(['email' => 'User is already a member of this team.']);
        }

        $team->users()->attach($user->id);

        return back()->with('success', 'Member added successfully.');
    }

    /**
     * Remove a member from the team.
     */
    public function removeMember(Team $team, User $user)
    {
        $this->authorize('update', $team);

        // Don't allow removing the last member
        if ($team->users()->count() <= 1) {
            return back()->withErrors(['error' => 'Cannot remove the last member from the team.']);
        }

        $team->users()->detach($user->id);

        return back()->with('success', 'Member removed successfully.');
    }

    /**
     * Switch to a different team.
     */
    public function switch(Request $request, Team $team)
    {
        $this->authorize('view', $team);

        session(['current_team_id' => $team->id]);

        return back()->with('success', 'Team switched successfully.');
    }
}
