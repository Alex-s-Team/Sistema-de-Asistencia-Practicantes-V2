<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Practicante extends Model
{
    use HasFactory;
    
    // Es buena práctica especificar el nombre de la tabla si no sigue la convención exacta
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
        'observaciones',
    ];
}