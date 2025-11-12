<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Chat;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Canal de presencia para cada chat
Broadcast::channel('chat.{chatId}', function ($user, $chatId) {
    // Verificar que el usuario sea parte del chat
    $chat = Chat::find($chatId);
    
    if (!$chat) {
        return false;
    }
    
    // El usuario debe ser participante del chat
    $isMember = $chat->users()->where('user_id', $user->id)->exists();
    
    if ($isMember) {
        // Retornar información del usuario para presencia
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ];
    }
    
    return false;
});

// Canal privado para notificaciones de usuario
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Canal de presencia general (opcional - para ver usuarios online)
Broadcast::channel('online', function ($user) {
    return [
        'id' => $user->id,
        'name' => $user->name,
    ];
});