<?php

// app/Models/Task.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'priority',
        'status',
        'start_date',
        'due_date',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'due_date' => 'date',
    ];

    // Relación: Usuarios asignados a la tarea
    public function assignedUsers()
    {
        return $this->belongsToMany(User::class, 'task_user')
            ->withTimestamps();
    }

    // Relación: Usuario que creó la tarea
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Métodos auxiliares
    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isInProgress()
    {
        return $this->status === 'in_progress';
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    public function isOverdue()
    {
        return $this->due_date < now() && !$this->isCompleted();
    }

    public function getPriorityColorAttribute()
    {
        return [
            'low' => 'green',
            'medium' => 'yellow',
            'high' => 'red',
        ][$this->priority] ?? 'gray';
    }

    public function getStatusColorAttribute()
    {
        return [
            'pending' => 'yellow',
            'in_progress' => 'blue',
            'completed' => 'green',
            'cancelled' => 'red',
        ][$this->status] ?? 'gray';
    }
}