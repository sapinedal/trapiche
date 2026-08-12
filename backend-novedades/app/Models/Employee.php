<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';

    protected $fillable = [
        'document_type',
        'document_number',
        'full_name',
        'position',
        'cost_center_id',
        'leader_user_id',
        'user_id',
        'email',
        'phone',
        'hire_date',
        'contract_type',
        'base_salary',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'hire_date' => 'date',
            'base_salary' => 'decimal:2',
        ];
    }

    public function costCenter(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class);
    }

    /** The leader/supervisor user in charge of this employee. */
    public function leader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'leader_user_id');
    }

    /** The login account for this employee, if one exists. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function novelties(): HasMany
    {
        return $this->hasMany(Novelty::class);
    }

    public function payrollClosureRecords(): HasMany
    {
        return $this->hasMany(PayrollClosureEmployee::class);
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }
}
