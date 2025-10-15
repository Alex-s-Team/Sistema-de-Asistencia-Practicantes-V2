<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Asistencia extends Model
{
    use HasFactory;

    protected $table = 'asistencias';

    protected $fillable = [
        'practicante_id',
        'fecha',
        'hora_entrada',
        'hora_max_entrada',
        'hora_salida',
        'estado',
        'observaciones',
        'validado_por'
    ];

    protected $casts = [
        'fecha' => 'date',
        'hora_entrada' => 'datetime:H:i:s',
        'hora_salida' => 'datetime:H:i:s',
        'hora_max_entrada' => 'datetime:H:i:s',
        'estado' => 'string'
    ];

    public function practicante()
    {
        return $this->belongsTo(Practicante::class, 'practicante_id');
    }

    public function validador()
    {
        return $this->belongsTo(User::class, 'validado_por');
    }

    public function actividades()
    {
        return $this->hasMany(ActividadPracticante::class, 'asistencia_id');
    }

    public function getHorasTrabajadasAttribute()
    {
        if (!$this->hora_salida) return 0;
        
        $entrada = Carbon::parse($this->hora_entrada);
        $salida = Carbon::parse($this->hora_salida);
        
        return $salida->diffInHours($entrada);
    }

    public function esRetrasada()
    {
        $entrada = Carbon::parse($this->hora_entrada);
        $maxEntrada = Carbon::parse($this->hora_max_entrada);
        
        return $entrada->greaterThan($maxEntrada);
    }

    public function scopeDelMes($query, $mes = null, $anio = null)
    {
        $mes = $mes ?? now()->month;
        $anio = $anio ?? now()->year;
        
        return $query->whereMonth('fecha', $mes)->whereYear('fecha', $anio);
    }
}