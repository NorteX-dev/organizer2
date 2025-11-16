<?php

namespace App\Events;

use App\Models\Sprint;
use App\Models\Task;
use Illuminate\Broadcasting\InteractsWithBroadcasting;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels, InteractsWithBroadcasting;

    public function __construct(
        public Sprint $sprint,
        public Task $task
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('sprint.' . $this->sprint->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'task.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'task' => $this->task->load(['assignedUser', 'labels']),
        ];
    }
}
