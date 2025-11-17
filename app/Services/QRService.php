<?php

namespace App\Services;

use App\Models\QRToken;
use Illuminate\Support\Str;
use Carbon\Carbon;

class QRService
{
    /**
     * Obtener o generar el token QR actual
     */
    public function getCurrentToken()
    {
        // Buscar token válido existente
        $token = QRToken::where('expires_at', '>', now())
            ->where('is_used', false)
            ->first();

        // Si no existe o está por expirar (menos de 5 segundos), generar nuevo
        if (!$token || $token->expires_at->diffInSeconds(now()) < 5) {
            $token = $this->generateNewToken();
        }

        return $token;
    }

    /**
     * Generar un nuevo token QR
     */
    public function generateNewToken()
    {
        // Invalidar tokens anteriores
        QRToken::where('expires_at', '>', now())
            ->update(['is_used' => true]);

        // Generar nuevo token único
        $tokenString = Str::random(32) . '-' . time();
        
        // Crear URL completa para el QR
        $qrUrl = config('app.url') . '/mark-attendance?token=' . $tokenString;

        // Crear registro en BD
        $token = QRToken::create([
            'token' => $tokenString,
            'qr_url' => $qrUrl,
            'expires_at' => now()->addSeconds(config('attendance.qr_refresh_seconds', 30)),
            'is_used' => false,
        ]);

        return $token;
    }

    /**
     * Validar un token QR
     */
    public function validateToken($tokenString)
    {
        $token = QRToken::where('token', $tokenString)
            ->where('is_used', false)
            ->first();

        if (!$token) {
            return [
                'valid' => false,
                'message' => 'Token no válido',
            ];
        }

        if ($token->expires_at < now()) {
            return [
                'valid' => false,
                'message' => 'El código QR ha expirado. Solicita uno nuevo.',
            ];
        }

        // Marcar como usado
        $token->update(['is_used' => true]);

        return [
            'valid' => true,
            'message' => 'Token válido',
            'token' => $token,
        ];
    }

    /**
     * Limpiar tokens expirados (ejecutar en cron job)
     */
    public function cleanExpiredTokens()
    {
        QRToken::where('expires_at', '<', now()->subHour())
            ->delete();
    }
}