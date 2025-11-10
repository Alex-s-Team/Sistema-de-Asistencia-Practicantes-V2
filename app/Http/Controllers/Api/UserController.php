<?php
// app/Http/Controllers/Api/UserController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Device;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index(Request $request)
    {
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

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user->canManageUsers()) {
            return response()->json([
                'message' => 'No tienes permisos para crear usuarios',
            ], 403);
        }

        // 👇 CAMBIO: Validar DNI en lugar de email
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'dni' => 'required|string|size:8|regex:/^[0-9]{8}$/|unique:users,dni', // 👈 DNI obligatorio
            'email' => 'nullable|email|unique:users,email', // 👈 Email opcional
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

        try {
            DB::beginTransaction();

            $newUser = User::create([
                ...$validated,
                'password' => Hash::make($validated['password']),
                'age' => isset($validated['birth_date']) 
                    ? now()->diffInYears($validated['birth_date']) 
                    : null,
            ]);

            $newUser->assignRole($validated['role']);

            // Crear dispositivos si se proporcionaron
            if (isset($validated['devices'])) {
                foreach ($validated['devices'] as $device) {
                    Device::create([
                        'user_id' => $newUser->id,
                        ...$device,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Usuario creado exitosamente',
                'user' => $newUser->load('devices'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear usuario',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        $user = User::with(['devices', 'attendances' => function($query) {
            $query->latest()->limit(10);
        }, 'tasks', 'justifications'])->findOrFail($id);

        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $currentUser = $request->user();

        if (!$currentUser->canManageUsers()) {
            return response()->json([
                'message' => 'No tienes permisos para editar usuarios',
            ], 403);
        }

        $user = User::findOrFail($id);

        // 👇 CAMBIO: Validar DNI en actualización
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
    }

    public function destroy($id)
    {
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
    }

    public function interns(Request $request)
    {
        $interns = User::where('role', 'intern')
            ->where('is_active', true)
            ->with(['devices'])
            ->orderBy('name')
            ->get();

        return response()->json($interns);
    }
}