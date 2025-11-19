<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Services\AttendanceValidationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    protected $validationService;

    public function __construct(AttendanceValidationService $validationService)
    {
        $this->validationService = $validationService;
    }

    public function store(Request $request)
    {
        try {
            Log::info('=== INICIO DE REGISTRO DE ASISTENCIA ===');
            Log::info('Request data:', $request->all());
            
            $user = $request->user();
            
            if (!$user) {
                Log::error('Usuario no autenticado');
                return response()->json([
                    'message' => 'Usuario no autenticado',
                ], 401);
            }

            Log::info('Usuario autenticado:', ['user_id' => $user->id, 'role' => $user->role]);

            if (!$user->isIntern()) {
                return response()->json([
                    'message' => 'Solo los practicantes pueden marcar asistencia',
                ], 403);
            }

            // Validación
            $validated = $request->validate([
                'type' => 'required|in:entry,exit',
                'latitude' => 'required|numeric',
                'longitude' => 'required|numeric',
                'qr_token' => 'required|string',
                'remote_reason' => 'nullable|string',
            ]);

            Log::info('Datos validados correctamente:', $validated);

            // Obtener IP
            $ipAddress = $request->ip();
            Log::info('IP del usuario:', ['ip' => $ipAddress]);
            
            // ✅ CAPTURAR LA HORA EXACTA DEL MOMENTO DEL REGISTRO
            $currentTime = Carbon::now();
            $registrationTime = $currentTime->format('H:i:s');
            
            Log::info('Hora exacta de registro:', [
                'timestamp' => $currentTime->toDateTimeString(),
                'time' => $registrationTime
            ]);
            
            // Validar ubicación y red (solo informativo)
            $validation = $this->validationService->validateAttendanceConditions(
                $user->id,
                $validated['latitude'],
                $validated['longitude'],
                $ipAddress
            );

            Log::info('Resultado de validación:', $validation);

            $today = Carbon::today();
            $existingAttendance = Attendance::where('user_id', $user->id)
                ->whereDate('date', $today)
                ->first();

            if ($validated['type'] === 'entry') {
                if ($existingAttendance && $existingAttendance->entry_time) {
                    return response()->json([
                        'message' => 'Ya has registrado tu entrada hoy',
                    ], 422);
                }

                // ✅ CALCULAR RETRASO CON LA HORA REAL DE REGISTRO
                $hasDelay = false;
                $delayMinutes = 0;
                
                if ($user->entry_time) {
                    $expectedTime = Carbon::createFromFormat('H:i:s', $user->entry_time);
                    $actualTime = Carbon::createFromFormat('H:i:s', $registrationTime);
                    
                    Log::info('Cálculo de retraso:', [
                        'expected' => $expectedTime->format('H:i:s'),
                        'actual' => $actualTime->format('H:i:s')
                    ]);
                    
                    if ($actualTime->greaterThan($expectedTime)) {
                        $hasDelay = true;
                        $delayMinutes = $actualTime->diffInMinutes($expectedTime);
                    }
                }

                // ✅ TODOS LOS REGISTROS REQUIEREN APROBACIÓN PARA QUE APAREZCAN EN EL DASHBOARD
                $attendanceData = [
                    'entry_time' => $registrationTime, // ✅ Hora exacta de registro
                    'entry_latitude' => $validated['latitude'],
                    'entry_longitude' => $validated['longitude'],
                    'entry_ip' => $ipAddress,
                    'entry_device' => $request->userAgent(),
                    'qr_token' => $validated['qr_token'],
                    'distance_from_office' => $validation['distance_from_office'],
                    'is_remote_entry' => !$validation['is_valid_network'],
                    'remote_reason' => $validated['remote_reason'] ?? null,
                    'has_delay' => $hasDelay,
                    'delay_minutes' => $delayMinutes,
                    'status' => 'pending', // ✅ SIEMPRE PENDIENTE para que aparezca en dashboard
                ];

                Log::info('Datos de asistencia a guardar:', $attendanceData);

                if ($existingAttendance) {
                    Log::info('Actualizando registro existente');
                    $existingAttendance->update($attendanceData);
                    $attendance = $existingAttendance->fresh();
                } else {
                    Log::info('Creando nuevo registro');
                    $attendance = Attendance::create(array_merge([
                        'user_id' => $user->id,
                        'date' => $today,
                    ], $attendanceData));
                }

                Log::info('Asistencia guardada exitosamente:', [
                    'id' => $attendance->id,
                    'entry_time' => $attendance->entry_time,
                    'status' => $attendance->status
                ]);

                return response()->json([
                    'message' => 'Entrada registrada. Requiere aprobación del administrador.',
                    'attendance' => $attendance,
                    'validation' => $validation,
                ], 201);

            } else { // EXIT
                if (!$existingAttendance || !$existingAttendance->entry_time) {
                    return response()->json([
                        'message' => 'Debes registrar tu entrada primero',
                    ], 422);
                }

                if ($existingAttendance->exit_time) {
                    return response()->json([
                        'message' => 'Ya has registrado tu salida hoy',
                    ], 422);
                }

                $exitData = [
                    'exit_time' => $registrationTime, // ✅ Hora exacta de registro
                    'exit_latitude' => $validated['latitude'],
                    'exit_longitude' => $validated['longitude'],
                    'exit_ip' => $ipAddress,
                    'exit_device' => $request->userAgent(),
                    'is_remote_exit' => !$validation['is_valid_network'],
                    'status' => 'pending', // ✅ También requiere aprobación
                ];

                if (!empty($validated['remote_reason'])) {
                    $exitData['remote_reason'] = $validated['remote_reason'];
                }

                Log::info('Datos de salida a guardar:', $exitData);

                $existingAttendance->update($exitData);

                Log::info('Salida registrada exitosamente');

                return response()->json([
                    'message' => 'Salida registrada. Requiere aprobación del administrador.',
                    'attendance' => $existingAttendance->fresh(),
                    'validation' => $validation,
                ]);
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Error de validación:', [
                'errors' => $e->errors(),
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
            
        } catch (\Exception $e) {
            Log::error('ERROR CRÍTICO en AttendanceController@store:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error al registrar asistencia',
                'error' => $e->getMessage(),
                'debug' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ] : null
            ], 500);
        }
    }

    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $query = Attendance::with(['user']);
            
            // ✅ FILTRO POR ESTADO (el más importante para tu reporte)
            // ... (todos los filtros que ya añadimos antes se mantienen igual)
            if ($user->isIntern()) {
                $query->where('user_id', $user->id);
            } elseif ($request->has('user_id') && $user->canManageUsers()) {
                $query->where('user_id', $request->user_id);
            }

            if ($request->has('start_date')) {
                $query->whereDate('date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->whereDate('date', '<=', $request->end_date);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $attendances = $query->orderBy('date', 'desc')->get();

            // ✅ CAMBIO CLAVE: Asegurarse de que la respuesta siempre tenga una clave 'data'
            // Esto es para estandarizar la respuesta y evitar 'data: undefined'
            return response()->json([
                'data' => $attendances // <-- Envolver la colección en una clave 'data'
            ]);

        } catch (\Exception $e) {
            Log::error('Error in AttendanceController@index:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al obtener asistencias',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function pending(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->canManageUsers()) {
                return response()->json([
                    'message' => 'No tienes permisos',
                ], 403);
            }

            $pendingAttendances = Attendance::with(['user'])
                ->where('status', 'pending')
                ->orderBy('date', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            Log::info('Asistencias pendientes encontradas:', [
                'count' => $pendingAttendances->count(),
                'data' => $pendingAttendances->toArray()
            ]);

            // ✅ CAMBIO CLAVE: Estandarizar la respuesta para que siempre tenga una clave 'data'
            return response()->json([
                'data' => $pendingAttendances
            ]);

        } catch (\Exception $e) {
            Log::error('Error in AttendanceController@pending:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al obtener asistencias pendientes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function validate(Request $request, $id)
    {
        try {
            $user = $request->user();

            if (!$user->canValidateAttendance()) {
                return response()->json([
                    'message' => 'No tienes permisos para validar asistencias',
                ], 403);
            }

            $attendance = Attendance::findOrFail($id);

            $validated = $request->validate([
                'status' => 'required|in:approved,rejected',
                'validation_notes' => 'nullable|string',
            ]);

            $attendance->update([
                'status' => $validated['status'],
                'validation_notes' => $validated['validation_notes'] ?? null,
                'validated_by' => $user->id,
                'validated_at' => now(),
            ]);

            Log::info('Asistencia validada:', [
                'attendance_id' => $id,
                'status' => $validated['status'],
                'validated_by' => $user->id
            ]);

            return response()->json([
                'message' => 'Asistencia validada exitosamente',
                'attendance' => $attendance->load('user'),
            ]);

        } catch (\Exception $e) {
            Log::error('Error in AttendanceController@validate:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al validar asistencia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function stats(Request $request)
    {
        try {
            $user = $request->user();

            $month = $request->input('month', now()->month);
            $year = $request->input('year', now()->year);

            if ($user->isIntern()) {
                $totalDays = Attendance::where('user_id', $user->id)
                    ->whereMonth('date', $month)
                    ->whereYear('date', $year)
                    ->count();

                $presentDays = Attendance::where('user_id', $user->id)
                    ->whereMonth('date', $month)
                    ->whereYear('date', $year)
                    ->whereNotNull('entry_time')
                    ->count();

                $delays = Attendance::where('user_id', $user->id)
                    ->whereMonth('date', $month)
                    ->whereYear('date', $year)
                    ->where('has_delay', true)
                    ->count();

                $stats = [
                    'total_days' => $totalDays,
                    'present_days' => $presentDays,
                    'absent_days' => $totalDays > 0 ? $totalDays - $presentDays : 0,
                    'delays' => $delays,
                    'attendance_rate' => $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 2) : 0,
                ];
            } else {
                $stats = [
                    'total_users' => \App\Models\User::where('role', 'intern')->where('is_active', true)->count(),
                    'total_attendances' => Attendance::whereMonth('date', $month)->whereYear('date', $year)->count(),
                    'pending_validations' => Attendance::where('status', 'pending')->count(),
                    'approved_attendances' => Attendance::where('status', 'approved')
                        ->whereMonth('date', $month)
                        ->whereYear('date', $year)
                        ->count(),
                ];
            }

            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Error in AttendanceController@stats:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getTodayAttendance(Request $request)
    {
        try {
            $user = $request->user();
            $today = Carbon::today();
            
            $attendance = Attendance::where('user_id', $user->id)
                ->whereDate('date', $today)
                ->first();

            return response()->json([
                'data' => $attendance
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting today attendance:', ['message' => $e->getMessage()]);
            return response()->json(['data' => null]);
        }
    }
}