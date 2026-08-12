<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NoveltyAuditLog extends Model
{
    public const ACTION_CREATED = 'created';
    public const ACTION_APPROVED = 'approved';
    public const ACTION_REJECTED = 'rejected';
    public const ACTION_ANNULLED = 'annulled';
    public const ACTION_UPDATED = 'updated';

    protected $fillable = [
        'novelty_id',
        'action',
        'performed_by',
        'from_status',
        'to_status',
        'notes',
        'ip_address',
        'performed_at',
    ];

    protected function casts(): array
    {
        return [
            'performed_at' => 'datetime',
        ];
    }

    public function novelty(): BelongsTo
    {
        return $this->belongsTo(Novelty::class);
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
