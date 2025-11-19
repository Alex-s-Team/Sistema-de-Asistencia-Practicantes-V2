<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Device;
use App\Events\DataUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->canManageUsers()) {
                return response()->json([
                    'message' => 'No tienes permisos para ver usuarios',
                ], 403);
            }

            // ✅ CAMBIO IMPORTANTE: Traer TODOS los usuarios (activos e inactivos)
            // El filtrado se hace en el frontend
            $query = User::with(['devices']);

            if ($request->has('role')) {
                $query->where('role', $request->role);
            }

            // ✅ Permitir filtrar por estado si se especifica
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            $users = $query->orderBy('name')->get();

            return response()->json($users);
        } catch (\Exception $e) {
            Log::error('Error in UserController@index:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al obtener usuarios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function interns(Request $request)
    {
        try {
            // Para practicantes, solo mostrar los activos
            $interns = User::where('role', 'intern')
                ->where('is_active', true)
                ->with(['devices'])
                ->orderBy('name')
                ->get();

            return response()->json($interns);
        } catch (\Exception $e) {
            Log::error('Error in UserController@interns:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al obtener practicantes',
                'error' => $e->getMessage()
            ], 500);
        }
        return response()->json(['data' => $interns]);
    }

    public function store(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->canManageUsers()) {
                return response()->json([
                    'message' => 'No tienes permisos para crear usuarios',
                ], 403);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'dni' => 'required|string|size:8|regex:/^[0-9]{8}$/|unique:users,dni',
                'email' => 'nullable|email|unique:users,email',
                'password' => 'required|string|min:8',
                'role' => 'required|in:admin,staff,intern',
                'gender' => 'required|in:masculino,femenino',
                'birth_date' => 'nullable|date',
                'phone' => 'nullable|string',
                'emergency_contact' => 'nullable|string',
                'address' => 'nullable|string',
                'district' => 'nullable|string',
                'city' => 'nullable|string',
                'university' => 'nullable|string',
                'semester' => 'nullable|string',
                'position' => 'nullable|string',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date',
                'entry_time' => 'nullable|date_format:H:i',
                'exit_time' => 'nullable|date_format:H:i',
                'devices' => 'nullable|array',
                'devices.*.device_name' => 'required|string',
                'devices.*.ip_address' => 'required|ip',
                'devices.*.device_type' => 'required|in:laptop,phone,other',
            ]);

            DB::beginTransaction();

            $newUser = User::create([
                'name' => $validated['name'],
                'dni' => $validated['dni'],
                'email' => $validated['email'] ?? null,
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'gender' => $validated['gender'],
                'birth_date' => $validated['birth_date'] ?? null,
                'age' => isset($validated['birth_date']) 
                    ? now()->diffInYears($validated['birth_date']) 
                    : null,
                'phone' => $validated['phone'] ?? null,
                'emergency_contact' => $validated['emergency_contact'] ?? null,
                'address' => $validated['address'] ?? null,
                'district' => $validated['district'] ?? null,
                'city' => $validated['city'] ?? null,
                'university' => $validated['university'] ?? null,
                'semester' => $validated['semester'] ?? null,
                'position' => $validated['position'] ?? null,
                'start_date' => $validated['start_date'] ?? null,
                'end_date' => $validated['end_date'] ?? null,
                'entry_time' => $validated['entry_time'] ?? null,
                'exit_time' => $validated['exit_time'] ?? null,
                'is_active' => true,
            ]);

            if (isset($validated['devices'])) {
                foreach ($validated['devices'] as $device) {
                    Device::create([
                        'user_id' => $newUser->id,
                        'device_name' => $device['device_name'],
                        'ip_address' => $device['ip_address'],
                        'device_type' => $device['device_type'],
                    ]);
                }
            }

            DB::commit();

            // 🔥 BROADCAST: Notificar a todos que se creó un usuario
            broadcast(new DataUpdated('user', 'created', $newUser->load('devices')))->toOthers();

            return response()->json([
                'message' => 'Usuario creado exitosamente',
                'user' => $newUser->load('devices'),
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in UserController@store:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al crear usuario',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $user = User::with(['devices', 'attendances' => function($query) {
                $query->latest()->limit(10);
            }, 'tasks', 'justifications'])->findOrFail($id);

            return response()->json([
                'data' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Error in UserController@show:', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'Usuario no encontrado',
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $currentUser = $request->user();

            // Verificar permisos
            $isOwnProfile = $currentUser->id == $id;
            
            if (!$isOwnProfile && !$currentUser->canManageUsers()) {
                return response()->json([
                    'message' => 'No tienes permisos para editar este usuario',
                ], 403);
            }

            $user = User::findOrFail($id);

            // Si no es admin, solo puede editar ciertos campos de su propio perfil
            if (!$currentUser->isAdmin() && $isOwnProfile) {
                $validated = $request->validate([
                    'name' => 'sometimes|string|max:255',
                    'dni' => 'sometimes|string|size:8|regex:/^[0-9]{8}$/|unique:users,dni,' . $id,
                    'email' => 'sometimes|nullable|email|unique:users,email,' . $id,
                    'phone' => 'nullable|string',
                    'emergency_contact' => 'nullable|string',
                    'address' => 'nullable|string',
                    'district' => 'nullable|string',
                    'city' => 'nullable|string',
                    'university' => 'nullable|string',
                    'semester' => 'nullable|string',
                    'position' => 'nullable|string',
                ]);
            } else {
                // Admin puede editar todo incluyendo el rol y estado
                $validated = $request->validate([
                    'name' => 'sometimes|string|max:255',
                    'dni' => 'sometimes|string|size:8|regex:/^[0-9]{8}$/|unique:users,dni,' . $id,
                    'email' => 'sometimes|nullable|email|unique:users,email,' . $id,
                    'password' => 'sometimes|string|min:8',
                    'role' => 'sometimes|in:admin,staff,intern',
                    'gender' => 'sometimes|in:masculino,femenino',
                    'birth_date' => 'nullable|date',
                    'phone' => 'nullable|string',
                    'emergency_contact' => 'nullable|string',
                    'address' => 'nullable|string',
                    'district' => 'nullable|string',
                    'city' => 'nullable|string',
                    'university' => 'nullable|string',
                    'semester' => 'nullable|string',
                    'position' => 'nullable|string',
                    'start_date' => 'nullable|date',
                    'end_date' => 'nullable|date',
                    'entry_time' => 'nullable|date_format:H:i',
                    'exit_time' => 'nullable|date_format:H:i',
                    'is_active' => 'sometimes|boolean',
                ]);

                // Si se proporciona una contraseña, hashearla
                if (isset($validated['password'])) {
                    $validated['password'] = Hash::make($validated['password']);
                }

                // Recalcular edad si se actualiza birth_date
                if (isset($validated['birth_date'])) {
                    $validated['age'] = now()->diffInYears($validated['birth_date']);
                }
            }

            $user->update($validated);

            // 🔥 BROADCAST: Notificar actualización
            broadcast(new DataUpdated('user', 'updated', $user->load('devices')))->toOthers();

            return response()->json([
                'message' => 'Usuario actualizado exitosamente',
                'user' => $user->load('devices'),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error in UserController@update:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al actualizar usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $currentUser = request()->user();

            if (!$currentUser->isAdmin()) {
                return response()->json([
                    'message' => 'Solo los administradores pueden desactivar usuarios',
                ], 403);
            }

            // No permitir que un admin se desactive a sí mismo
            if ($currentUser->id == $id) {
                return response()->json([
                    'message' => 'No puedes desactivar tu propia cuenta',
                ], 403);
            }

            $user = User::findOrFail($id);
            
            // ✅ DESACTIVAR, no eliminar
            $user->update(['is_active' => false]);

            // 🔥 BROADCAST: Notificar "eliminación" (desactivación)
            broadcast(new DataUpdated('user', 'deleted', ['id' => $user->id]))->toOthers();

            Log::info('Usuario desactivado', [
                'user_id' => $id,
                'desactivado_por' => $currentUser->id
            ]);

            return response()->json([
                'message' => 'Usuario desactivado exitosamente',
            ]);
        } catch (\Exception $e) {
            Log::error('Error in UserController@destroy:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al desactivar usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restablecer la contraseña de un usuario (solo admin)
     */
    public function resetPassword(Request $request, $id)
    {
        try {
            $currentUser = $request->user();

            if (!$currentUser->isAdmin()) {
                return response()->json([
                    'message' => 'Solo los administradores pueden restablecer contraseñas',
                ], 403);
            }

            $user = User::findOrFail($id);
            
            // Usar el DNI como nueva contraseña
            $newPassword = $user->dni;
            $user->update([
                'password' => Hash::make($newPassword)
            ]);

            // 🔥 BROADCAST: Notificar actualización
            broadcast(new DataUpdated('user', 'updated', $user))->toOthers();

            Log::info('Contraseña restablecida', [
                'user_id' => $id,
                'restablecida_por' => $currentUser->id
            ]);

            return response()->json([
                'message' => 'Contraseña restablecida exitosamente',
                'new_password' => $newPassword,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in UserController@resetPassword:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al restablecer contraseña',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    
}