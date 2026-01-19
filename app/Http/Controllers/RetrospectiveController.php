<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Retrospective;
use App\Models\RetrospectiveVote;
use App\Models\Sprint;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RetrospectiveController extends Controller
{
    use AuthorizesRequests;

    public function show(Project $project, Sprint $sprint)
    {
        $this->authorize("view", $sprint);

        $retrospective = $sprint
            ->retrospective()
            ->with(["creator", "votes.user"])
            ->first();

        $userVotes = [];
        if ($retrospective && Auth::check()) {
            $userVotes = $retrospective
                ->votes()
                ->where("user_id", Auth::id())
                ->get()
                ->keyBy("vote_type")
                ->map(fn($vote) => ["upvote" => $vote->upvote, "downvote" => !$vote->upvote])
                ->toArray();
        }

        return Inertia::render("projects/[id]/sprints/[sprintId]/retrospective", [
            "project" => $project,
            "sprint" => $sprint,
            "retrospective" => $retrospective,
            "userVotes" => $userVotes,
        ]);
    }

    public function store(Request $request, Project $project, Sprint $sprint)
    {
        $this->authorize("update", $sprint);

        if ($sprint->status !== "completed") {
            return back()->withErrors(["error" => "Retrospective can only be created for completed sprints."]);
        }

        if ($sprint->retrospective()->exists()) {
            return back()->withErrors(["error" => "Retrospective already exists for this sprint."]);
        }

        $validated = $request->validate([
            "went_well" => "nullable|string",
            "went_wrong" => "nullable|string",
            "to_improve" => "nullable|string",
        ]);

        $retrospective = Retrospective::create([
            "sprint_id" => $sprint->id,
            "created_by" => Auth::id(),
            "went_well" => $validated["went_well"] ?? null,
            "went_wrong" => $validated["went_wrong"] ?? null,
            "to_improve" => $validated["to_improve"] ?? null,
        ]);

        $retrospective->load(["creator", "votes.user"]);

        return redirect()
            ->route("projects.sprints.retrospective.show", [$project->id, $sprint->id])
            ->with("success", "Retrospective created successfully.");
    }

    public function update(Request $request, Project $project, Sprint $sprint, Retrospective $retrospective)
    {
        $this->authorize("update", $sprint);

        if ($retrospective->sprint_id !== $sprint->id) {
            return back()->withErrors(["error" => "Retrospective does not belong to this sprint."]);
        }

        $validated = $request->validate([
            "went_well" => "nullable|string",
            "went_wrong" => "nullable|string",
            "to_improve" => "nullable|string",
        ]);

        $retrospective->update($validated);
        $retrospective->load(["creator", "votes.user"]);

        return redirect()
            ->route("projects.sprints.retrospective.show", [$project->id, $sprint->id])
            ->with("success", "Retrospective updated successfully.");
    }

    public function vote(Request $request, Retrospective $retrospective)
    {
        $validated = $request->validate([
            "vote_type" => "required|in:went_well,went_wrong,to_improve",
            "upvote" => "required|boolean",
        ]);

        $existingVote = RetrospectiveVote::where("retrospective_id", $retrospective->id)
            ->where("user_id", Auth::id())
            ->where("vote_type", $validated["vote_type"])
            ->first();

        if ($existingVote) {
            if ($existingVote->upvote === $validated["upvote"]) {
                $existingVote->delete();
            } else {
                $existingVote->update(["upvote" => $validated["upvote"]]);
            }
        } else {
            RetrospectiveVote::create([
                "retrospective_id" => $retrospective->id,
                "user_id" => Auth::id(),
                "vote_type" => $validated["vote_type"],
                "upvote" => $validated["upvote"],
            ]);
        }

        return back()->with("success", "Vote recorded.");
    }
}
