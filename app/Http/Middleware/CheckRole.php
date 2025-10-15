<?php

// ============================================================================
// app/Http/Middleware/CheckRole.php - MIDDLEWARE PERSONALIZADO (OPCIONAL)
// ============================================================================
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!$request->user() || $request->user()->role->nombre !== $role) {
            return response()->json([
                'message' => 'No tienes permiso para acceder a este recurso'
            ], 403);
        }

        return $next($request);
    }
}
