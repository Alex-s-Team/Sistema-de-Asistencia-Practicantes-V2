<?php

// app/Http/Controllers/Api/AuthController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Debug: Ver qué está llegando
        Log::info('Login attempt:', [
            'email' => $request->email,
            'has_password' => !empty($request->password),
            'all_data' => $request->all(),
            'content_type' => $request->header('Content-Type'),
        ]);

        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            $user = User::where('email', $validated['email'])->first();

            if (!$user) {
                Log::warning('Login failed: User not found', ['email' => $validated['email']]);
                throw ValidationException::withMessages([
                    'email' => ['Las credenciales proporcionadas son incorrectas.'],
                ]);
            }

            if (!Hash::check($validated['password'], $user->password)) {
                Log::warning('Login failed: Invalid password', ['email' => $validated['email']]);
                throw ValidationException::withMessages([
                    'email' => ['Las credenciales proporcionadas son incorrectas.'],
                ]);
            }

            if (!$user->is_active) {
                Log::warning('Login failed: User inactive', ['email' => $validated['email']]);
                throw ValidationException::withMessages([
                    'email' => ['Tu cuenta ha sido desactivada. Contacta al administrador.'],
                ]);
            }

            // Eliminar tokens anteriores
            $user->tokens()->delete();

            // Crear nuevo token
            $token = $user->createToken('auth-token')->plainTextToken;

            Log::info('Login successful', ['email' => $validated['email'], 'user_id' => $user->id]);

            return response()->json([
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'gender' => $user->gender,
                    'phone' => $user->phone,
                    'position' => $user->position,
                    'is_active' => $user->is_active,
                ],
            ]);

        } catch (ValidationException $e) {
            Log::error('Validation error in login:', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Unexpected error in login:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Error interno del servidor',
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json(['message' => 'Sesión cerrada exitosamente']);
        } catch (\Exception $e) {
            Log::error('Error in logout:', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error al cerrar sesión',
            ], 500);
        }
    }

    public function me(Request $request)
    {
        try {
            $user = $request->user();
            $user->load(['devices', 'attendances' => function($query) {
                $query->latest()->limit(5);
            }]);

            return response()->json([
                'user' => $user,
                'today_attendance' => $user->getTodayAttendance(),
                'stats' => $user->isIntern() ? $user->getAttendanceStats() : null,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in me:', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error al obtener información del usuario',
            ], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();

            $validated = $request->validate([
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string',
                'district' => 'nullable|string',
                'emergency_contact' => 'nullable|string|max:20',
            ]);

            $user->update($validated);

            return response()->json([
                'message' => 'Perfil actualizado correctamente',
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating profile:', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error al actualizar perfil',
            ], 500);
        }
    }

    public function changePassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'current_password' => 'required',
                'new_password' => 'required|min:8|confirmed',
            ]);

            $user = $request->user();

            if (!Hash::check($validated['current_password'], $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['La contraseña actual es incorrecta.'],
                ]);
            }

            $user->update([
                'password' => Hash::make($validated['new_password']),
            ]);

            return response()->json(['message' => 'Contraseña actualizada correctamente']);
        } catch (\Exception $e) {
            Log::error('Error changing password:', ['message' => $e->getMessage()]);
            throw $e;
        }
    }
}