<?php

namespace App\Services;

use App\Models\Novelty;
use App\Models\User;
use App\Repositories\Contracts\NoveltyRepositoryInterface;
use Illuminate\Support\Collection;

/**
 * Agrupa las novedades por colaborador para la vista de revisión.
 *
 * El líder revisa "por persona", no "por novedad": necesita ver quién tiene
 * pendientes y abrir su detalle. Por eso el resumen se arma aquí y no en la SPA.
 */
class NoveltySummaryService
{
    public function __construct(
        private readonly NoveltyRepositoryInterface $novelties,
    ) {
    }

    public function forUser(array $filters, User $user): Collection
    {
        if ($user->isLeader()) {
            $filters['leader_user_id'] = $user->id;
        }

        return $this->novelties->all($filters)
            ->groupBy('employee_id')
            ->map(fn (Collection $novelties) => $this->summarize($novelties))
            ->sortBy([
                // Primero quienes tienen pendientes: es lo que exige acción.
                fn (array $row) => $row['pending'] > 0 ? 0 : 1,
                fn (array $row) => $row['employee']['full_name'],
            ])
            ->values();
    }

    private function summarize(Collection $novelties): array
    {
        $employee = $novelties->first()->employee;

        $countBy = fn (string $status) => $novelties->where('status', $status)->count();

        return [
            'employee' => [
                'id' => $employee->id,
                'full_name' => $employee->full_name,
                'document_number' => $employee->document_number,
                'position' => $employee->position,
                'cost_center' => $employee->costCenter?->name,
                'leader' => $employee->leader?->name,
            ],
            'total' => $novelties->count(),
            'pending' => $countBy(Novelty::STATUS_PENDING),
            'approved' => $countBy(Novelty::STATUS_APPROVED),
            'rejected' => $countBy(Novelty::STATUS_REJECTED),
            'annulled' => $countBy(Novelty::STATUS_ANNULLED),
            'total_days' => round((float) $novelties->sum('total_days'), 2),
            'total_hours' => round((float) $novelties->sum('total_hours'), 2),
            'novelty_ids' => $novelties->pluck('id')->values()->all(),
        ];
    }
}
