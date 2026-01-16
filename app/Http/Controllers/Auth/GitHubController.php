<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GitHubController extends Controller
{
    public function redirect()
    {
        return Socialite::driver("github")->redirect();
    }

    public function callback()
    {
        try {
            $githubUser = Socialite::driver("github")->user();

            $user = User::updateOrCreate(
                ["github_id" => $githubUser->id],
                [
                    "name" => $githubUser->name ?? $githubUser->nickname,
                    "email" => $githubUser->email,
                    "github_token" => $githubUser->token,
                    "github_refresh_token" => $githubUser->refreshToken,
                    "email_verified_at" => now(),
                ],
            );

            Auth::login($user, true);

            return redirect()->intended("/projects");
        } catch (\Exception $e) {
            error_log($e);

            return redirect("/login")->withErrors(["error" => "Unable to authenticate with GitHub."]);
        }
    }
}
