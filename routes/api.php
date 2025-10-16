<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Aquí es donde puedes registrar las rutas de la API para tu aplicación.
| Laravel asigna automáticamente el grupo de middleware "api" a estas rutas.
| ¡Disfruta construyendo tu API!
|
*/

// Ruta de prueba para verificar que el archivo funciona
Route::get('/test-api', function () {
    return response()->json(['message' => '¡El archivo api.php funciona correctamente!']);
});

Route::post('/login', [AuthController::class, 'login']);