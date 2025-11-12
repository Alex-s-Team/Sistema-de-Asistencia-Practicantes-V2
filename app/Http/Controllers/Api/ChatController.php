<?php

// app/Http/Controllers/Api/ChatController.php
namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Events\UserTyping;
use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    /**
     * Listar todos los chats del usuario autenticado
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            $chats = $user->chats()
                ->with(['users:id,name,email', 'messages' => function($query) {
                    $query->latest()->limit(1)->with('user:id,name');
                }])
                ->withCount(['messages as unread_count' => function($query) use ($user) {
                    $query->where('user_id', '!=', $user->id)
                          ->where('created_at', '>', function($q) use ($user) {
                              $q->select('last_read_at')
                                ->from('chat_user')
                                ->where('user_id', $user->id)
                                ->whereColumn('chat_id', 'messages.chat_id')
                                ->limit(1);
                          })
                          ->orWhereNull(DB::raw('(SELECT last_read_at FROM chat_user WHERE user_id = '.$user->id.' AND chat_id = messages.chat_id LIMIT 1)'));
                }])
                ->orderBy('updated_at', 'desc')
                ->get()
                ->map(function($chat) use ($user) {
                    // Para chats privados, obtener el otro usuario
                    if ($chat->type === 'private') {
                        $chat->other_user = $chat->users->firstWhere('id', '!=', $user->id);
                    }
                    return $chat;
                });

            return response()->json($chats);
        } catch (\Exception $e) {
            Log::error('Error in ChatController@index:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al obtener chats',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Crear un nuevo chat
     */
    public function store(Request $request)
    {
        try {
            Log::info('🧾 Datos recibidos para crear chat:', $request->all());

            if ($request->has('participants') && is_string($request->participants)) {
    $request->merge([
        'participants' => json_decode($request->participants, true)
    ]);
}

$validated = $request->validate([
    'type' => 'required|in:private,public',
    'name' => 'required_if:type,public|string|max:255|nullable',
    'participants' => 'required_if:type,private|array',
    'participants.*' => 'integer|exists:users,id',
]);

            DB::beginTransaction();

            $user = $request->user();

            // Para chat privado, verificar si ya existe
            if ($validated['type'] === 'private') {
                if (empty($validated['participants']) || count($validated['participants']) === 0) {
                    return response()->json([
                        'message' => 'Debes especificar al menos un participante para chat privado'
                    ], 422);
                }

                $otherUserId = $validated['participants'][0];
                
                // Verificar que no sea consigo mismo
                if ($otherUserId == $user->id) {
                    return response()->json([
                        'message' => 'No puedes crear un chat contigo mismo'
                    ], 422);
                }

                // Buscar chat privado existente
                $existingChat = Chat::where('type', 'private')
                    ->whereHas('users', function($q) use ($user) {
                        $q->where('user_id', $user->id);
                    })
                    ->whereHas('users', function($q) use ($otherUserId) {
                        $q->where('user_id', $otherUserId);
                    })
                    ->first();

                if ($existingChat) {
                    DB::commit();
                    return response()->json([
                        'message' => 'Chat ya existe',
                        'chat' => $existingChat->load(['users', 'messages']),
                    ]);
                }
            }

            // Crear el chat
            $chat = Chat::create([
                'type' => $validated['type'],
                'name' => $validated['name'] ?? null,
            ]);

            // Agregar participantes
            if ($validated['type'] === 'private') {
                $participants = array_unique(array_merge([$user->id], $validated['participants']));
            } else {
                // Chat público: solo agregar al creador inicialmente
                $participants = [$user->id];
            }

            foreach ($participants as $participantId) {
                $chat->users()->attach($participantId, ['last_read_at' => now()]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Chat creado exitosamente',
                'chat' => $chat->load(['users', 'messages']),
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Datos de validación incorrectos',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in ChatController@store:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al crear chat',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor',
            ], 500);
        }
    }

    /**
     * Obtener un chat específico
     */
    public function show($id)
    {
        try {
            $user = request()->user();

            $chat = Chat::with(['users:id,name,email', 'messages.user:id,name'])
                ->whereHas('users', function($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->findOrFail($id);

            // Para chats privados, incluir el otro usuario
            if ($chat->type === 'private') {
                $chat->other_user = $chat->users->firstWhere('id', '!=', $user->id);
            }

            // Actualizar last_read_at
            $chat->users()->updateExistingPivot($user->id, [
                'last_read_at' => now()
            ]);

            return response()->json($chat);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Chat no encontrado',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error in ChatController@show:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al obtener chat',
            ], 500);
        }
    }

    /**
     * Unirse a un chat público
     */
    public function join($id)
    {
        try {
            $user = request()->user();
            
            $chat = Chat::findOrFail($id);

            if ($chat->type !== 'public') {
                return response()->json([
                    'message' => 'Solo puedes unirte a chats públicos'
                ], 403);
            }

            // Verificar si ya es miembro
            if ($chat->users()->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'message' => 'Ya eres miembro de este chat'
                ], 400);
            }

            $chat->users()->attach($user->id, ['last_read_at' => now()]);

            return response()->json([
                'message' => 'Te has unido al chat exitosamente',
                'chat' => $chat->load('users')
            ]);

        } catch (\Exception $e) {
            Log::error('Error in ChatController@join:', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error al unirse al chat'
            ], 500);
        }
    }

    /**
     * Salir de un chat
     */
    public function leave($id)
    {
        try {
            $user = request()->user();
            
            $chat = Chat::findOrFail($id);

            if (!$chat->users()->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'message' => 'No eres miembro de este chat'
                ], 400);
            }

            $chat->users()->detach($user->id);

            return response()->json([
                'message' => 'Has salido del chat exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error in ChatController@leave:', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error al salir del chat'
            ], 500);
        }
    }

    /**
     * Obtener mensajes de un chat con paginación
     */
    public function getMessages($id, Request $request)
    {
        try {
            $user = $request->user();

            $chat = Chat::whereHas('users', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->findOrFail($id);

            $perPage = $request->get('per_page', 50);
            $page = $request->get('page', 1);

            $messages = Message::where('chat_id', $chat->id)
                ->with('user:id,name,email')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return response()->json($messages);
        } catch (\Exception $e) {
            Log::error('Error in ChatController@getMessages:', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error al obtener mensajes',
            ], 500);
        }
    }

    /**
     * Enviar un mensaje
     */
    public function sendMessage(Request $request, $id)
    {
        try {
            $user = $request->user();

            $chat = Chat::whereHas('users', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->findOrFail($id);

            $validator = Validator::make($request->all(), [
                'content' => 'required_without:attachment|string|max:5000',
                'attachment' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validación fallida',
                    'errors' => $validator->errors()
                ], 422);
            }

            $attachmentPath = null;

            // Manejar archivo adjunto
            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $attachmentPath = $file->store('chat-attachments', 'public');
            }

            // Crear mensaje
            $message = Message::create([
                'chat_id' => $chat->id,
                'user_id' => $user->id,
                'content' => $request->content ?? '',
                'attachment_path' => $attachmentPath,
            ]);

            // Actualizar timestamp del chat
            $chat->touch();

            // Cargar relación de usuario
            $message->load('user:id,name,email');

            // Broadcast del mensaje en tiempo real
            broadcast(new MessageSent($message))->toOthers();

            return response()->json([
                'message' => 'Mensaje enviado',
                'data' => $message,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error in ChatController@sendMessage:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al enviar mensaje',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Marcar chat como leído
     */
    public function markAsRead($id)
    {
        try {
            $user = request()->user();

            $chat = Chat::whereHas('users', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->findOrFail($id);

            $chat->users()->updateExistingPivot($user->id, [
                'last_read_at' => now()
            ]);

            return response()->json([
                'message' => 'Chat marcado como leído'
            ]);

        } catch (\Exception $e) {
            Log::error('Error in ChatController@markAsRead:', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error al marcar como leído'
            ], 500);
        }
    }

    /**
     * Indicador de "escribiendo..."
     */
    public function typing($id)
    {
        try {
            $user = request()->user();

            $chat = Chat::whereHas('users', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->findOrFail($id);

            // Broadcast del evento de typing
            broadcast(new UserTyping($chat->id, $user))->toOthers();

            return response()->json([
                'message' => 'Typing event sent'
            ]);

        } catch (\Exception $e) {
            Log::error('Error in ChatController@typing:', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error al enviar evento'
            ], 500);
        }
    }

    /**
     * Buscar usuarios para crear chat privado
     */
    public function searchUsers(Request $request)
    {
        try {
            $query = $request->get('query', '');
            $user = $request->user();

            if (strlen($query) < 2) {
                return response()->json([]);
            }

            $users = User::where('id', '!=', $user->id)
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                      ->orWhere('email', 'like', "%{$query}%")
                      ->orWhere('dni', 'like', "%{$query}%");
                })
                ->select('id', 'name', 'email', 'dni')
                ->limit(10)
                ->get();

            return response()->json($users);

        } catch (\Exception $e) {
            Log::error('Error in ChatController@searchUsers:', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error al buscar usuarios'
            ], 500);
        }
    }

    /**
     * Listar chats públicos disponibles
     */
    public function publicChats()
    {
        try {
            $chats = Chat::where('type', 'public')
                ->with(['users:id,name'])
                ->withCount('users')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($chats);

        } catch (\Exception $e) {
            Log::error('Error in ChatController@publicChats:', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error al obtener chats públicos'
            ], 500);
        }
    }
}