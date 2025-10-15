<?php

// ============================================================================
// ✅ app/Http/Middleware/VerifyCsrfToken.php (YA EXISTE)
namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Excluir rutas de API si es necesario
        // 'api/*', // ⚠️ NO necesario con Sanctum
    ];
}
