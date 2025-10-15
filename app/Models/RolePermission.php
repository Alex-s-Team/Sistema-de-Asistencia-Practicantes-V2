<?php

// app/Models/RolePermission.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    use HasFactory;

    protected $table = 'role_permissions';

    protected $fillable = [
        'rol_id',
        'permiso_id'
    ];

    public function role()
    {
        return $this->belongsTo(Role::class, 'rol_id');
    }

    public function permission()
    {
        return $this->belongsTo(Permission::class, 'permiso_id');
    }
}