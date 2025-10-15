<?php

// ============================================================================
// PASO 7: app/Http/Controllers/Api/AuthController.php
// ============================================================================
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Bitacora;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login de usuario
     */
    public function login(Request $request)
    {
        $request->validate([
            'correo' => 'required|email',
            'contraseña' => 'required|string'
        ]);

        $user = User::where('correo', $request->correo)->first();

        // Verificar usuario y contraseña
        if (!$user || !Hash::check($request->contraseña, $user->contraseña)) {
            throw ValidationException::withMessages([
                'correo' => ['Las credenciales son incorrectas.'],
            ]);
        }

        // Verificar estado del usuario
        if ($user->estado !== 'activo') {
            return response()->json([
                'message' => 'Usuario inactivo. Contacte al administrador.'
            ], 403);
        }

        // Eliminar tokens antiguos (opcional)
        $user->tokens()->delete();

        // Crear nuevo token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Cargar relaciones
        $user->load(['role', 'oficina', 'practicante']);

        // Registrar en bitácora
        Bitacora::create([
            'user_id' => $user->id,
            'accion' => 'Inicio de sesión exitoso',
            'fecha' => now()
        ]);

        return response()->json([
            'message' => 'Login exitoso',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'nombres' => $user->nombres,
                'apellido_paterno' => $user->apellido_paterno,
                'apellido_materno' => $user->apellido_materno,
                'nombre_completo' => $user->nombre_completo,
                'correo' => $user->correo,
                'telefono' => $user->telefono,
                'estado' => $user->estado,
                'rol' => [
                    'id' => $user->role->id,
                    'nombre' => $user->role->nombre
                ],
                'oficina' => $user->oficina ? [
                    'id' => $user->oficina->id,
                    'nombre' => $user->oficina->nombre
                ] : null
            ]
        ], 200);
    }

    /**
     * Obtener usuario autenticado
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load(['role', 'oficina', 'practicante']);

        return response()->json([
            'id' => $user->id,
            'nombres' => $user->nombres,
            'apellido_paterno' => $user->apellido_paterno,
            'apellido_materno' => $user->apellido_materno,
            'nombre_completo' => $user->nombre_completo,
            'correo' => $user->correo,
            'telefono' => $user->telefono,
            'estado' => $user->estado,
            'rol' => [
                'id' => $user->role->id,
                'nombre' => $user->role->nombre
            ],
            'oficina' => $user->oficina ? [
                'id' => $user->oficina->id,
                'nombre' => $user->oficina->nombre
            ] : null
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        // Registrar en bitácora
        Bitacora::create([
            'user_id' => $request->user()->id,
            'accion' => 'Cierre de sesión',
            'fecha' => now()
        ]);

        // Eliminar token actual
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ], 200);
    }

    /**
     * Cambiar contraseña
     */
    public function cambiarPassword(Request $request)
    {
        $request->validate([
            'password_actual' => 'required|string',
            'password_nuevo' => 'required|string|min:8|confirmed'
        ]);

        $user = $request->user();

        // Verificar contraseña actual
        if (!Hash::check($request->password_actual, $user->contraseña)) {
            return response()->json([
                'message' => 'La contraseña actual es incorrecta'
            ], 400);
        }

        // Actualizar contraseña
        $user->update([
            'contraseña' => Hash::make($request->password_nuevo)
        ]);

        // Registrar en bitácora
        Bitacora::create([
            'user_id' => $user->id,
            'accion' => 'Contraseña actualizada',
            'fecha' => now()
        ]);

        return response()->json([
            'message' => 'Contraseña actualizada correctamente'
        ], 200);
    }
}

