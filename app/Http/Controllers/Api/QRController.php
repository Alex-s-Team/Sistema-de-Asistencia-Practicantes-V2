<?php

// app/Http/Controllers/Api/QRController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\QRService;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QRController extends Controller
{
    protected $qrService;

    public function __construct(QRService $qrService)
    {
        $this->qrService = $qrService;
    }

    public function current(Request $request)
    {
        $user = $request->user();

        // Solo admin y staff pueden generar QR
        if (!$user->canManageUsers()) {
            return response()->json([
                'message' => 'No tienes permisos para generar códigos QR',
            ], 403);
        }

        $qrToken = $this->qrService->getCurrentToken();

        // Generar imagen QR en base64
        $qrImage = base64_encode(
            QrCode::format('png')
                ->size(300)
                ->generate($qrToken->token)
        );

        return response()->json([
            'token' => $qrToken->token,
            'expires_at' => $qrToken->expires_at,
            'seconds_remaining' => $qrToken->expires_at->diffInSeconds(now()),
            'qr_image' => 'data:image/png;base64,' . $qrImage,
        ]);
    }

    public function validate(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $result = $this->qrService->validateToken($request->token);

        return response()->json($result);
    }
}
