<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Practicante extends Model
{
    use HasFactory;

    protected $table = 'practicantes';

    protected $fillable = [
        'user_id',
        'universidad',
        'carrera',
        'semestre',
        'horas_requeridas',
        'horas_completadas',
        'fecha_inicio',
        'fecha_fin',
        'supervisor_id',
        'observaciones'
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'semestre' => 'integer',
        'horas_requeridas' => 'integer',
        'horas_completadas' => 'integer'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function asistencias()
    {
        return $this->hasMany(Asistencia::class, 'practicante_id');
    }

    public function getPorcentajeAvanceAttribute()
    {
        if ($this->horas_requeridas == 0) return 0;
        return round(($this->horas_completadas / $this->horas_requeridas) * 100, 2);
    }

    public function getHorasRestantesAttribute()
    {
        return max(0, $this->horas_requeridas - $this->horas_completadas);
    }

    public function scopeActivos($query)
    {
        return $query->whereDate('fecha_fin', '>=', now());
    }
}