<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Configuración de Asistencias
    |--------------------------------------------------------------------------
    */

    // Ubicación de la oficina (coordenadas GPS)
    'office_latitude' => env('OFFICE_LATITUDE', -12.0464),
    'office_longitude' => env('OFFICE_LONGITUDE', -77.0428),
    'office_radius_meters' => env('OFFICE_RADIUS_METERS', 100),

    // Red privada permitida (formato CIDR)
    'allowed_network' => env('ALLOWED_NETWORK', '192.168.50.0/24'),

    // Configuración QR
    'qr_refresh_seconds' => env('QR_REFRESH_SECONDS', 30),

    // Tolerancia de retraso (minutos)
    'delay_tolerance_minutes' => env('DELAY_TOLERANCE_MINUTES', 5),

    // Días hábiles (1 = Lunes, 7 = Domingo)
    'working_days' => [1, 2, 3, 4, 5], // Lunes a Viernes
];
