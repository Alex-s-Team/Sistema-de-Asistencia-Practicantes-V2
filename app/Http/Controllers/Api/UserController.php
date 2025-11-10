<?php
// app/Http/Controllers/Api/UserController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Device;
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

            $query = User::with(['devices'])->where('is_active', true);

            if ($request->has('role')) {
                $query->where('role', $request->role);
            }

            $users = $query->orderBy('name')->get();

            // 👇 IMPORTANTE: Devolver directamente el array, no envuelto en 'data'
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
            $interns = User::where('role', 'intern')
                ->where('is_active', true)
                ->with(['devices'])
                ->orderBy('name')
                ->get();

            Log::info('Interns request:', [
                'count' => $interns->count(),
                'data' => $interns->toArray()
            ]);

            // 👇 IMPORTANTE: Devolver directamente el array
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

            // Crear dispositivos si se proporcionaron
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

            return response()->json($user);
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

            if (!$currentUser->canManageUsers()) {
                return response()->json([
                    'message' => 'No tienes permisos para editar usuarios',
                ], 403);
            }

            $user = User::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'dni' => 'sometimes|string|size:8|regex:/^[0-9]{8}$/|unique:users,dni,' . $id,
                'email' => 'sometimes|nullable|email|unique:users,email,' . $id,
                'role' => 'sometimes|in:admin,staff,intern',
                'gender' => 'sometimes|in:masculino,femenino',
                'phone' => 'nullable|string',
                'address' => 'nullable|string',
                'district' => 'nullable|string',
                'city' => 'nullable|string',
                'is_active' => 'sometimes|boolean',
            ]);

            $user->update($validated);

            return response()->json([
                'message' => 'Usuario actualizado exitosamente',
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in UserController@update:', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error al actualizar usuario',
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $currentUser = request()->user();

            if (!$currentUser->isAdmin()) {
                return response()->json([
                    'message' => 'Solo los administradores pueden eliminar usuarios',
                ], 403);
            }

            $user = User::findOrFail($id);

            // Soft delete
            $user->update(['is_active' => false]);

            return response()->json([
                'message' => 'Usuario desactivado exitosamente',
            ]);
        } catch (\Exception $e) {
            Log::error('Error in UserController@destroy:', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error al eliminar usuario',
            ], 500);
        }
    }
}