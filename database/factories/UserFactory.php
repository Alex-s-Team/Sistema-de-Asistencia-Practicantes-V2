<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'dni' => str_pad($this->faker->unique()->numberBetween(10000000, 99999999), 8, '0', STR_PAD_LEFT),

            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),

            'password' => static::$password ??= Hash::make('password123'),
            'remember_token' => Str::random(10),

            // Campos extra de tu modelo:
            'role' => 'intern',
            'gender' => 'masculino',
            'entry_time' => '08:00:00',
            'exit_time' => '17:00:00',
            'is_active' => true,
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn () => [
            'email_verified_at' => null,
        ]);
    }
}
