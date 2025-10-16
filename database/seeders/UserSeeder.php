<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Rol;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Buscamos el rol de Administrador que ya creamos
        $adminRole = Rol::where('nombre', 'Administrador de Sistemas')->first();

        // Verificamos que el rol exista antes de crear el usuario
        if ($adminRole) {
            // Creamos el usuario administrador si no existe
            User::firstOrCreate(
                ['correo' => 'admin@sistema.com'], // El correo que usarás para iniciar sesión
                [
                    'nombres' => 'Admin',
                    'apellido_paterno' => 'del',
                    'apellido_materno' => 'Sistema',
                    'password' => Hash::make('password'), // ¡CAMBIA ESTA CONTRASEÑA!
                    'rol_id' => $adminRole->id,
                    'estado' => 'activo',
                ]
            );
        }
    }
}