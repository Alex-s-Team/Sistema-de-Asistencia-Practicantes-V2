<?php
// app/Services/AttendanceValidationService.php
namespace App\Services;

use App\Models\Attendance;
use App\Models\Justification;
use Carbon\Carbon;

class AttendanceValidationService
{
    protected $locationService;
    protected $networkService;

    public function __construct(LocationService $locationService, NetworkService $networkService)
    {
        $this->locationService = $locationService;
        $this->networkService = $networkService;
    }

    public function validateAttendanceConditions($userId, $latitude, $longitude, $ipAddress)
    {
        $isInLocation = $this->locationService->isWithinOffice($latitude, $longitude);
        $isInNetwork = $this->networkService->isInAllowedNetwork($ipAddress);

        $distance = $this->locationService->getDistanceFromOffice($latitude, $longitude);

        return [
            'is_valid_location' => $isInLocation,
            'is_valid_network' => $isInNetwork,
            'distance_from_office' => round($distance, 2),
            'requires_approval' => !$isInNetwork || !$isInLocation,
            'validation_message' => $this->getValidationMessage($isInLocation, $isInNetwork, $distance),
        ];
    }

    protected function getValidationMessage($isInLocation, $isInNetwork, $distance)
    {
        if ($isInLocation && $isInNetwork) {
            return 'Condiciones óptimas para registro';
        }

        $messages = [];

        if (!$isInNetwork) {
            $messages[] = 'No estás conectado a la red de la oficina';
        }

        if (!$isInLocation) {
            $messages[] = sprintf('Estás a %.2f metros de la oficina', $distance);
        }

        return implode('. ', $messages) . '. Requiere aprobación del supervisor.';
    }

    public function getAttendanceSummary($userId, Carbon $startDate, Carbon $endDate)
    {
        $attendances = Attendance::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        $justifications = Justification::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        $workingDays = $this->getWorkingDays($startDate, $endDate);
        $attendedDays = $attendances->where('status', 'approved')->count();
        $pendingDays = $attendances->where('status', 'pending')->count();
        $totalDelays = $attendances->where('has_delay', true)->count();
        $justifiedAbsences = $justifications->where('type', 'absence')->where('status', 'approved')->count();

        return [
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
            'working_days' => $workingDays,
            'attended_days' => $attendedDays,
            'pending_days' => $pendingDays,
            'absent_days' => $workingDays - $attendedDays - $pendingDays,
            'justified_absences' => $justifiedAbsences,
            'delays' => $totalDelays,
            'attendance_rate' => $workingDays > 0 ? round(($attendedDays / $workingDays) * 100, 2) : 0,
        ];
    }

    protected function getWorkingDays(Carbon $startDate, Carbon $endDate)
    {
        $days = 0;
        $current = $startDate->copy();

        while ($current <= $endDate) {
            // Excluir sábados (6) y domingos (0)
            if ($current->dayOfWeek !== 0 && $current->dayOfWeek !== 6) {
                $days++;
            }
            $current->addDay();
        }

        return $days;
    }

    public function autoApproveAttendance($attendanceId)
    {
        $attendance = Attendance::find($attendanceId);

        if (!$attendance) {
            return false;
        }

        // Auto-aprobar si cumple condiciones
        if (!$attendance->is_remote_entry && !$attendance->is_remote_exit && !$attendance->has_delay) {
            $attendance->update([
                'status' => 'approved',
                'validated_at' => now(),
            ]);

            return true;
        }

        return false;
    }
}

