<?php
// app/Http/Controllers/Api/ChatController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $chats = $user->chats()
            ->with(['users', 'latestMessage.user'])
            ->get();

        return response()->json($chats);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'type' => 'required|in:public,private',
            'name' => 'required_if:type,private|string|max:255',
            'user_ids' => 'required_if:type,private|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $chat = Chat::create([
            'name' => $validated['name'] ?? 'Chat Público',
            'type' => $validated['type'],
        ]);

        if ($validated['type'] === 'private') {
            $userIds = array_merge($validated['user_ids'], [$user->id]);
            $chat->users()->attach(array_unique($userIds));
        } else {
            // Chat público: agregar todos
            $allUserIds = \App\Models\User::where('is_active', true)->pluck('id');
            $chat->users()->attach($allUserIds);
        }

        return response()->json([
            'message' => 'Chat creado exitosamente',
            'chat' => $chat->load('users'),
        ], 201);
    }

    public function show($id)
    {
        $chat = Chat::with(['users', 'messages.user'])->findOrFail($id);

        return response()->json($chat);
    }

    public function sendMessage(Request $request, $id)
    {
        $user = $request->user();
        $chat = Chat::findOrFail($id);

        // Verificar que el usuario pertenece al chat
        if (!$chat->users->contains($user->id)) {
            return response()->json([
                'message' => 'No tienes acceso a este chat',
            ], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
        ]);

        $attachmentPath = null;

        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('chat-attachments', 'public');
        }

        $message = Message::create([
            'chat_id' => $chat->id,
            'user_id' => $user->id,
            'content' => $validated['content'],
            'attachment_path' => $attachmentPath,
        ]);

        return response()->json([
            'message' => 'Mensaje enviado',
            'data' => $message->load('user'),
        ], 201);
    }

    public function getMessages(Request $request, $id)
    {
        $user = $request->user();
        $chat = Chat::findOrFail($id);

        // Verificar que el usuario pertenece al chat
        if (!$chat->users->contains($user->id)) {
            return response()->json([
                'message' => 'No tienes acceso a este chat',
            ], 403);
        }

        $messages = $chat->messages()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json($messages);
    }
}
