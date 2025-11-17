<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('qr_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('token')->unique();
            $table->string('qr_url'); // URL completa para el QR
            $table->timestamp('expires_at');
            $table->boolean('is_used')->default(false);
            $table->foreignId('used_by')->nullable()->constrained('users');
            $table->timestamp('used_at')->nullable();
            $table->timestamps();

            $table->index('expires_at');
            $table->index(['token', 'is_used']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('qr_tokens');
    }
};