<?php
// =============================================================================
// database/seeders/OficinaSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Oficina;

class OficinaSeeder extends Seeder
{
    public function run(): void
    {
        $oficinas = [
            [
                'nombre' => 'Oficina de Tecnologías de la Información',
                'descripcion' => 'Gestión de sistemas y desarrollo de software',
                'estado' => 'activo'
            ],
            [
                'nombre' => 'Oficina de Recursos Humanos',
                'descripcion' => 'Gestión del personal y talento humano',
                'estado' => 'activo'
            ],
            [
                'nombre' => 'Oficina de Contabilidad',
                'descripcion' => 'Control financiero y contable',
                'estado' => 'activo'
            ],
            [
                'nombre' => 'Oficina de Marketing',
                'descripcion' => 'Estrategias de marketing y comunicación',
                'estado' => 'activo'
            ]
        ];

        foreach ($oficinas as $oficina) {
            Oficina::create($oficina);
        }
    }
}