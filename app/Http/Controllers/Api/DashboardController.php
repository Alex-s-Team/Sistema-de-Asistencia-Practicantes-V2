<?php

// ============================================================================
// PASO 8: app/Http/Controllers/Api/DashboardController.php
// ============================================================================
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Practicante;
use App\Models\Asistencia;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function estadisticas(Request $request)
    {
        $mes = $request->input('mes', Carbon::now()->month);
        $anio = $request->input('anio', Carbon::now()->year);

        // Practicantes activos
        $practicantesActivos = Practicante::whereDate('fecha_fin', '>=', now())->count();

        // Asistencias del mes
        $totalAsistencias = Asistencia::whereMonth('fecha', $mes)
            ->whereYear('fecha', $anio)
            ->count();

        // Tardanzas del mes
        $tardanzas = Asistencia::where('estado', 'tarde')
            ->whereMonth('fecha', $mes)
            ->whereYear('fecha', $anio)
            ->count();

        // Faltas del mes
        $faltas = Asistencia::where('estado', 'falta')
            ->whereMonth('fecha', $mes)
            ->whereYear('fecha', $anio)
            ->count();

        return response()->json([
            'practicantes_activos' => $practicantesActivos,
            'total_asistencias' => $totalAsistencias,
            'tardanzas' => $tardanzas,
            'faltas' => $faltas,
            'mes' => $mes,
            'anio' => $anio
        ]);
    }
}
