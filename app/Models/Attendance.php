<?php

// app/Models/Attendance.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'date', 'entry_time', 'exit_time',
        'entry_ip', 'exit_ip', 'entry_device', 'exit_device',
        'entry_latitude', 'entry_longitude', 'exit_latitude','exit_longitude',
        'distance_from_office', 'qr_token',
        'is_remote_entry', 'is_remote_exit', 'remote_reason',
        'status', 'validated_by', 'validated_at', 'validation_notes',
        'has_delay', 'delay_minutes',
    ];

    protected $casts = [
        'date' => 'date',
        'is_remote_entry' => 'boolean',
        'is_remote_exit' => 'boolean',
        'has_delay' => 'boolean',
        'validated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function validator()
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isApproved()
    {
        return $this->status === 'approved';
    }

    public function isRejected()
    {
        return $this->status === 'rejected';
    }

    public function isRemote()
    {
        return $this->is_remote_entry || $this->is_remote_exit;
    }

    public function calculateDelay()
    {
        if (!$this->entry_time || !$this->user->entry_time) {
            return 0;
        }

        $expected = strtotime($this->user->entry_time);
        $actual = strtotime($this->entry_time);
        
        $diff = ($actual - $expected) / 60; // minutos
        
        return max(0, $diff);
    }
}

