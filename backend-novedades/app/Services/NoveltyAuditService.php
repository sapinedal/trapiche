<?php

namespace App\Services;

use App\Models\Novelty;
use App\Models\NoveltyAuditLog;
use App\Models\User;

/**
 * Único punto donde se escribe la bitácora de novedades.
 *
 * Centralizarlo evita que una acción nueva se olvide de dejar traza, que es
 * justamente lo que hace auditable el proceso frente a nómina.
 */
class NoveltyAuditService
{
    public function record(
        Novelty $novelty,
        string $action,
        User $performedBy,
        ?string $fromStatus = null,
        ?string $notes = null,
    ): NoveltyAuditLog {
        return NoveltyAuditLog::create([
            'novelty_id' => $novelty->id,
            'action' => $action,
            'performed_by' => $performedBy->id,
            'from_status' => $fromStatus,
            'to_status' => $novelty->status,
            'notes' => $notes,
            'ip_address' => request()->ip(),
            'performed_at' => now(),
        ]);
    }
}
