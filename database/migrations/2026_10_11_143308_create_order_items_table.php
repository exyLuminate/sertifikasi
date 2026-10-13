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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            // ON DELETE CASCADE khusus pada order_items terhadap orders
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_id')->constrained()->restrictOnDelete();
            $table->decimal('price_at_order', 12, 2);
            $table->unsignedInteger('qty');
            $table->decimal('subtotal', 12, 2);
            $table->string('note', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
