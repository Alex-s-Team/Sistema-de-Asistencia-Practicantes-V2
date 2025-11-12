<?php

// routes/api.php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\JustificationController;
use App\Http\Controllers\Api\QRController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ChatController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas públicas
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // QR Code (Solo admin y staff)
    Route::prefix('qr')->group(function () {
        Route::get('/current', [QRController::class, 'current']);
        Route::post('/validate', [QRController::class, 'validate']);
    });

    // Asistencias
    Route::prefix('attendances')->group(function () {
        Route::get('/', [AttendanceController::class, 'index']);
        Route::post('/', [AttendanceController::class, 'store']); // Marcar asistencia
        Route::get('/pending', [AttendanceController::class, 'pending']);
        Route::get('/stats', [AttendanceController::class, 'stats']);
        Route::post('/{id}/validate', [AttendanceController::class, 'validate']);
    });

    // Tareas
    Route::prefix('tasks')->group(function () {
        Route::get('/', [TaskController::class, 'index']);
        Route::post('/', [TaskController::class, 'store']);
        Route::get('/my-tasks', [TaskController::class, 'myTasks']);
        Route::get('/{id}', [TaskController::class, 'show']);
        Route::put('/{id}', [TaskController::class, 'update']);
        Route::delete('/{id}', [TaskController::class, 'destroy']);
    });

    // Justificaciones
    Route::prefix('justifications')->group(function () {
        Route::get('/', [JustificationController::class, 'index']);
        Route::post('/', [JustificationController::class, 'store']);
        Route::get('/pending', [JustificationController::class, 'pending']);
        Route::post('/{id}/review', [JustificationController::class, 'review']);
    });

    // Usuarios (Solo admin y staff)
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store']);
        Route::get('/interns', [UserController::class, 'interns']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::put('/{id}', [UserController::class, 'update']);
        Route::delete('/{id}', [UserController::class, 'destroy']);
    });

    // Chat - Rutas mejoradas y ampliadas
    Route::prefix('chats')->group(function () {
        // Listar todos los chats del usuario
        Route::get('/', [ChatController::class, 'index']);
        
        // Buscar usuarios para crear chat privado
        Route::get('/search-users', [ChatController::class, 'searchUsers']);
        
        // Listar chats públicos disponibles
        Route::get('/public', [ChatController::class, 'publicChats']);
        
        // Crear nuevo chat
        Route::post('/', [ChatController::class, 'store']);
        
        // Operaciones específicas de un chat
        Route::prefix('{id}')->group(function () {
            // Obtener detalles del chat
            Route::get('/', [ChatController::class, 'show']);
            
            // Unirse a un chat público
            Route::post('/join', [ChatController::class, 'join']);
            
            // Salir de un chat
            Route::post('/leave', [ChatController::class, 'leave']);
            
            // Mensajes
            Route::get('/messages', [ChatController::class, 'getMessages']);
            Route::post('/messages', [ChatController::class, 'sendMessage']);
            
            // Marcar como leído
            Route::post('/mark-as-read', [ChatController::class, 'markAsRead']);
            
            // Indicador de "escribiendo..."
            Route::post('/typing', [ChatController::class, 'typing']);
        });
    });
});