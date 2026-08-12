<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Novelty extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_ANNULLED = 'annulled';

    protected $fillable = [
        'employee_id',
        'novelty_type_id',
        'start_date',
        'end_date',
        'total_days',
        'total_hours',
        'observations',
        'data',
        'attachment_path',
        'status',
        'requested_by',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'total_days' => 'decimal:2',
            'total_hours' => 'decimal:2',
            'reviewed_at' => 'datetime',
            'data' => 'array',
        ];
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(NoveltyAuditLog::class)->orderBy('performed_at');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function noveltyType(): BelongsTo
    {
        return $this->belongsTo(NoveltyType::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }
}
