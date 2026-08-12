<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Bitácora inmutable de la novedad: quién hizo qué y cuándo.
     *
     * Las columnas `reviewed_by` / `reviewed_at` de `novelties` solo guardan la
     * última decisión; esta tabla conserva el historial completo, que es lo que
     * permite auditar el proceso ante nómina.
     */
    public function up(): void
    {
        Schema::create('novelty_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('novelty_id')->constrained('novelties')->cascadeOnDelete();
            $table->enum('action', ['created', 'approved', 'rejected', 'annulled', 'updated']);
            $table->foreignId('performed_by')->constrained('users')->restrictOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status')->nullable();
            $table->text('notes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('performed_at');
            $table->timestamps();

            $table->index(['novelty_id', 'performed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('novelty_audit_logs');
    }
};
