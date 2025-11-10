<?php
// app/Http/Controllers/Api/AttendanceController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\QRToken;
use App\Services\AttendanceValidationService;
use App\Services\LocationService;
use App\Services\NetworkService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    protected $validationService;
    protected $locationService;
    protected $networkService;

    public function __construct(
        AttendanceValidationService $validationService,
        LocationService $locationService,
        NetworkService $networkService
    ) {
        $this->validationService = $validationService;
        $this->locationService = $locationService;
        $this->networkService = $networkService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = Attendance::with(['user', 'validator']);

        if ($user->isIntern()) {
            $query->where('user_id', $user->id);
        }

        if ($request->has('user_id') && $user->canManageUsers()) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->has('month') && $request->has('year')) {
            $query->whereMonth('date', $request->month)
                  ->whereYear('date', $request->year);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $attendances = $query->orderBy('date', 'desc')
                            ->paginate($request->get('per_page', 15));

        return response()->json($attendances);
    }

    public function store(Request $request)
    {
        $request->validate([
            'qr_token' => 'required|string',
            'type' => 'required|in:entry,exit',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'remote_reason' => 'nullable|string',
        ]);

        $user = $request->user();

        // Verificar que el usuario es practicante
        if (!$user->isIntern()) {
            return response()->json([
                'message' => 'Solo los practicantes pueden marcar asistencia',
            ], 403);
        }

        // Validar token QR
        $qrToken = QRToken::where('token', $request->qr_token)->first();
        
        if (!$qrToken || !$qrToken->isValid()) {
            return response()->json([
                'message' => 'El código QR es inválido o ha expirado',
            ], 422);
        }

        try {
            DB::beginTransaction();

            $ipAddress = $request->ip();
            $isInNetwork = $this->networkService->isInAllowedNetwork($ipAddress);
            $isInLocation = $this->locationService->isWithinOffice(
                $request->latitude,
                $request->longitude
            );

            // Obtener o crear asistencia del día
            $attendance = Attendance::firstOrNew([
                'user_id' => $user->id,
                'date' => today(),
            ]);

            if ($request->type === 'entry') {
                if ($attendance->entry_time) {
                    throw new \Exception('Ya has registrado tu entrada hoy');
                }

                $attendance->entry_time = now()->format('H:i:s');
                $attendance->entry_ip = $ipAddress;
                $attendance->entry_device = $request->userAgent();
                $attendance->entry_latitude = $request->latitude;
                $attendance->entry_longitude = $request->longitude;
                $attendance->is_remote_entry = !$isInNetwork;

                // Calcular retraso
                $delayMinutes = $attendance->calculateDelay();
                if ($delayMinutes > 5) { // Tolerancia de 5 minutos
                    $attendance->has_delay = true;
                    $attendance->delay_minutes = $delayMinutes;
                }
            } else {
                if (!$attendance->entry_time) {
                    throw new \Exception('Debes registrar tu entrada primero');
                }

                if ($attendance->exit_time) {
                    throw new \Exception('Ya has registrado tu salida hoy');
                }

                $attendance->exit_time = now()->format('H:i:s');
                $attendance->exit_ip = $ipAddress;
                $attendance->exit_device = $request->userAgent();
                $attendance->exit_latitude = $request->latitude;
                $attendance->exit_longitude = $request->longitude;
                $attendance->is_remote_exit = !$isInNetwork;
            }

            // Si es remoto, requiere justificación
            if (!$isInNetwork && $request->has('remote_reason')) {
                $attendance->remote_reason = $request->remote_reason;
                $attendance->status = 'pending'; // Requiere aprobación
            } else if ($isInNetwork && $isInLocation) {
                $attendance->status = 'approved'; // Auto-aprobado
            } else {
                $attendance->status = 'pending';
            }

            $attendance->save();

            // Marcar token como usado
            $qrToken->update([
                'is_used' => true,
                'used_by' => $user->id,
                'used_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Asistencia registrada correctamente',
                'attendance' => $attendance,
                'requires_approval' => $attendance->status === 'pending',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function validate(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        if (!$user->canValidateAttendance()) {
            return response()->json([
                'message' => 'No tienes permisos para validar asistencias',
            ], 403);
        }

        $attendance = Attendance::findOrFail($id);

        $attendance->update([
            'status' => $request->status,
            'validated_by' => $user->id,
            'validated_at' => now(),
            'validation_notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Asistencia validada correctamente',
            'attendance' => $attendance->load(['user', 'validator']),
        ]);
    }

    public function pending(Request $request)
    {
        $user = $request->user();

        if (!$user->canValidateAttendance()) {
            return response()->json([
                'message' => 'No tienes permisos para ver asistencias pendientes',
            ], 403);
        }

        $pendingAttendances = Attendance::with(['user', 'validator'])
            ->where('status', 'pending')
            ->orderBy('date', 'desc')
            ->get();

        return response()->json($pendingAttendances);
    }

    public function stats(Request $request)
    {
        $user = $request->user();
        $targetUserId = $request->get('user_id', $user->id);

        // Solo admin/staff pueden ver stats de otros usuarios
        if ($targetUserId != $user->id && !$user->canManageUsers()) {
            return response()->json([
                'message' => 'No tienes permisos para ver estas estadísticas',
            ], 403);
        }

        $targetUser = User::findOrFail($targetUserId);
        $month = $request->get('month', now()->month);
        $year = $request->get('year', now()->year);

        $stats = $targetUser->getAttendanceStats($month, $year);

        return response()->json($stats);
    }
}
