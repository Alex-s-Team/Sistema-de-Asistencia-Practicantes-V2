<?php
// app/Http/Controllers/Api/JustificationController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Justification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class JustificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Justification::with(['user', 'reviewer']);

        if ($user->isIntern()) {
            $query->where('user_id', $user->id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $justifications = $query->orderBy('date', 'desc')
                               ->paginate($request->get('per_page', 15));

        return response()->json($justifications);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'type' => 'required|in:absence,delay,early_exit',
            'date' => 'required|date',
            'reason' => 'required|string|min:10',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $documentPath = null;

        if ($request->hasFile('document')) {
            $documentPath = $request->file('document')->store('justifications', 'public');
        }

        $justification = Justification::create([
            'user_id' => $user->id,
            'type' => $validated['type'],
            'date' => $validated['date'],
            'reason' => $validated['reason'],
            'document_path' => $documentPath,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Justificación enviada exitosamente',
            'justification' => $justification->load('user'),
        ], 201);
    }

    public function review(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->canManageUsers()) {
            return response()->json([
                'message' => 'No tienes permisos para revisar justificaciones',
            ], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'review_notes' => 'nullable|string',
        ]);

        $justification = Justification::findOrFail($id);

        $justification->update([
            'status' => $validated['status'],
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
            'review_notes' => $validated['review_notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Justificación revisada exitosamente',
            'justification' => $justification->load(['user', 'reviewer']),
        ]);
    }

    public function pending(Request $request)
    {
        $user = $request->user();

        if (!$user->canManageUsers()) {
            return response()->json([
                'message' => 'No tienes permisos para ver justificaciones pendientes',
            ], 403);
        }

        $pending = Justification::with(['user'])
            ->where('status', 'pending')
            ->orderBy('date', 'desc')
            ->get();

        return response()->json($pending);
    }
}
