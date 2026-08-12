<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NoveltyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee' => [
                'id' => $this->employee?->id,
                'full_name' => $this->employee?->full_name,
                'cost_center' => $this->employee?->costCenter?->name,
            ],
            'novelty_type' => [
                'id' => $this->noveltyType?->id,
                'name' => $this->noveltyType?->name,
                'category' => $this->noveltyType?->category,
            ],
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'total_days' => $this->total_days,
            'total_hours' => $this->total_hours,
            'observations' => $this->observations,
            /** Valores de los campos parametrizados del tipo. */
            'data' => $this->data ?? [],
            'attachment_url' => $this->attachment_path ? asset('storage/'.$this->attachment_path) : null,
            'status' => $this->status,
            'requested_by' => $this->requestedBy?->name,
            'reviewed_by' => $this->reviewedBy?->name,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'rejection_reason' => $this->rejection_reason,
            'created_at' => $this->created_at?->toIso8601String(),
            'audit_logs' => $this->whenLoaded('auditLogs', fn () => $this->auditLogs->map(fn ($log) => [
                'action' => $log->action,
                'from_status' => $log->from_status,
                'to_status' => $log->to_status,
                'performed_by' => $log->performedBy?->name,
                'performed_at' => $log->performed_at?->toIso8601String(),
                'notes' => $log->notes,
            ])),
        ];
    }
}
