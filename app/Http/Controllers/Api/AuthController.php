<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'correo' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('correo', $request->correo)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'correo' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        if ($user->estado !== 'activo') {
            throw ValidationException::withMessages([
                'correo' => ['Esta cuenta de usuario se encuentra inactiva.'],
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        // --- CORRECCIÓN Y MEJORA ---
        // En lugar de volver a llamar a Auth::user(), usamos la variable $user que ya tenemos.
        // La función load() añade la información del rol directamente al objeto $user.
        $user->load('rol');

        return response()->json([
            'message' => 'Login exitoso',
            'user' => $user // Devolvemos el objeto $user ya cargado con su rol
        ], 200);
    }
}