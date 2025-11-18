<?php

use App\Http\Controllers\Auth\GitHubController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('projects.index');
})->name('home');


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

Broadcast::routes(['middleware' => ['web', 'auth']]);

Route::middleware(['auth'])->group(function () {
    
    Route::resource('projects', App\Http\Controllers\ProjectController::class);
    Route::post('projects/{project}/switch', [App\Http\Controllers\ProjectController::class, 'switch'])->name('projects.switch');
    Route::post('projects/{project}/sync-github', [App\Http\Controllers\ProjectController::class, 'syncGithub'])->name('projects.sync-github');
    Route::get('projects/{project}/github-issues-prs', [App\Http\Controllers\ProjectController::class, 'fetchGithubIssuesAndPRs'])->name('projects.github-issues-prs');
    
    
    Route::middleware(['team.project'])->group(function () {
        Route::get('/backlog', function () {
            $user = auth()->user();
            $currentProject = $user->currentProject();
            return redirect()->route('projects.backlog.index', $currentProject->id);
        })->name('backlog.redirect');
        Route::get('projects/{project}/backlog', [App\Http\Controllers\BacklogController::class, 'index'])->name('projects.backlog.index');
        Route::post('projects/{project}/backlog', [App\Http\Controllers\BacklogController::class, 'store'])->name('projects.backlog.store');
        Route::put('projects/{project}/backlog/{task}', [App\Http\Controllers\BacklogController::class, 'update'])->name('projects.backlog.update');
        Route::delete('projects/{project}/backlog/{task}', [App\Http\Controllers\BacklogController::class, 'destroy'])->name('projects.backlog.destroy');
        Route::post('projects/{project}/backlog/reorder', [App\Http\Controllers\BacklogController::class, 'reorder'])->name('projects.backlog.reorder');
        Route::post('projects/{project}/backlog/{task}/move-up', [App\Http\Controllers\BacklogController::class, 'moveUp'])->name('projects.backlog.move-up');
        Route::post('projects/{project}/backlog/{task}/move-down', [App\Http\Controllers\BacklogController::class, 'moveDown'])->name('projects.backlog.move-down');
        Route::post('projects/{project}/backlog/{task}/subtasks', [App\Http\Controllers\BacklogController::class, 'createSubtasks'])->name('projects.backlog.create-subtasks');
        
        Route::get('/sprints', function () {
            $user = auth()->user();
            $currentProject = $user->currentProject();
            return redirect()->route('projects.sprints.index', $currentProject->id);
        })->name('sprints.redirect');
        Route::resource('projects.sprints', App\Http\Controllers\SprintController::class);
        Route::get('projects/{project}/sprints/{sprint}/tasks', [App\Http\Controllers\TaskController::class, 'index'])->name('projects.sprints.tasks.index');
        Route::post('projects/{project}/sprints/{sprint}/tasks', [App\Http\Controllers\TaskController::class, 'store'])->name('projects.sprints.tasks.store');
        Route::put('projects/{project}/sprints/{sprint}/tasks/{task}', [App\Http\Controllers\TaskController::class, 'update'])->name('projects.sprints.tasks.update');
        Route::post('projects/{project}/sprints/{sprint}/tasks/reorder', [App\Http\Controllers\TaskController::class, 'reorder'])->name('projects.sprints.tasks.reorder');
        Route::post('projects/{project}/sprints/{sprint}/tasks/add-from-backlog', [App\Http\Controllers\TaskController::class, 'addFromBacklog'])->name('projects.sprints.tasks.add-from-backlog');
        Route::post('projects/{project}/sprints/{sprint}/tasks/{task}/move-to-backlog', [App\Http\Controllers\TaskController::class, 'moveToBacklog'])->name('projects.sprints.tasks.move-to-backlog');
        
        Route::get('projects/{project}/tasks/{task}/comments', [App\Http\Controllers\TaskCommentController::class, 'index'])->name('projects.tasks.comments.index');
        Route::post('projects/{project}/tasks/{task}/comments', [App\Http\Controllers\TaskCommentController::class, 'store'])->name('projects.tasks.comments.store');
        Route::put('projects/{project}/tasks/{task}/comments/{comment}', [App\Http\Controllers\TaskCommentController::class, 'update'])->name('projects.tasks.comments.update');
        Route::delete('projects/{project}/tasks/{task}/comments/{comment}', [App\Http\Controllers\TaskCommentController::class, 'destroy'])->name('projects.tasks.comments.destroy');
        
        Route::get('projects/{project}/sprints/{sprint}/retrospective', [App\Http\Controllers\RetrospectiveController::class, 'show'])->name('projects.sprints.retrospective.show');
        Route::post('projects/{project}/sprints/{sprint}/retrospective', [App\Http\Controllers\RetrospectiveController::class, 'store'])->name('projects.sprints.retrospective.store');
        Route::put('projects/{project}/sprints/{sprint}/retrospective/{retrospective}', [App\Http\Controllers\RetrospectiveController::class, 'update'])->name('projects.sprints.retrospective.update');
        Route::post('retrospectives/{retrospective}/vote', [App\Http\Controllers\RetrospectiveController::class, 'vote'])->name('retrospectives.vote');
        
        Route::get('/documents', function () {
            $user = auth()->user();
            $currentProject = $user->currentProject();
            return redirect()->route('projects.documents.index', $currentProject->id);
        })->name('documents.redirect');
        Route::get('projects/{project}/documents', [App\Http\Controllers\DocumentController::class, 'index'])->name('projects.documents.index');
        Route::post('projects/{project}/documents', [App\Http\Controllers\DocumentController::class, 'store'])->name('projects.documents.store');
        Route::put('projects/{project}/documents/{document}', [App\Http\Controllers\DocumentController::class, 'update'])->name('projects.documents.update');
        Route::delete('projects/{project}/documents/{document}', [App\Http\Controllers\DocumentController::class, 'destroy'])->name('projects.documents.destroy');
        
        Route::get('/activities', function () {
            $user = auth()->user();
            $currentProject = $user->currentProject();
            return redirect()->route('projects.activities.index', $currentProject->id);
        })->name('activities.redirect');
        Route::get('projects/{project}/activities', [App\Http\Controllers\ProjectController::class, 'activities'])->name('projects.activities.index');
    });

    
    Route::resource('teams', App\Http\Controllers\TeamController::class);
    Route::post('teams/{team}/members', [App\Http\Controllers\TeamController::class, 'addMember'])->name('teams.members.add');
    Route::delete('teams/{team}/members/{user}', [App\Http\Controllers\TeamController::class, 'removeMember'])->name('teams.members.remove');
    Route::put('teams/{team}/members/{user}/role', [App\Http\Controllers\TeamController::class, 'updateRole'])->name('teams.members.update-role');
    Route::post('teams/{team}/switch', [App\Http\Controllers\TeamController::class, 'switch'])->name('teams.switch');
});

require __DIR__.'/settings.php';
