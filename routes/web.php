<?php

use App\Http\Controllers\Auth\GitHubController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// GitHub OAuth routes
Route::get('/login', function () {
    return Inertia::render('auth/login');
})->name('login');

Route::get('/auth/github', [GitHubController::class, 'redirect'])->name('auth.github');
Route::get('/auth/github/callback', [GitHubController::class, 'callback'])->name('auth.github.callback');

Route::post('/logout', function () {
    auth()->logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect('/');
})->name('logout');

Route::middleware(['auth'])->group(function () {
    // Projects routes
    Route::resource('projects', App\Http\Controllers\ProjectController::class);
    Route::post('projects/{project}/switch', [App\Http\Controllers\ProjectController::class, 'switch'])->name('projects.switch');
    Route::get('/sprints', [App\Http\Controllers\SprintController::class, 'redirect'])->name('sprints.redirect');
    Route::resource('projects.sprints', App\Http\Controllers\SprintController::class);

    // Team routes
    Route::resource('teams', App\Http\Controllers\TeamController::class);
    Route::post('teams/{team}/members', [App\Http\Controllers\TeamController::class, 'addMember'])->name('teams.members.add');
    Route::delete('teams/{team}/members/{user}', [App\Http\Controllers\TeamController::class, 'removeMember'])->name('teams.members.remove');
    Route::post('teams/{team}/switch', [App\Http\Controllers\TeamController::class, 'switch'])->name('teams.switch');
});

require __DIR__.'/settings.php';
