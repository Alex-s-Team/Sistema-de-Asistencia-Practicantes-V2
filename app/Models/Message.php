<?php
// app/Models/Message.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_id', 
        'user_id', 
        'content', 
        'attachment_path', 
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    protected $appends = ['attachment_type', 'attachment_url'];

    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Tipo de archivo adjunto
    public function getAttachmentTypeAttribute()
    {
        if (!$this->attachment_path) {
            return null;
        }
        
        $extension = strtolower(pathinfo($this->attachment_path, PATHINFO_EXTENSION));
        
        return match($extension) {
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg' => 'image',
            'pdf' => 'pdf',
            'doc', 'docx' => 'word',
            'xls', 'xlsx', 'csv' => 'excel',
            default => 'file'
        };
    }

    // URL completa del archivo adjunto
    public function getAttachmentUrlAttribute()
    {
        if (!$this->attachment_path) {
            return null;
        }
        
        return Storage::url($this->attachment_path);
    }

    // Scope para mensajes no leídos
    public function scopeUnreadForUser($query, $userId)
    {
        return $query->where('user_id', '!=', $userId)
                     ->where('is_read', false);
    }

    // Scope para mensajes de hoy
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    // Verificar si el mensaje tiene adjunto
    public function hasAttachment()
    {
        return !is_null($this->attachment_path);
    }
}