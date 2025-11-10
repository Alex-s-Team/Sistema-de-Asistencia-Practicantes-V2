<?php

// app/Http/Controllers/Api/ChatController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            $chats = $user->chats()
                ->with(['users', 'messages' => function($query) {
                    $query->latest()->limit(1);
                }])
                ->withCount(['messages as unread_count' => function($query) use ($user) {
                    $query->where('user_id', '!=', $user->id)
                          ->where('created_at', '>', function($q) use ($user) {
                              $q->select('last_read_at')
                                ->from('chat_user')
                                ->where('user_id', $user->id)
                                ->whereColumn('chat_id', 'messages.chat_id');
                          });
                }])
                ->orderBy('updated_at', 'desc')
                ->get();

            return response()->json($chats);
        } catch (\Exception $e) {
            Log::error('Error in ChatController@index:', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error al obtener chats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'type' => 'required|in:private,group',
                'name' => 'required_if:type,group|string|max:255',
                'participants' => 'required|array|min:1',
                'participants.*' => 'integer|exists:users,id',
            ]);

            DB::beginTransaction();

            $user = $request->user();

            // Verificar si ya existe un chat privado con ese usuario
            if ($validated['type'] === 'private' && count($validated['participants']) === 1) {
                $otherUserId = $validated['participants'][0];
                
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

            $chat = Chat::create([
                'type' => $validated['type'],
                'name' => $validated['name'] ?? null,
            ]);

            // Agregar participantes (incluyendo al creador)
            $participants = array_unique(array_merge([$user->id], $validated['participants']));
            $chat->users()->attach($participants, ['last_read_at' => now()]);

            DB::commit();

            return response()->json([
                'message' => 'Chat creado exitosamente',
                'chat' => $chat->load(['users', 'messages']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in ChatController@store:', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error al crear chat',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $user = request()->user();

            $chat = Chat::with(['users', 'messages.user'])
                ->whereHas('users', function($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->findOrFail($id);

            // Actualizar last_read_at
            $chat->users()->updateExistingPivot($user->id, [
                'last_read_at' => now()
            ]);

            return response()->json($chat);
        } catch (\Exception $e) {
            Log::error('Error in ChatController@show:', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'Chat no encontrado',
            ], 404);
        }
    }

    public function sendMessage(Request $request, $id)
    {
        try {
            $user = $request->user();

            $chat = Chat::whereHas('users', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->findOrFail($id);

            $validated = $request->validate([
                'content' => 'required|string',
            ]);

            $message = Message::create([
                'chat_id' => $chat->id,
                'user_id' => $user->id,
                'content' => $validated['content'],
            ]);

            // Actualizar timestamp del chat
            $chat->touch();

            return response()->json([
                'message' => 'Mensaje enviado',
                'data' => $message->load('user'),
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error in ChatController@sendMessage:', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error al enviar mensaje',
            ], 500);
        }
    }

    public function getMessages($id)
    {
        try {
            $user = request()->user();

            $chat = Chat::whereHas('users', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->findOrFail($id);

            $messages = Message::where('chat_id', $chat->id)
                ->with('user')
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json($messages);
        } catch (\Exception $e) {
            Log::error('Error in ChatController@getMessages:', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error al obtener mensajes',
            ], 500);
        }
    }
}