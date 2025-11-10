<?php

// database/seeders/UserSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Device;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Admin
        $admin = User::create([
            'name' => 'Adrian Valer',
            'dni' => '40956781',
            'email' => 'adrian.valer@municipalidad.gob.pe',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'gender' => 'masculino',
            'phone' => '984788038',
            'position' => 'Ingeniero jefe de sistemas e infomática - Oficina de Tecnologías de la Información',
            'is_active' => true,
        ]);

        // Staff 1
        $staff1 = User::create([
            'name' => 'Gian Franco',
            'dni' => '73980928',
            'email' => 'gianfranco.tejada@municipalidad.gob.pe',
            'password' => Hash::make('staff123'),
            'role' => 'staff',
            'gender' => 'masculino',
            'phone' => '987654322',
            'position' => 'Ingeniero de sistemas e infomática',
            'is_active' => true,
        ]);

        // Staff 2
        $staff2 = User::create([
            'name' => 'Marcelo Vizcarra',
            'dni' => '70576281',
            'email' => 'marcelo.vizcarra@municipalidad.gob.pe',
            'password' => Hash::make('staff123'),
            'role' => 'staff',
            'gender' => 'masculino',
            'phone' => '987161526',
            'position' => 'Ingeniero de sistemas e infomática',
            'is_active' => true,
        ]);

        // Practicante 1
        $intern1 = User::create([
            'name' => 'Manuel Mamani',
            'dni' => '76412311',
            'email' => 'manuel.mamani@gmail.com',
            'password' => Hash::make('intern123'),
            'role' => 'intern',
            'gender' => 'masculino',
            'birth_date' => '2005-02-23',
            'age' => 20,
            'phone' => '997745372',
            'emergency_contact' => '997745372',
            'address' => 'Cerca al mercado Vinocanchon',
            'district' => 'San Jerónimo',
            'city' => 'Cusco',
            'university' => 'Universidad Andina',
            'semester' => '8vo',
            'position' => 'Practicante de Sistemas',
            'start_date' => '2025-08-18',
            'end_date' => '2025-12-31',
            'entry_time' => '09:00:00',
            'exit_time' => '13:00:00',
            'is_active' => true,
        ]);

        Device::create([
            'user_id' => $intern1->id,
            'device_name' => 'Laptop ASUS',
            'ip_address' => '192.168.50.238',
            'device_type' => 'laptop',
        ]);

        // Practicante 2
        $intern2 = User::create([
            'name' => 'Alex Leon',
            'dni' => '78016752',
            'email' => 'alex.leon@gmail.com',
            'password' => Hash::make('intern123'),
            'role' => 'intern',
            'gender' => 'masculino',
            'birth_date' => '2004-05-30',
            'age' => 21,
            'phone' => '946718455',
            'emergency_contact' => '946718455',
            'address' => 'APV Miraflores',
            'district' => 'San Jerónimo',
            'city' => 'Cusco',
            'university' => 'Universidad Andina',
            'semester' => '8vo',
            'position' => 'Practicante de Sistemas',
            'start_date' => '2025-08-18',
            'end_date' => '2025-12-31',
            'entry_time' => '09:00:00',
            'exit_time' => '13:00:00',
            'is_active' => true,
        ]);

        Device::create([
            'user_id' => $intern2->id,
            'device_name' => 'Laptop Lenovo',
            'ip_address' => '192.168.50.237',
            'device_type' => 'laptop',
        ]);

        // Practicante 3
        $intern3 = User::create([
            'name' => 'Edwin Machaca',
            'dni' => '75178979',
            'email' => 'edwin.machaca@gmail.com',
            'password' => Hash::make('intern123'),
            'role' => 'intern',
            'gender' => 'masculino',
            'birth_date' => '2004-03-19',
            'age' => 22,
            'phone' => '982904726',
            'emergency_contact' => '982904726',
            'address' => 'Cerca a la casa del ing Yhion',
            'district' => 'San Jerónimo',
            'city' => 'Cusco',
            'university' => 'Universidad Andina',
            'semester' => '9no',
            'position' => 'Practicante',
            'start_date' => '2025-09-10',
            'end_date' => '2025-12-31',
            'entry_time' => '09:00:00',
            'exit_time' => '13:00:00',
            'is_active' => true,
        ]);

        Device::create([
            'user_id' => $intern3->id,
            'device_name' => 'Laptop Legion',
            'ip_address' => '192.168.50.229',
            'device_type' => 'laptop',
        ]);

        // Practicante 4
        $intern4 = User::create([
            'name' => 'Elizabeth Lavilla',
            'dni' => '72306843',
            'email' => 'elizabeth.lavilla@gmail.com',
            'password' => Hash::make('intern123'),
            'role' => 'intern',
            'gender' => 'femenino',
            'birth_date' => '2005-08-21',
            'age' => 20,
            'phone' => '990179027',
            'emergency_contact' => '990179027',
            'address' => '5to de ttio',
            'district' => 'Wanchaq',
            'city' => 'Cusco',
            'university' => 'Universidad Continental',
            'semester' => '8vo',
            'position' => 'Practicante',
            'start_date' => '2025-09-03',
            'end_date' => '2025-12-31',
            'entry_time' => '09:00:00',
            'exit_time' => '13:00:00',
            'is_active' => true,
        ]);

        Device::create([
            'user_id' => $intern4->id,
            'device_name' => 'Laptop Lenovo',
            'ip_address' => '192.168.50.240',
            'device_type' => 'laptop',
        ]);

        Device::create([
            'user_id' => $intern4->id,
            'device_name' => 'Celular',
            'ip_address' => '192.168.50.6',
            'device_type' => 'phone',
        ]);

        $this->command->info('Usuarios creados exitosamente!');
        $this->command->info('Credenciales de prueba:');
        $this->command->info('Admin: 40956781 / admin123');
        $this->command->info('Staff: 73980928 / staff123');
        $this->command->info('76412311 / intern123');
    }
}