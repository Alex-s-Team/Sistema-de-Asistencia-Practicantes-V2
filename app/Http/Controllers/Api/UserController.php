<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Listar todos los usuarios
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->canManageUsers()) {
                return response()->json([
                    'message' => 'No tienes permisos',
                ], 403);
            }

            $query = User::query();

            // Filtros opcionales
            if ($request->has('role')) {
                $query->where('role', $request->role);
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->is_active);
            }

            $users = $query->orderBy('name')->get();

            return response()->json([
                'data' => $users
            ]);
        } catch (\Exception $e) {
            Log::error('Error in UserController@index:', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error al obtener usuarios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ MÉTODO FALTANTE - Listar solo practicantes activos
     */
    public function interns(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->canManageUsers()) {
                return response()->json([
                    'message' => 'No tienes permisos',
                ], 403);
            }

            // Obtener solo practicantes activos
            $interns = User::where('role', 'intern')
                ->where('is_active', true)
                ->orderBy('name')
                ->get();

            Log::info('Practicantes obtenidos:', [
                'count' => $interns->count(),
                'interns' => $interns->pluck('name', 'id')->toArray()
            ]);

            // ✅ IMPORTANTE: Devolver en la misma estructura que index()
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
    }

    /**
     * Crear nuevo usuario
     */
    public function store(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->canManageUsers()) {
                return response()->json([
                    'message' => 'No tienes permisos',
                ], 403);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'role' => ['required', Rule::in(['admin', 'staff', 'intern'])],
                'entry_time' => 'nullable|date_format:H:i:s',
                'exit_time' => 'nullable|date_format:H:i:s',
            ]);

            $validated['password'] = Hash::make($validated['password']);

            $newUser = User::create($validated);

            Log::info('Usuario creado:', [
                'user_id' => $newUser->id,
                'name' => $newUser->name,
                'role' => $newUser->role
            ]);

            return response()->json([
                'message' => 'Usuario creado exitosamente',
                'user' => $newUser,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error in UserController@store:', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error al crear usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar un usuario específico
     */
    public function show(Request $request, $id)
    {
        try {
            $user = $request->user();

            if (!$user->canManageUsers() && $user->id != $id) {
                return response()->json([
                    'message' => 'No tienes permisos',
                ], 403);
            }

            $targetUser = User::findOrFail($id);

            return response()->json([
                'data' => $targetUser
            ]);
        } catch (\Exception $e) {
            Log::error('Error in UserController@show:', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error al obtener usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar usuario
     */
    public function update(Request $request, $id)
    {
        try {
            $user = $request->user();

            if (!$user->canManageUsers()) {
                return response()->json([
                    'message' => 'No tienes permisos',
                ], 403);
            }

            $targetUser = User::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($id)],
                'role' => ['sometimes', Rule::in(['admin', 'staff', 'intern'])],
                'is_active' => 'sometimes|boolean',
                'entry_time' => 'nullable|date_format:H:i:s',
                'exit_time' => 'nullable|date_format:H:i:s',
            ]);

            $targetUser->update($validated);

            Log::info('Usuario actualizado:', [
                'user_id' => $targetUser->id,
                'changes' => $validated
            ]);

            return response()->json([
                'message' => 'Usuario actualizado exitosamente',
                'user' => $targetUser,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in UserController@update:', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error al actualizar usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar usuario
     */
    public function destroy(Request $request, $id)
    {
        try {
            $user = $request->user();

            if (!$user->canManageUsers()) {
                return response()->json([
                    'message' => 'No tienes permisos',
                ], 403);
            }

            $targetUser = User::findOrFail($id);

            // No permitir eliminar el propio usuario
            if ($user->id == $id) {
                return response()->json([
                    'message' => 'No puedes eliminarte a ti mismo',
                ], 422);
            }

            $targetUser->delete();

            Log::info('Usuario eliminado:', [
                'user_id' => $id,
                'deleted_by' => $user->id
            ]);

            return response()->json([
                'message' => 'Usuario eliminado exitosamente',
            ]);
        } catch (\Exception $e) {
            Log::error('Error in UserController@destroy:', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error al eliminar usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resetear contraseña de usuario
     */
    public function resetPassword(Request $request, $id)
    {
        try {
            $user = $request->user();

            if (!$user->canManageUsers()) {
                return response()->json([
                    'message' => 'No tienes permisos',
                ], 403);
            }

            $targetUser = User::findOrFail($id);

            $validated = $request->validate([
                'password' => 'required|string|min:8',
            ]);

            $targetUser->update([
                'password' => Hash::make($validated['password']),
            ]);

            Log::info('Contraseña reseteada:', [
                'user_id' => $id,
                'reset_by' => $user->id
            ]);

            return response()->json([
                'message' => 'Contraseña actualizada exitosamente',
            ]);
        } catch (\Exception $e) {
            Log::error('Error in UserController@resetPassword:', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error al resetear contraseña',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}