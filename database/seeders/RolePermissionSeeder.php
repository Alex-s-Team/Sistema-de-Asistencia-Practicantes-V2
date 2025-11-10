<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Crear permisos
        $permissions = [
            // Asistencias
            'mark-attendance',
            'view-own-attendance',
            'view-all-attendance',
            'validate-attendance',
            
            // Usuarios
            'create-user',
            'edit-user',
            'delete-user',
            'view-users',
            
            // Tareas
            'create-task',
            'edit-task',
            'delete-task',
            'view-tasks',
            'assign-task',
            
            // Justificaciones
            'create-justification',
            'view-own-justifications',
            'view-all-justifications',
            'approve-justification',
            
            // Chat
            'use-chat',
            'create-private-chat',
            
            // Reportes
            'view-reports',
            'export-reports',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Crear roles y asignar permisos
        
        // Role: Admin
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        // Role: Staff
        $staffRole = Role::create(['name' => 'staff']);
        $staffRole->givePermissionTo([
            'view-own-attendance',
            'view-all-attendance',
            'create-user',
            'edit-user',
            'view-users',
            'create-task',
            'edit-task',
            'delete-task',
            'view-tasks',
            'assign-task',
            'view-all-justifications',
            'use-chat',
            'create-private-chat',
            'view-reports',
        ]);

        // Role: Intern
        $internRole = Role::create(['name' => 'intern']);
        $internRole->givePermissionTo([
            'mark-attendance',
            'view-own-attendance',
            'view-tasks',
            'create-justification',
            'view-own-justifications',
            'use-chat',
        ]);
    }
}
