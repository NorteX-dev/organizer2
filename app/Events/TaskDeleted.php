<?php

namespace App\Events;

use App\Models\Sprint;
use Illuminate\Broadcasting\InteractsWithBroadcasting;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels, InteractsWithBroadcasting;

    public function __construct(public Sprint $sprint, public int $taskId) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("sprint." . $this->sprint->id)];
    }

    public function broadcastAs(): string
    {
        return "task.deleted";
    }

    public function broadcastWith(): array
    {
        return [
            "task_id" => $this->taskId,
        ];
    }
}
