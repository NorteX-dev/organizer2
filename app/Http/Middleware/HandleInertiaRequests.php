<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = "app";

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode("-");

        $user = $request->user();
        $teams = $user ? $user->teams : collect();
        $currentTeam = $user ? $user->currentTeam() : null;
        $projects = $currentTeam ? $currentTeam->projects : collect();
        $currentProject = $user ? $user->currentProject() : null;
        $unreadMessageCount = $user ? \App\Models\Message::where('to_user_id', $user->id)->where('read', false)->count() : 0;

        return [
            ...parent::share($request),
            "name" => config("app.name"),
            "quote" => ["message" => trim($message), "author" => trim($author)],
            "auth" => [
                "user" => $user,
            ],
            "sidebarOpen" => !$request->hasCookie("sidebar_state") || $request->cookie("sidebar_state") === "true",
            "teams" => $teams,
            "currentTeam" => $currentTeam,
            "projects" => $projects,
            "currentProject" => $currentProject,
            "unreadMessageCount" => $unreadMessageCount,
        ];
    }
}
