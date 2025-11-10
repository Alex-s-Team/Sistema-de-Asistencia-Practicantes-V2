<?php
// app/Services/LocationService.php
namespace App\Services;

class LocationService
{
    protected $officeLatitude;
    protected $officeLongitude;
    protected $officeRadius;

    public function __construct()
    {
        $this->officeLatitude = config('attendance.office_latitude');
        $this->officeLongitude = config('attendance.office_longitude');
        $this->officeRadius = config('attendance.office_radius_meters', 100);
    }

    public function isWithinOffice($latitude, $longitude)
    {
        $distance = $this->calculateDistance(
            $this->officeLatitude,
            $this->officeLongitude,
            $latitude,
            $longitude
        );

        return $distance <= $this->officeRadius;
    }

    public function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000; // metros

        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos($latFrom) * cos($latTo) *
             sin($lonDelta / 2) * sin($lonDelta / 2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c; // distancia en metros
    }

    public function getDistanceFromOffice($latitude, $longitude)
    {
        return $this->calculateDistance(
            $this->officeLatitude,
            $this->officeLongitude,
            $latitude,
            $longitude
        );
    }
}
