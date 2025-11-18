<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\QRService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class QRController extends Controller
{
    protected $qrService;

    public function __construct(QRService $qrService)
    {
        $this->qrService = $qrService;
    }

    public function current(Request $request)
    {
        try {
            $user = $request->user();

            // IMPORTANTE: Solo admin y staff pueden GENERAR QR
            // Los practicantes solo lo ESCANEAN
            if ($user->isIntern()) {
                return response()->json([
                    'message' => 'Los practicantes no pueden generar códigos QR. Escanea el QR mostrado por tu supervisor.',
                ], 403);
            }

            if (!$user->canManageUsers()) {
                return response()->json([
                    'message' => 'No tienes permisos para generar códigos QR',
                ], 403);
            }

            $qrToken = $this->qrService->getCurrentToken();

            return response()->json([
                'token' => $qrToken->token,
                'qr_url' => $qrToken->qr_url,
                'expires_at' => $qrToken->expires_at->toISOString(),
                'seconds_remaining' => max(0, $qrToken->expires_at->diffInSeconds(now())),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in QRController@current:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al generar código QR',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function validate(Request $request)
    {
        try {
            $request->validate([
                'token' => 'required|string',
            ]);

            $result = $this->qrService->validateToken($request->token);

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Error in QRController@validate:', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error al validar token',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}