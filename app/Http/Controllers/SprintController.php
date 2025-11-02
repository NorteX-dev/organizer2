<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Sprint;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SprintController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Project $project)
    {
        $sprints = Sprint::where('project_id', $project->id)->get();
        return Inertia::render("projects/[id]/sprints", ["project" => $project, "sprints" => $sprints]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Project $project)
    {
        $this->authorize('create', Sprint::class);
        return Inertia::render('projects/[id]/sprints/create', ['project' => $project]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Project $project)
    {
        $this->authorize('create', Sprint::class);
        $fields = $request->validate([
            'name' => 'required|string|max:255',
            'goal' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'planned_points' => 'nullable|integer',
        ]);
        $fields['project_id'] = $project->id;
        $fields['status'] = 'planning';
        $sprint = Sprint::create($fields);
        return redirect()->route('projects.sprints.index', $project->id);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project, Sprint $sprint)
    {
        $this->authorize('view', $sprint);
        
        $tasks = $sprint->tasks()
            ->with(['assignedUser', 'labels'])
            ->orderBy('status')
            ->orderBy('position')
            ->get();
        
        return Inertia::render('projects/[id]/sprints/[sprintId]/tasks', [
            'project' => $project,
            'sprint' => $sprint,
            'tasks' => $tasks,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project, Sprint $sprint)
    {
        $this->authorize('update', $sprint);
        return Inertia::render('projects/[id]/sprints/[sprintId]/edit', ['project' => $project, 'sprint' => $sprint]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project, Sprint $sprint)
    {
        $this->authorize('update', $sprint);
        $fields = $request->validate([
            'name' => 'required|string|max:255',
            'goal' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|string',
            'planned_points' => 'nullable|integer',
            'completed_points' => 'nullable|integer',
        ]);
        $sprint->update($fields);
        return redirect()->route('projects.sprints.index', $project->id);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project, Sprint $sprint)
    {
        $this->authorize('delete', $sprint);
        $sprint->delete();
        return redirect()->route('projects.sprints.index', $project->id);
    }
}
