<?php

// =============================================================================
// app/Http/Resources/PracticanteResource.php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PracticanteResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user' => new UserResource($this->whenLoaded('user')),
            'universidad' => $this->universidad,
            'carrera' => $this->carrera,
            'semestre' => $this->semestre,
            'horas_requeridas' => $this->horas_requeridas,
            'horas_completadas' => $this->horas_completadas,
            'horas_restantes' => $this->horas_restantes,
            'porcentaje_avance' => $this->porcentaje_avance,
            'fecha_inicio' => $this->fecha_inicio,
            'fecha_fin' => $this->fecha_fin,
            'supervisor' => $this->supervisor ? [
                'id' => $this->supervisor->id,
                'nombre_completo' => $this->supervisor->nombre_completo
            ] : null,
            'observaciones' => $this->observaciones,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
