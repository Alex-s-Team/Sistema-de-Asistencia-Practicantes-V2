<?php

// app/Models/Oficina.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Oficina extends Model
{
    use HasFactory;

    protected $table = 'oficinas';

    protected $fillable = [
        'nombre',
        'descripcion',
        'estado'
    ];

    protected $casts = [
        'estado' => 'string'
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'oficina_id');
    }

    public function scopeActivas($query)
    {
        return $query->where('estado', 'activo');
    }
}
