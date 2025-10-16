<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Rol; // Asegúrate de que el modelo Rol exista

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Rol::firstOrCreate(['nombre' => 'Administrador de Sistemas'], ['descripcion' => 'Control total del sistema.']);
        Rol::firstOrCreate(['nombre' => 'Jefe de Practicas'], ['descripcion' => 'Supervisa a los practicantes.']);
        Rol::firstOrCreate(['nombre' => 'Practicante'], ['descripcion' => 'Registra asistencias y actividades.']);
    }
}