<?php

// =============================================================================
// app/Http/Middleware/CheckPermission.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
    public function handle(Request $request, Closure $next, $permission)
    {
        if (!$request->user()->hasPermission($permission)) {
            return response()->json([
                'error' => 'No tienes permiso para realizar esta acción'
            ], 403);
        }

        return $next($request);
    }
}