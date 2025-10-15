<?php

// ✅ app/Http/Middleware/TrimStrings.php (YA EXISTE - Laravel 10)
// ⚠️ En Laravel 11 se movió a bootstrap/app.php
namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\TrimStrings as Middleware;

class TrimStrings extends Middleware
{
    /**
     * The names of the attributes that should not be trimmed.
     *
     * @var array<int, string>
     */
    protected $except = [
        'contraseña',
        'password',
        'password_confirmation',
    ];
}
