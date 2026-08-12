<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('novelty_types', function (Blueprint $table) {
            $table->string('description')->nullable()->after('name');
            /**
             * Configuración parametrizable del tipo. Forma esperada:
             *
             * {
             *   "measurement": "days" | "hours",
             *   "max_days": 15,
             *   "requires_approval": true,
             *   "fields": [
             *     { "id": "eps", "label": "EPS", "type": "text", "required": true },
             *     { "id": "motivo", "label": "Motivo", "type": "select",
             *       "required": true, "options": ["Cita", "Urgencia"] }
             *   ]
             * }
             */
            $table->json('config')->nullable()->after('requires_attachment');
        });
    }

    public function down(): void
    {
        Schema::table('novelty_types', function (Blueprint $table) {
            $table->dropColumn(['description', 'config']);
        });
    }
};
