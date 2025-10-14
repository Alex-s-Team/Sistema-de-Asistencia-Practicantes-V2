<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('practicantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('universidad', 100);
            $table->string('carrera', 100);
            $table->tinyInteger('semestre');
            $table->integer('horas_requeridas');
            $table->integer('horas_completadas')->default(0);
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->foreignId('supervisor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('observaciones', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('practicantes');
    }
};

