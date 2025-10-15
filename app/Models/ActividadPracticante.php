<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActividadPracticante extends Model
{
    use HasFactory;

    protected $table = 'actividades_practicantes';

    protected $fillable = [
        'asistencia_id',
        'descripcion',
        'hora',
        'estado',
        'observaciones',
        'validado_por'
    ];

    protected $casts = [
        'hora' => 'datetime:H:i:s',
        'estado' => 'string'
    ];

    public function asistencia()
    {
        return $this->belongsTo(Asistencia::class, 'asistencia_id');
    }

    public function validador()
    {
        return $this->belongsTo(User::class, 'validado_por');
    }

    public function scopePendientes($query)
    {
        return $query->where('estado', 'pendiente');
    }

    public function scopeValidadas($query)
    {
        return $query->where('estado', 'validada');
    }
}