<?php

// app/Models/User.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'gender', 'birth_date', 'age',
        'phone', 'emergency_contact', 'address', 'district', 'city',
        'university', 'semester', 'position', 'start_date', 'end_date',
        'entry_time', 'exit_time', 'is_active',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'birth_date' => 'date',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    // Relaciones
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function tasks()
    {
        return $this->belongsToMany(Task::class)->withTimestamps();
    }

    public function createdTasks()
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    public function justifications()
    {
        return $this->hasMany(Justification::class);
    }

    public function devices()
    {
        return $this->hasMany(Device::class);
    }

    public function chats()
    {
        return $this->belongsToMany(Chat::class)->withPivot('last_read_at')->withTimestamps();
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    // Métodos auxiliares
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isStaff()
    {
        return $this->role === 'staff';
    }

    public function isIntern()
    {
        return $this->role === 'intern';
    }

    public function canManageUsers()
    {
        return in_array($this->role, ['admin', 'staff']);
    }

    public function canValidateAttendance()
    {
        return $this->role === 'admin';
    }

    public function getTodayAttendance()
    {
        return $this->attendances()->whereDate('date', today())->first();
    }

    public function getAttendanceStats($month = null, $year = null)
    {
        $query = $this->attendances();
        
        if ($month && $year) {
            $query->whereMonth('date', $month)->whereYear('date', $year);
        }

        $total = $query->count();
        $approved = $query->where('status', 'approved')->count();
        $pending = $query->where('status', 'pending')->count();
        $delays = $query->where('has_delay', true)->count();

        return [
            'total' => $total,
            'approved' => $approved,
            'pending' => $pending,
            'rejected' => $total - $approved - $pending,
            'delays' => $delays,
            'attendance_rate' => $total > 0 ? round(($approved / $total) * 100, 2) : 0,
        ];
    }
}
