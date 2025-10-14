<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asistencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('practicante_id')->constrained('practicantes')->onDelete('cascade');
            $table->date('fecha');
            $table->time('hora_entrada');
            $table->time('hora_max_entrada')->comment('Hora límite antes de marcar tardanza');
            $table->time('hora_salida')->nullable();
            $table->enum('estado', ['presente', 'tarde', 'falta', 'rechazada'])->default('presente');
            $table->string('observaciones', 255)->nullable();
            $table->foreignId('validado_por')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            // Índice para búsquedas frecuentes
            $table->index(['practicante_id', 'fecha']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asistencias');
    }
};

