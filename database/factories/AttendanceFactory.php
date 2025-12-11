<?php

namespace Database\Factories;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceFactory extends Factory
{
    protected $model = Attendance::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'date' => now()->toDateString(),
            'entry_time' => '08:00:00',
            'exit_time' => null,
            'entry_ip' => $this->faker->ipv4(),
            'entry_device' => 'laptop',
            'entry_latitude' => -12.0464,
            'entry_longitude' => -77.0428,
            'is_remote_entry' => false,
            'status' => 'pending',
        ];
    }
}
