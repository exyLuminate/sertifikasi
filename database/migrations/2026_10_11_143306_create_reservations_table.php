<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->restrictOnDelete();
            $table->foreignId('restaurant_table_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('code', 30)->unique();
            $table->dateTime('start_at');
            $table->dateTime('end_at');
            $table->unsignedInteger('guest_count');
            $table->enum('status', ['dipesan', 'dikonfirmasi', 'selesai', 'dibatalkan'])->default('dipesan');
            $table->text('note')->nullable();
            $table->timestamps();

            // Index gabungan untuk mempercepat query pengecekan bentrok jadwal
            $table->index(['restaurant_table_id', 'start_at', 'end_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
