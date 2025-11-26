<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Project;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DocumentController extends Controller
{
    use AuthorizesRequests;

    public function index(Project $project)
    {
        $this->authorize("view", $project);

        $documents = Document::where("project_id", $project->id)->orderBy("position")->orderBy("created_at")->get();

        return Inertia::render("projects/[id]/documents", [
            "project" => $project,
            "documents" => $documents,
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $this->authorize("update", $project);

        $validated = $request->validate([
            "title" => "required|string|max:255",
            "content" => "nullable|string",
        ]);

        $maxPosition = Document::where("project_id", $project->id)->max("position") ?? -1;

        Document::create([
            "project_id" => $project->id,
            "created_by" => Auth::id(),
            "title" => $validated["title"],
            "content" => $validated["content"] ?? "",
            "position" => $maxPosition + 1,
        ]);

        return redirect()->route("projects.documents.index", $project->id);
    }

    public function update(Request $request, Project $project, Document $document)
    {
        $this->authorize("update", $project);

        if ($document->project_id !== $project->id) {
            return redirect()
                ->route("projects.documents.index", $project->id)
                ->withErrors(["error" => "Document does not belong to this project"]);
        }

        $validated = $request->validate([
            "title" => "sometimes|string|max:255",
            "content" => "nullable|string",
        ]);

        $document->update($validated);

        return redirect()->route("projects.documents.index", $project->id);
    }

    public function destroy(Project $project, Document $document)
    {
        $this->authorize("update", $project);

        if ($document->project_id !== $project->id) {
            return redirect()
                ->route("projects.documents.index", $project->id)
                ->withErrors(["error" => "Document does not belong to this project"]);
        }

        $document->delete();

        return redirect()->route("projects.documents.index", $project->id);
    }
}
