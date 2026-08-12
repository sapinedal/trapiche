<?php

namespace App\Repositories\Eloquent;

use App\Models\Novelty;
use App\Repositories\Contracts\NoveltyRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class EloquentNoveltyRepository implements NoveltyRepositoryInterface
{
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->query($filters)->paginate($perPage);
    }

    public function all(array $filters = []): Collection
    {
        return $this->query($filters)->get();
    }

    public function findOrFail(int $id): Novelty
    {
        return Novelty::with([
            'employee.costCenter',
            'noveltyType',
            'requestedBy',
            'reviewedBy',
            'auditLogs.performedBy',
        ])->findOrFail($id);
    }

    public function create(array $data): Novelty
    {
        return Novelty::create($data);
    }

    public function update(Novelty $novelty, array $data): Novelty
    {
        $novelty->update($data);

        return $novelty;
    }

    public function pendingForEmployees(array $employeeIds): int
    {
        return Novelty::whereIn('employee_id', $employeeIds)
            ->where('status', Novelty::STATUS_PENDING)
            ->count();
    }

    /** Filtros compartidos por las vistas paginada, de resumen y de exportación. */
    private function query(array $filters): Builder
    {
        return Novelty::query()
            ->with(['employee.costCenter', 'employee.leader', 'noveltyType', 'requestedBy', 'reviewedBy'])
            ->when($filters['employee_id'] ?? null, fn ($query, $id) => $query->where('employee_id', $id))
            ->when($filters['novelty_type_id'] ?? null, fn ($query, $id) => $query->where('novelty_type_id', $id))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['category'] ?? null, fn ($query, $category) => $query->whereHas(
                'noveltyType',
                fn ($q) => $q->where('category', $category)
            ))
            ->when($filters['cost_center_id'] ?? null, fn ($query, $id) => $query->whereHas(
                'employee',
                fn ($q) => $q->where('cost_center_id', $id)
            ))
            ->when($filters['leader_user_id'] ?? null, fn ($query, $id) => $query->whereHas(
                'employee',
                fn ($q) => $q->where('leader_user_id', $id)
            ))
            ->when($filters['requested_by'] ?? null, fn ($query, $id) => $query->where('requested_by', $id))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->whereHas(
                'employee',
                fn ($q) => $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('document_number', 'like', "%{$search}%")
            ))
            ->when($filters['date_from'] ?? null, fn ($query, $date) => $query->where('end_date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, $date) => $query->where('start_date', '<=', $date))
            ->orderByDesc('start_date');
    }
}
