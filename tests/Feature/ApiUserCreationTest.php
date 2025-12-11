<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiUserCreationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function endpoint_crea_usuario_correctamente()
    {
        Sanctum::actingAs(
            User::factory()->create(['role' => 'admin'])
        );

        $response = $this->postJson('/api/users', [
            'name' => 'Luis Torres',
            'dni' => '87654321',
            'email' => 'luis@example.com',
            'password' => 'password123',
            'role' => 'staff',
            'gender' => 'masculino'
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['message', 'user']);
    }
}
