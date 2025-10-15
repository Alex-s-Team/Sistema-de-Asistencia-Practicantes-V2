<?php
// =============================================================================
// database/seeders/RolePermissionSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\DB;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Crear roles
        $admin = Role::create([
            'nombre' => 'Administrador',
            'descripcion' => 'Control total del sistema'
        ]);

        $supervisor = Role::create([
            'nombre' => 'Supervisor',
            'descripcion' => 'Jefe de oficina, supervisa practicantes'
        ]);

        $practicante = Role::create([
            'nombre' => 'Practicante',
            'descripcion' => 'Usuario practicante'
        ]);

        // Crear permisos
        $permisos = [
            // Usuarios
            ['nombre' => 'usuarios.ver', 'descripcion' => 'Ver usuarios'],
            ['nombre' => 'usuarios.crear', 'descripcion' => 'Crear usuarios'],
            ['nombre' => 'usuarios.editar', 'descripcion' => 'Editar usuarios'],
            ['nombre' => 'usuarios.eliminar', 'descripcion' => 'Eliminar usuarios'],
            
            // Practicantes
            ['nombre' => 'practicantes.ver', 'descripcion' => 'Ver practicantes'],
            ['nombre' => 'practicantes.crear', 'descripcion' => 'Crear practicantes'],
            ['nombre' => 'practicantes.editar', 'descripcion' => 'Editar practicantes'],
            ['nombre' => 'practicantes.eliminar', 'descripcion' => 'Eliminar practicantes'],
            
            // Asistencias
            ['nombre' => 'asistencias.ver', 'descripcion' => 'Ver asistencias'],
            ['nombre' => 'asistencias.crear', 'descripcion' => 'Registrar asistencias'],
            ['nombre' => 'asistencias.validar', 'descripcion' => 'Validar asistencias'],
            ['nombre' => 'asistencias.eliminar', 'descripcion' => 'Eliminar asistencias'],
            
            // Actividades
            ['nombre' => 'actividades.ver', 'descripcion' => 'Ver actividades'],
            ['nombre' => 'actividades.crear', 'descripcion' => 'Crear actividades'],
            ['nombre' => 'actividades.validar', 'descripcion' => 'Validar actividades'],
            ['nombre' => 'actividades.eliminar', 'descripcion' => 'Eliminar actividades'],
            
            // Reportes
            ['nombre' => 'reportes.ver', 'descripcion' => 'Ver reportes'],
            ['nombre' => 'reportes.exportar', 'descripcion' => 'Exportar reportes'],
            
            // Configuración
            ['nombre' => 'roles.gestionar', 'descripcion' => 'Gestionar roles y permisos'],
            ['nombre' => 'oficinas.gestionar', 'descripcion' => 'Gestionar oficinas'],
            ['nombre' => 'bitacoras.ver', 'descripcion' => 'Ver bitácoras del sistema'],
        ];

        $permisosCreados = [];
        foreach ($permisos as $permiso) {
            $permisosCreados[] = Permission::create($permiso);
        }

        // Asignar todos los permisos al administrador
        $admin->permissions()->attach(collect($permisosCreados)->pluck('id'));

        // Asignar permisos al supervisor
        $permisosSupervisor = Permission::whereIn('nombre', [
            'practicantes.ver',
            'practicantes.crear',
            'practicantes.editar',
            'asistencias.ver',
            'asistencias.validar',
            'actividades.ver',
            'actividades.validar',
            'reportes.ver',
            'reportes.exportar'
        ])->pluck('id');
        
        $supervisor->permissions()->attach($permisosSupervisor);

        // Asignar permisos al practicante
        $permisosPracticante = Permission::whereIn('nombre', [
            'asistencias.ver',
            'asistencias.crear',
            'actividades.ver',
            'actividades.crear'
        ])->pluck('id');
        
        $practicante->permissions()->attach($permisosPracticante);
    }
}