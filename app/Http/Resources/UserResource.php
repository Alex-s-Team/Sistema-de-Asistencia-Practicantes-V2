<?php

// =============================================================================
// app/Http/Resources/UserResource.php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'nombres' => $this->nombres,
            'apellido_paterno' => $this->apellido_paterno,
            'apellido_materno' => $this->apellido_materno,
            'nombre_completo' => $this->nombre_completo,
            'correo' => $this->correo,
            'telefono' => $this->telefono,
            'direccion' => $this->direccion,
            'estado' => $this->estado,
            'fecha_registro' => $this->fecha_registro,
            'rol' => [
                'id' => $this->role->id,
                'nombre' => $this->role->nombre
            ],
            'oficina' => $this->oficina ? [
                'id' => $this->oficina->id,
                'nombre' => $this->oficina->nombre
            ] : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
