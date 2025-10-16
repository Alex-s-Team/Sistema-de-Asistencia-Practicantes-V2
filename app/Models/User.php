<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Rol;
use App\Models\Oficina;
use App\Models\Practicante;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * La tabla asociada con el modelo.
     * Laravel lo infiere como 'users', pero es buena práctica especificarlo.
     *
     * @var string
     */
    protected $table = 'users';

    /**
     * Los atributos que se pueden asignar masivamente.
     * ACTUALIZADO para coincidir con las columnas de tu tabla 'users'.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nombres',
        'apellido_paterno',
        'apellido_materno',
        'correo',
        'password', // Importante: debe ser 'password'
        'telefono',
        'direccion',
        'rol_id',
        'oficina_id',
        'estado',
    ];

    /**
     * Los atributos que deben ocultarse para la serialización.
     * ACTUALIZADO: Tu tabla no tiene 'remember_token'.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
    ];

    /**
     * Los atributos que deben ser convertidos a tipos nativos.
     * ACTUALIZADO: Tu tabla no tiene 'email_verified_at'.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            // Convierte la columna 'fecha_registro' a un objeto Carbon para fácil manipulación
            'fecha_registro' => 'datetime',
            // Asegura que Laravel siempre encripte la contraseña al asignarla
            'password' => 'hashed',
        ];
    }

    /**
     * Define la relación con el modelo Rol.
     * Esta función ya la tenías y estaba correcta.
     */
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    /**
     * Define la relación con el modelo Oficina.
     */
    public function oficina()
    {
        return $this->belongsTo(Oficina::class, 'oficina_id');
    }

    /**
     * Define la relación con el modelo Practicante.
     * Un usuario puede tener un registro de practicante asociado.
     */
    public function practicante()
    {
        return $this->hasOne(Practicante::class, 'user_id');
    }
}