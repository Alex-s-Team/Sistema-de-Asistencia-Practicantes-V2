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
        $isValidLocation = $this->validateLocation($latitude, $longitude);
        $isValidNetwork = $this->validateNetwork($ipAddress);
        
        // Requiere aprobación si está fuera de ubicación O fuera de red
        $requiresApproval = !$isValidLocation || !$isValidNetwork;

        Log::info('Attendance validation result:', [
            'user_id' => $userId,
            'ip' => $ipAddress,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'is_valid_location' => $isValidLocation,
            'is_valid_network' => $isValidNetwork,
            'requires_approval' => $requiresApproval
        ]);

        return [
            'is_valid_location' => $isValidLocation,
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
     * Validar ubicación GPS
     */
    private function validateLocation($latitude, $longitude)
    {
        $officeLatitude = config('attendance.office_latitude');
        $officeLongitude = config('attendance.office_longitude');
        $maxDistance = config('attendance.office_radius_meters');

        $distance = $this->calculateDistance(
            $latitude,
            $longitude,
            $officeLatitude,
            $officeLongitude
        );

        Log::info('Location validation:', [
            'distance' => $distance,
            'max_distance' => $maxDistance,
            'is_valid' => $distance <= $maxDistance
        ]);

        return $distance <= $maxDistance;
    }

    /**
     * Validar red privada
     */
    private function validateNetwork($ipAddress)
    {
        $allowedNetwork = config('attendance.allowed_network');
        
        // Si no hay red configurada, permitir todas
        if (!$allowedNetwork) {
            return true;
        }

        // Verificar si la IP está en el rango permitido
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

        return $earthRadius * $c;
    }
}