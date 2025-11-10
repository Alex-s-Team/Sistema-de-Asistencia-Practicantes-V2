<?php

// app/Services/QRService.php
namespace App\Services;

use App\Models\QRToken;
use Illuminate\Support\Str;

class QRService
{
    protected $expirationSeconds;

    public function __construct()
    {
        $this->expirationSeconds = config('attendance.qr_refresh_seconds', 30);
    }

    public function generateToken()
    {
        // Limpiar tokens expirados
        $this->cleanExpiredTokens();

        $token = Str::random(64);

        $qrToken = QRToken::create([
            'token' => $token,
            'expires_at' => now()->addSeconds($this->expirationSeconds),
            'is_used' => false,
        ]);

        return $qrToken;
    }

    public function getCurrentToken()
    {
        // Buscar un token válido existente
        $currentToken = QRToken::where('is_used', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        // Si no existe o está por expirar (menos de 5 segundos), generar uno nuevo
        if (!$currentToken || $currentToken->expires_at->diffInSeconds(now()) < 5) {
            $currentToken = $this->generateToken();
        }

        return $currentToken;
    }

    public function validateToken($token)
    {
        $qrToken = QRToken::where('token', $token)->first();

        if (!$qrToken) {
            return ['valid' => false, 'message' => 'Token inválido'];
        }

        if ($qrToken->is_used) {
            return ['valid' => false, 'message' => 'Token ya utilizado'];
        }

        if ($qrToken->isExpired()) {
            return ['valid' => false, 'message' => 'Token expirado'];
        }

        return ['valid' => true, 'token' => $qrToken];
    }

    protected function cleanExpiredTokens()
    {
        QRToken::where('expires_at', '<', now()->subHour())->delete();
    }
}
