<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_closure_employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_closure_id')->constrained('payroll_closures')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->restrictOnDelete();
            $table->foreignId('confirmed_by')->constrained('users')->restrictOnDelete();
            $table->timestamp('confirmed_at');
            $table->boolean('has_novelties')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['payroll_closure_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_closure_employees');
    }
};
