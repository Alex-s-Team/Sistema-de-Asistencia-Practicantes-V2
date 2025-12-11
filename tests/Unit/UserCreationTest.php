<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserCreationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function admin_puede_crear_usuarios()
    {
        // Crear usuario admin autenticado
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        Sanctum::actingAs($admin);

        $payload = [
            'name' => 'Juan Pérez',
            'dni' => '12345678',
            'email' => 'juan@example.com',
            'password' => 'password123',
            'role' => 'intern',
            'gender' => 'masculino'
        ];

        $response = $this->postJson('/api/users', $payload);

        $response->assertStatus(201)
                 ->assertJson([
                     'message' => 'Usuario creado exitosamente'
                 ]);

        $this->assertDatabaseHas('users', [
            'dni' => '12345678',
            'role' => 'intern'
        ]);
    }
}
