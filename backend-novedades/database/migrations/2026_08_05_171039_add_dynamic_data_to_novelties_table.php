<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('novelties', function (Blueprint $table) {
            /** Valores de los campos parametrizados en novelty_types.config.fields */
            $table->json('data')->nullable()->after('observations');
        });
    }

    public function down(): void
    {
        Schema::table('novelties', function (Blueprint $table) {
            $table->dropColumn('data');
        });
    }
};
