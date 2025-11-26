<?php

namespace App\Events;

use App\Models\Sprint;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithBroadcasting;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskReordered implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels, InteractsWithBroadcasting;

    public function __construct(public Sprint $sprint, public array $tasks) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("sprint." . $this->sprint->id)];
    }

    public function broadcastAs(): string
    {
        return "task.reordered";
    }

    public function broadcastWith(): array
    {
        return [
            "tasks" => $this->tasks,
        ];
    }
}
