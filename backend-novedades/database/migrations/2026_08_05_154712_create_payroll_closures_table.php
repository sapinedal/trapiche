<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_closures', function (Blueprint $table) {
            $table->id();
            $table->enum('period_type', ['quincenal', 'mensual'])->default('quincenal');
            $table->date('period_start');
            $table->date('period_end');
            $table->enum('status', ['open', 'closed'])->default('open')->index();
            $table->foreignId('closed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->unique(['period_start', 'period_end']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_closures');
    }
};
