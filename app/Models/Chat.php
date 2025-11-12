<?php
// app/Models/Chat.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'type'];

    protected $appends = ['unread_count'];

    public function users()
    {
        return $this->belongsToMany(User::class)
            ->withPivot('last_read_at')
            ->withTimestamps();
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function isPublic()
    {
        return $this->type === 'public';
    }

    public function isPrivate()
    {
        return $this->type === 'private';
    }

    // Obtener el otro usuario en un chat privado
    public function getOtherUser($currentUserId)
    {
        if ($this->isPublic()) {
            return null;
        }
        
        return $this->users()->where('user_id', '!=', $currentUserId)->first();
    }

    // Contar mensajes no leídos para un usuario específico
    public function unreadCountForUser($userId)
    {
        $userPivot = $this->users()->where('user_id', $userId)->first();
        
        if (!$userPivot) {
            return 0;
        }

        $lastReadAt = $userPivot->pivot->last_read_at;
        
        return $this->messages()
            ->where('user_id', '!=', $userId)
            ->when($lastReadAt, fn($q) => $q->where('created_at', '>', $lastReadAt))
            ->count();
    }

    // Atributo virtual para el usuario autenticado
    public function getUnreadCountAttribute()
    {
        if (!auth()->check()) {
            return 0;
        }
        
        return $this->unreadCountForUser(auth()->id());
    }

    // Marcar chat como leído para un usuario
    public function markAsReadForUser($userId)
    {
        $this->users()->updateExistingPivot($userId, [
            'last_read_at' => now()
        ]);
    }

    // Verificar si el usuario es participante del chat
    public function hasUser($userId)
    {
        return $this->users()->where('user_id', $userId)->exists();
    }

    // Scope para chats del usuario
    public function scopeForUser($query, $userId)
    {
        return $query->whereHas('users', function($q) use ($userId) {
            $q->where('user_id', $userId);
        });
    }
}