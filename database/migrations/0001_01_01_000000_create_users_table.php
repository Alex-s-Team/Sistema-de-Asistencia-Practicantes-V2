<?php

// database/migrations/2024_01_01_000000_create_users_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('dni', 8)->unique(); // 👈 CAMBIO: DNI en lugar de email
            $table->string('email')->nullable(); 
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['admin', 'staff', 'intern'])->default('intern');
            $table->enum('gender', ['masculino', 'femenino'])->nullable();
            
            // Información personal
            $table->date('birth_date')->nullable();
            $table->integer('age')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('emergency_contact', 20)->nullable();
            $table->string('address')->nullable();
            $table->string('district')->nullable();
            $table->string('city')->nullable();
            
            // Información académica/laboral (para practicantes)
            $table->string('university')->nullable();
            $table->string('semester')->nullable();
            $table->string('position')->nullable(); // Cargo
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->time('entry_time')->nullable();
            $table->time('exit_time')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};

