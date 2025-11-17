<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Services\AttendanceValidationService;
use App\Services\QRService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    protected $validationService;
    protected $qrService;

    public function __construct(AttendanceValidationService $validationService, QRService $qrService)
    {
        $this->validationService = $validationService;
        $this->qrService = $qrService;
    }

    public function index(Request $request)
    {
        try {
            $user = $request->user();

            $query = Attendance::with(['user']);

            // Si es practicante, solo ver sus asistencias
            if ($user->isIntern()) {
                $query->where('user_id', $user->id);
            }

            // Filtros opcionales
            if ($request->has('month')) {
                $query->whereMonth('date', $request->month);
            }

            if ($request->has('year')) {
                $query->whereYear('date', $request->year);
            }

            if ($request->has('user_id') && $user->canManageUsers()) {
                $query->where('user_id', $request->user_id);
            }

            $attendances = $query->orderBy('date', 'desc')->get();

            return response()->json($attendances);
        } catch (\Exception $e) {
            Log::error('Error in AttendanceController@index:', ['message' => $e->getMessage()]);
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
                ->get();

            return response()->json($pendingAttendances);
        } catch (\Exception $e) {
            Log::error('Error in AttendanceController@pending:', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error al obtener asistencias pendientes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->isIntern()) {
                return response()->json([
                    'message' => 'Solo los practicantes pueden marcar asistencia',
                ], 403);
            }

            $validated = $request->validate([
                'type' => 'required|in:entry,exit',
                'latitude' => 'required|numeric',
                'longitude' => 'required|numeric',
                'qr_token' => 'required|string',
                'remote_reason' => 'nullable|string',
            ]);

            // Validar QR
            $qrValidation = $this->qrService->validateToken($validated['qr_token']);
            if (!$qrValidation['valid']) {
                return response()->json([
                    'message' => $qrValidation['message'],
                ], 422);
            }

            // Marcar QR como usado
            if (isset($qrValidation['token'])) {
                $qrValidation['token']->update([
                    'used_by' => $user->id,
                    'used_at' => now()
                ]);
            }

            // Validar condiciones
            $ipAddress = $request->ip();
            $validation = $this->validationService->validateAttendanceConditions(
                $user->id,
                $validated['latitude'],
                $validated['longitude'],
                $ipAddress
            );

            // Verificar registro del día
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

                $entryTime = now()->format('H:i:s');
                $hasDelay = $user->entry_time && $entryTime > $user->entry_time;

                $attendanceData = [
                    'entry_time' => $entryTime,
                    'entry_latitude' => $validated['latitude'],
                    'entry_longitude' => $validated['longitude'],
                    'entry_ip' => $ipAddress,
                    'has_delay' => $hasDelay,
                    'is_remote_entry' => !$validation['is_valid_network'] || !$validation['is_valid_location'],
                    'remote_entry_reason' => $validated['remote_reason'] ?? null,
                    'status' => $validation['requires_approval'] ? 'pending' : 'approved',
                ];

                if ($existingAttendance) {
                    $existingAttendance->update($attendanceData);
                    $attendance = $existingAttendance;
                } else {
                    $attendance = Attendance::create(array_merge([
                        'user_id' => $user->id,
                        'date' => $today,
                    ], $attendanceData));
                }

                return response()->json([
                    'message' => $validation['requires_approval'] 
                        ? 'Entrada registrada. Requiere aprobación del supervisor.'
                        : 'Entrada registrada exitosamente',
                    'attendance' => $attendance,
                    'validation' => $validation,
                    'requires_remote_reason' => !$validation['is_valid_network'] && !$validated['remote_reason'],
                ], 201);

            } else { // exit
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

                $existingAttendance->update([
                    'exit_time' => now()->format('H:i:s'),
                    'exit_latitude' => $validated['latitude'],
                    'exit_longitude' => $validated['longitude'],
                    'exit_ip' => $ipAddress,
                    'is_remote_exit' => !$validation['is_valid_network'] || !$validation['is_valid_location'],
                    'remote_exit_reason' => $validated['remote_reason'] ?? null,
                ]);

                return response()->json([
                    'message' => 'Salida registrada exitosamente',
                    'attendance' => $existingAttendance,
                    'validation' => $validation,
                ]);
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error in AttendanceController@store:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al registrar asistencia',
                'error' => $e->getMessage(),
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

            return response()->json([
                'message' => 'Asistencia validada exitosamente',
                'attendance' => $attendance->load('user'),
            ]);

        } catch (\Exception $e) {
            Log::error('Error in AttendanceController@validate:', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error al validar asistencia',
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
                // Estadísticas para practicante
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
                // Estadísticas generales para admin/staff
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
}