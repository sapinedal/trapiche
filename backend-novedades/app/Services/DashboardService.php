<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Novelty;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class DashboardService
{
    /**
     * Métricas del periodo para la pantalla de inicio.
     *
     * Todo se calcula dentro del alcance del usuario: un líder solo ve números
     * de su propio equipo.
     */
    public function stats(User $user, ?string $dateFrom = null, ?string $dateTo = null): array
    {
        $from = $dateFrom ? Carbon::parse($dateFrom) : now()->startOfMonth();
        $to = $dateTo ? Carbon::parse($dateTo) : now()->endOfMonth();

        $novelties = $this->scopedNovelties($user)
            ->whereDate('start_date', '<=', $to)
            ->whereDate('end_date', '>=', $from)
            ->with(['employee.costCenter', 'noveltyType'])
            ->get();

        $employees = $this->scopedEmployees($user)->where('status', Employee::STATUS_ACTIVE)->count();

        return [
            'period' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'totals' => [
                'active_employees' => $employees,
                'novelties' => $novelties->count(),
                'pending' => $novelties->where('status', Novelty::STATUS_PENDING)->count(),
                'approved' => $novelties->where('status', Novelty::STATUS_APPROVED)->count(),
                'rejected' => $novelties->where('status', Novelty::STATUS_REJECTED)->count(),
                'absence_days' => round((float) $novelties
                    ->where('status', Novelty::STATUS_APPROVED)
                    ->sum('total_days'), 2),
                /** Colaboradores con al menos una novedad: mide cobertura del ausentismo. */
                'employees_with_novelties' => $novelties->pluck('employee_id')->unique()->count(),
            ],
            'by_category' => $novelties
                ->groupBy(fn (Novelty $n) => $n->noveltyType?->category ?? 'sin_categoria')
                ->map(fn ($group, $category) => [
                    'category' => $category,
                    'count' => $group->count(),
                    'days' => round((float) $group->sum('total_days'), 2),
                ])
                ->sortByDesc('count')
                ->values(),
            'by_cost_center' => $novelties
                ->groupBy(fn (Novelty $n) => $n->employee?->costCenter?->name ?? 'Sin centro de costo')
                ->map(fn ($group, $name) => [
                    'cost_center' => $name,
                    'count' => $group->count(),
                    'days' => round((float) $group->sum('total_days'), 2),
                ])
                ->sortByDesc('count')
                ->values(),
            'top_employees' => $novelties
                ->groupBy('employee_id')
                ->map(fn ($group) => [
                    'employee' => $group->first()->employee?->full_name,
                    'cost_center' => $group->first()->employee?->costCenter?->name,
                    'count' => $group->count(),
                    'days' => round((float) $group->sum('total_days'), 2),
                ])
                ->sortByDesc('count')
                ->take(5)
                ->values(),
        ];
    }

    private function scopedNovelties(User $user): Builder
    {
        return Novelty::query()->when(
            $user->isLeader(),
            fn (Builder $query) => $query->whereHas(
                'employee',
                fn ($q) => $q->where('leader_user_id', $user->id)
            )
        );
    }

    private function scopedEmployees(User $user): Builder
    {
        return Employee::query()->when(
            $user->isLeader(),
            fn (Builder $query) => $query->where('leader_user_id', $user->id)
        );
    }
}
