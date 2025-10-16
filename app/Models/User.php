<?php

// ============================================================================
// PASO 6: app/Models/User.php - MODELO ACTUALIZADO
// ============================================================================
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'nombres',
        'apellido_paterno',
        'apellido_materno',
        'correo',
        'contraseña',
        'telefono',
        'direccion',
        'fecha_registro',
        'rol_id',
        'oficina_id',
        'estado'
    ];

    protected $hidden = [
        'contraseña',
        'remember_token',
    ];

    protected $casts = [
        'fecha_registro' => 'datetime',
        'estado' => 'string'
    ];

    // IMPORTANTE: Para autenticación con campo 'contraseña'
    public function getAuthPassword()
    {
        return $this->contraseña;
    }

    // Accessor para obtener nombre completo
    public function getNombreCompletoAttribute()
    {
        return "{$this->nombres} {$this->apellido_paterno} {$this->apellido_materno}";
    }

    // Relaciones
    public function role()
    {
        return $this->belongsTo(Role::class, 'rol_id');
    }

    public function oficina()
    {
        return $this->belongsTo(Oficina::class, 'oficina_id');
    }

    public function practicante()
    {
        return $this->hasOne(Practicante::class, 'user_id');
    }
}