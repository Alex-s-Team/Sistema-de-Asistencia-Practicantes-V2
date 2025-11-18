<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->time('entry_time')->nullable();
            $table->time('exit_time')->nullable();
            $table->string('entry_ip')->nullable();
            $table->string('exit_ip')->nullable();
            $table->string('qr_token')->nullable();
            $table->string('entry_device')->nullable();
            $table->string('exit_device')->nullable();
            $table->decimal('entry_latitude', 10, 8)->nullable();
            $table->decimal('entry_longitude', 11, 8)->nullable();
            $table->decimal('exit_latitude', 10, 8)->nullable();
            $table->decimal('exit_longitude', 11, 8)->nullable();
            $table->boolean('is_remote_entry')->default(false);
            $table->boolean('is_remote_exit')->default(false);
            $table->text('remote_reason')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('validated_by')->nullable()->constrained('users');
            $table->timestamp('validated_at')->nullable();
            $table->text('validation_notes')->nullable();
            $table->boolean('has_delay')->default(false);
            $table->integer('delay_minutes')->default(0);
            $table->timestamps();
            
            $table->unique(['user_id', 'date']);
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
