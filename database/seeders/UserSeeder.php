<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('nombre', 'Administrador')->first();
        $supervisorRole = Role::where('nombre', 'Supervisor')->first();

        // Usuario administrador
        User::create([
            'nombres' => 'Juan Carlos',
            'apellido_paterno' => 'García',
            'apellido_materno' => 'López',
            'correo' => 'admin@empresa.com',
            'contraseña' => Hash::make('admin123'),
            'telefono' => '987654321',
            'direccion' => 'Av. Principal 123',
            'fecha_registro' => now(),
            'rol_id' => $adminRole->id,
            'oficina_id' => 1,
            'estado' => 'activo'
        ]);

        // Usuario supervisor
        User::create([
            'nombres' => 'María Elena',
            'apellido_paterno' => 'Rodríguez',
            'apellido_materno' => 'Silva',
            'correo' => 'supervisor@empresa.com',
            'contraseña' => Hash::make('supervisor123'),
            'telefono' => '987654322',
            'direccion' => 'Jr. Los Robles 456',
            'fecha_registro' => now(),
            'rol_id' => $supervisorRole->id,
            'oficina_id' => 1,
            'estado' => 'activo'
        ]);
    }
}
