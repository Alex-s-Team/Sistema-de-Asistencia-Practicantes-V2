<?php
// database/seeders/UserSeeder.php
namespace Database\Seeders;

use App\Models\User;
use App\Models\Device;
use App\Models\Chat;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Admin
        $admin = User::create([
            'name' => 'Adrian Valer Bellota',
            'email' => 'adrian.valer@municipalidad.gob.pe',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'gender' => 'masculino',
            'position' => 'Ingeniero Jefe a cargo de la Oficina de Tecnologías de la Información',
            'phone' => '999888777',
            'is_active' => true,
        ]);
        $admin->assignRole('admin');

        // Staff 1
        $staff1 = User::create([
            'name' => 'Marcelo Vizcarra',
            'email' => 'marcelo.vizcarra@municipalidad.gob.pe',
            'password' => Hash::make('staff123'),
            'role' => 'staff',
            'gender' => 'masculino',
            'position' => 'Analista de Sistemas',
            'phone' => '987654321',
            'address' => 'Av. Los Incas 456',
            'district' => 'San Jerónimo',
            'city' => 'Cusco',
            'is_active' => true,
        ]);
        $staff1->assignRole('staff');

        // Staff 2
        $staff2 = User::create([
            'name' => 'Gianfranco Tejada',
            'email' => 'gianfranco.tejada@municipalidad.gob.pe',
            'password' => Hash::make('staff123'),
            'role' => 'staff',
            'gender' => 'masculino',
            'position' => 'Especialista en Redes',
            'phone' => '987654322',
            'address' => 'Jr. Saphy 789',
            'district' => 'Cusco',
            'city' => 'Cusco',
            'is_active' => true,
        ]);
        $staff2->assignRole('staff');

        // Practicante 1
        $intern1 = User::create([
            'name' => 'Manuel Cuchuyrumi',
            'email' => 'manuel.cuchuyrumi@gmail.com',
            'password' => Hash::make('intern123'),
            'role' => 'intern',
            'gender' => 'masculino',
            'birth_date' => '2005-02-21',
            'age' => 20,
            'phone' => '987456321',
            'emergency_contact' => '999966574',
            'address' => 'APV Miraflores Mz A Lt 9',
            'district' => 'San Jerónimo',
            'city' => 'Cusco',
            'university' => 'Universidad Andina del Cusco',
            'semester' => '8vo',
            'start_date' => '2025-09-11',
            'end_date' => '2025-12-11',
            'entry_time' => '09:00:00',
            'exit_time' => '13:00:00',
            'is_active' => true,
        ]);
        $intern1->assignRole('intern');

        // Dispositivo de practicante 1
        Device::create([
            'user_id' => $intern1->id,
            'device_name' => 'Laptop ASUS',
            'ip_address' => '192.168.50.236',
            'device_type' => 'laptop',
            'is_primary' => true,
        ]);

        // Practicante 2
        $intern2 = User::create([
            'name' => 'Alex Leon',
            'email' => 'alex.leon@gmail.com',
            'password' => Hash::make('intern123'),
            'role' => 'intern',
            'gender' => 'masculino',
            'birth_date' => '2004-02-21',
            'age' => 21,
            'phone' => '987451321',
            'emergency_contact' => '990966574',
            'address' => 'APV Miraflores Mz A Lt 8',
            'district' => 'San Jerónimo',
            'city' => 'Cusco',
            'university' => 'Universidad Andina del Cusco',
            'semester' => '8vo',
            'start_date' => '2025-09-11',
            'end_date' => '2025-12-11',
            'entry_time' => '09:00:00',
            'exit_time' => '13:00:00',
            'is_active' => true,
        ]);
        $intern2->assignRole('intern');

        Device::create([
            'user_id' => $intern2->id,
            'device_name' => 'Laptop Lenovo',
            'ip_address' => '192.168.50.237',
            'device_type' => 'laptop',
            'is_primary' => true,
        ]);

        // Practicante 3
        $intern3 = User::create([
            'name' => 'Carlos Mamani',
            'email' => 'carlos.mamani@gmail.com',
            'password' => Hash::make('intern123'),
            'role' => 'intern',
            'gender' => 'masculino',
            'birth_date' => '2003-02-21',
            'age' => 22,
            'phone' => '987451121',
            'emergency_contact' => '910966574',
            'address' => 'APV La Caleta Mz A Lt 8',
            'district' => 'Santiago',
            'city' => 'Cusco',
            'university' => 'Universidad Andina del Cusco',
            'semester' => '9no',
            'start_date' => '2025-09-11',
            'end_date' => '2025-11-11',
            'entry_time' => '08:00:00',
            'exit_time' => '13:00:00',
            'is_active' => true,
        ]);
        $intern3->assignRole('intern');

        Device::create([
            'user_id' => $intern3->id,
            'device_name' => 'Laptop Legion',
            'ip_address' => '192.168.50.8',
            'device_type' => 'laptop',
            'is_primary' => true,
        ]);

        // Practicante 4
        $intern4 = User::create([
            'name' => 'Elizabeth Lavilla',
            'email' => 'elizabeth.lavilla@gmail.com',
            'password' => Hash::make('intern123'),
            'role' => 'intern',
            'gender' => 'femenino',
            'birth_date' => '2005-08-21',
            'age' => 19,
            'phone' => '987451311',
            'emergency_contact' => '990966570',
            'address' => 'Calle Perú 234',
            'district' => 'Wánchaq',
            'city' => 'Cusco',
            'university' => 'Universidad Continental',
            'semester' => '8vo',
            'start_date' => '2025-09-11',
            'end_date' => '2025-12-11',
            'entry_time' => '08:00:00',
            'exit_time' => '13:00:00',
            'is_active' => true,
        ]);
        $intern4->assignRole('intern');

        Device::create([
            'user_id' => $intern4->id,
            'device_name' => 'Laptop Lenovo',
            'ip_address' => '192.168.50.240',
            'device_type' => 'laptop',
            'is_primary' => true,
        ]);

        Device::create([
            'user_id' => $intern4->id,
            'device_name' => 'Celular Personal',
            'ip_address' => '192.168.50.6',
            'device_type' => 'phone',
            'is_primary' => false,
        ]);

        // Crear chat público
        $publicChat = Chat::create([
            'name' => 'Chat General - Oficina TI',
            'type' => 'public',
        ]);

        // Agregar a todos los usuarios al chat público
        $allUsers = User::all();
        foreach ($allUsers as $user) {
            $publicChat->users()->attach($user->id);
        }

        $this->command->info('✅ Usuarios creados exitosamente:');
        $this->command->info('👤 Admin: adrian.valer@municipalidad.gob.pe / admin123');
        $this->command->info('👤 Staff: marcelo.vizcarra@municipalidad.gob.pe / staff123');
        $this->command->info('👤 Staff: gianfranco.tejada@municipalidad.gob.pe / staff123');
        $this->command->info('👤 Practicante: manuel.cuchuyrumi@gmail.com / intern123');
        $this->command->info('👤 Practicante: alex.leon@gmail.com / intern123');
        $this->command->info('👤 Practicante: carlos.mamani@gmail.com / intern123');
        $this->command->info('👤 Practicante: elizabeth.lavilla@gmail.com / intern123');

        
    }
}


