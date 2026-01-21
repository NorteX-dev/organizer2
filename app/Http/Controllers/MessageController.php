<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MessageController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $user = Auth::user();
        
        $incomingMessages = Message::where('to_user_id', $user->id)
            ->with(['fromUser'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        $outgoingMessages = Message::where('from_user_id', $user->id)
            ->with(['toUser'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        $unreadCount = Message::where('to_user_id', $user->id)
            ->where('read', false)
            ->count();
        
        $team = $user->currentTeam();
        $users = $team ? $team->users : collect();
        
        return Inertia::render('messages/index', [
            'incomingMessages' => $incomingMessages,
            'outgoingMessages' => $outgoingMessages,
            'unreadCount' => $unreadCount,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'to_user_id' => 'required|exists:users,id',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
        ]);
        
        $message = Message::create([
            'from_user_id' => $user->id,
            'to_user_id' => $validated['to_user_id'],
            'subject' => $validated['subject'],
            'body' => $validated['body'],
        ]);
        
        return redirect()->route('messages.index');
    }

    public function show(Message $message)
    {
        $user = Auth::user();
        
        if ($message->to_user_id !== $user->id && $message->from_user_id !== $user->id) {
            abort(403);
        }
        
        if ($message->to_user_id === $user->id) {
            $message->markAsRead();
        }
        
        return redirect()->route('messages.index');
    }

    public function destroy(Message $message)
    {
        $user = Auth::user();
        
        if ($message->to_user_id !== $user->id && $message->from_user_id !== $user->id) {
            abort(403);
        }
        
        $message->delete();
        
        return redirect()->route('messages.index');
    }
}
