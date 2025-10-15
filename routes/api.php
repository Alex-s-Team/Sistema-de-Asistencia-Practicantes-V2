<?php
// ============================================================================
// routes/api.php - RUTAS API
// ============================================================================
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;

// Rutas públicas (sin autenticación)
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas (requieren autenticación con Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    
    // Autenticación
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/cambiar-password', [AuthController::class, 'cambiarPassword']);

    // Dashboard
    Route::get('/dashboard/estadisticas', [DashboardController::class, 'estadisticas']);
    
    // Ejemplo de ruta con middleware de rol (opcional)
    // Route::middleware('role:Administrador')->group(function () {
    //     Route::get('/admin/usuarios', [UserController::class, 'index']);
    // });
});