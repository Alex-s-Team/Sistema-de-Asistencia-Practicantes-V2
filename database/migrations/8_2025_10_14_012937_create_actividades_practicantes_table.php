<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('actividades_practicantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asistencia_id')->constrained('asistencias')->onDelete('cascade');
            $table->text('descripcion')->comment('Descripción detallada de la actividad realizada');
            $table->time('hora')->nullable()->comment('Hora aproximada de la actividad');
            $table->enum('estado', ['pendiente', 'validada', 'observada'])->default('pendiente');
            $table->string('observaciones', 255)->nullable();
            $table->foreignId('validado_por')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actividades_practicantes');
    }
};

