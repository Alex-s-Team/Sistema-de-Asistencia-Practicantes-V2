<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Attendance;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AttendanceDelayTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function calcula_retraso_correctamente()
    {
        $user = User::factory()->create([
            'entry_time' => '08:00:00'
        ]);

        $attendance = Attendance::factory()->make([
            'user_id' => $user->id,
            'entry_time' => '08:15:00'
        ]);

        $attendance->setRelation('user', $user);

        $delay = $attendance->calculateDelay();

        $this->assertEquals(15, $delay);
    }
}
