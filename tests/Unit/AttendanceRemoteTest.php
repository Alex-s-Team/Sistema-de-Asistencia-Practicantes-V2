<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Attendance;

class AttendanceRemoteTest extends TestCase
{
    /** @test */
    public function detecta_si_asistencia_es_remota()
    {
        $attendance = new Attendance([
            'is_remote_entry' => true,
            'is_remote_exit' => false
        ]);

        $this->assertTrue($attendance->isRemote());
    }
}
