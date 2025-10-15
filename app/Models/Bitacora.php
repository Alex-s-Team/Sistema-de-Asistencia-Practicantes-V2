<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bitacora extends Model
{
    use HasFactory;

    protected $table = 'bitacoras';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'accion',
        'fecha'
    ];

    protected $casts = [
        'fecha' => 'datetime',
        'created_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public static function registrar($userId, $accion)
    {
        return static::create([
            'user_id' => $userId,
            'accion' => $accion,
            'fecha' => now()
        ]);
    }

    public function scopeRecientes($query, $limit = 50)
    {
        return $query->orderBy('fecha', 'desc')->limit($limit);
    }
}
