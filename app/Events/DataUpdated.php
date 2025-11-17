<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DataUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $type;
    public $action;
    public $data;

    /**
     * Create a new event instance.
     *
     * @param string $type - 'user', 'attendance', 'task', 'justification'
     * @param string $action - 'created', 'updated', 'deleted'
     * @param mixed $data - Los datos actualizados
     */
    public function __construct($type, $action, $data)
    {
        $this->type = $type;
        $this->action = $action;
        $this->data = $data;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn()
    {
        // Broadcast a todos los usuarios autenticados
        return new Channel('system-updates');
    }

    /**
     * Nombre del evento en el cliente
     */
    public function broadcastAs()
    {
        return 'data.updated';
    }

    /**
     * Datos que se enviarán
     */
    public function broadcastWith()
    {
        return [
            'type' => $this->type,
            'action' => $this->action,
            'data' => $this->data,
            'timestamp' => now()->toISOString(),
        ];
    }
}