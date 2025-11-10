<?php
    // app/Models/QRToken.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QRToken extends Model
{
    use HasFactory;

    protected $table = 'qr_tokens';

    protected $fillable = [
        'token', 'expires_at', 'is_used', 'used_by', 'used_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'used_by');
    }

    public function isExpired()
    {
        return $this->expires_at < now();
    }

    public function isValid()
    {
        return !$this->is_used && !$this->isExpired();
    }
}

