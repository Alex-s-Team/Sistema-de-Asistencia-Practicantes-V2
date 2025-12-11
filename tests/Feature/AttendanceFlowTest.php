<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Attendance;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AttendanceFlowTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function usuario_autenticado_puede_registrar_asistencia()
    {
        $user = User::factory()->create([
            'role' => 'intern',
            'entry_time' => '08:00:00'
        ]);

        Sanctum::actingAs($user);

        $payload = [
        'type' => 'entry',
        'entry_time' => '08:10:00',
        'latitude' => -12.0464,
        'longitude' => -77.0428,
        'qr_token' => 'TESTTOKEN123',
        'device_time' => now()->format('Y-m-d H:i:s'),
    ];


        $response = $this->postJson('/api/attendances', $payload);

        $response->assertStatus(201);

        $this->assertDatabaseHas('attendances', [
            'user_id' => $user->id,
        ]);
    }
}