<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollClosureEmployee extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_closure_id',
        'employee_id',
        'confirmed_by',
        'confirmed_at',
        'has_novelties',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'confirmed_at' => 'datetime',
            'has_novelties' => 'boolean',
        ];
    }

    public function payrollClosure(): BelongsTo
    {
        return $this->belongsTo(PayrollClosure::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function confirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }
}
