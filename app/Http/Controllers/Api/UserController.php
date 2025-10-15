<?php


// app/Http/Controllers/Api/UserController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Bitacora;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['role', 'oficina']);

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('rol_id')) {
            $query->where('rol_id', $request->rol_id);
        }

        if ($request->has('oficina_id')) {
            $query->where('oficina_id', $request->oficina_id);
        }

        $users = $query->get();
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombres' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:50',
            'apellido_materno' => 'required|string|max:50',
            'correo' => 'required|email|max:100|unique:users',
            'contraseña' => 'required|string|min:8',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:255',
            'rol_id' => 'required|exists:roles,id',
            'oficina_id' => 'nullable|exists:oficinas,id',
            'estado' => 'in:activo,inactivo'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();
        $data['contraseña'] = Hash::make($request->contraseña);
        $data['fecha_registro'] = now();

        $user = User::create($data);

        Bitacora::registrar(auth()->id() ?? $user->id, "Usuario {$user->correo} creado");

        return response()->json($user->load(['role', 'oficina']), 201);
    }

    public function show($id)
    {
        $user = User::with(['role', 'oficina', 'practicante'])->findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nombres' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:50',
            'apellido_materno' => 'required|string|max:50',
            'correo' => 'required|email|max:100|unique:users,correo,' . $id,
            'contraseña' => 'nullable|string|min:8',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:255',
            'rol_id' => 'required|exists:roles,id',
            'oficina_id' => 'nullable|exists:oficinas,id',
            'estado' => 'in:activo,inactivo'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->except('contraseña');
        if ($request->filled('contraseña')) {
            $data['contraseña'] = Hash::make($request->contraseña);
        }

        $user->update($data);

        Bitacora::registrar(auth()->id(), "Usuario {$user->correo} actualizado");

        return response()->json($user->load(['role', 'oficina']));
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $correo = $user->correo;
        $user->delete();

        Bitacora::registrar(auth()->id(), "Usuario {$correo} eliminado");

        return response()->json(['message' => 'Usuario eliminado correctamente']);
    }
}
