<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class AttendanceValidationService
{
    /**
     * Validar condiciones de asistencia
     */
    public function validateAttendanceConditions($userId, $latitude, $longitude, $ipAddress)
    {
        $distanceFromOffice = $this->getDistanceFromOffice($latitude, $longitude);
        $isValidNetwork = $this->validateNetwork($ipAddress);
        
        // Requiere aprobación SOLO si está fuera de red
        // La ubicación se valida pero no bloquea el registro
        $requiresApproval = !$isValidNetwork;

        Log::info('Attendance validation result:', [
            'user_id' => $userId,
            'ip' => $ipAddress,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'distance_from_office' => $distanceFromOffice,
            'is_valid_network' => $isValidNetwork,
            'requires_approval' => $requiresApproval
        ]);

        return [
            'distance_from_office' => $distanceFromOffice,
            'is_far_from_office' => $distanceFromOffice > 500, // Más de 500 metros
            'is_valid_network' => $isValidNetwork,
            'requires_approval' => $requiresApproval,
            'ip_address' => $ipAddress,
            'location' => [
                'latitude' => $latitude,
                'longitude' => $longitude
            ]
        ];
    }

    /**
     * Obtener distancia desde la oficina
     */
    public function getDistanceFromOffice($latitude, $longitude)
    {
        $officeLatitude = config('attendance.office_latitude');
        $officeLongitude = config('attendance.office_longitude');

        return $this->calculateDistance(
            $latitude,
            $longitude,
            $officeLatitude,
            $officeLongitude
        );
    }

    /**
     * Validar red privada
     */
    private function validateNetwork($ipAddress)
    {
        $allowedNetwork = config('attendance.allowed_network');
        
        if (!$allowedNetwork) {
            return true;
        }

        list($subnet, $mask) = explode('/', $allowedNetwork);
        
        $ipLong = ip2long($ipAddress);
        $subnetLong = ip2long($subnet);
        $maskLong = -1 << (32 - $mask);
        
        $isInNetwork = ($ipLong & $maskLong) === ($subnetLong & $maskLong);

        Log::info('Network validation:', [
            'ip' => $ipAddress,
            'allowed_network' => $allowedNetwork,
            'is_in_network' => $isInNetwork
        ]);

        return $isInNetwork;
    }

    /**
     * Calcular distancia entre dos puntos GPS (en metros)
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000; // metros

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat/2) * sin($dLat/2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon/2) * sin($dLon/2);

        $c = 2 * atan2(sqrt($a), sqrt(1-$a));

        return round($earthRadius * $c, 2); // Distancia en metros con 2 decimales
    }
}