<?php

namespace App\Repositories\Eloquent;

use App\Models\Employee;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class EloquentEmployeeRepository implements EmployeeRepositoryInterface
{
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return Employee::query()
            ->with(['costCenter', 'leader'])
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('document_number', 'like', "%{$search}%");
            }))
            ->when($filters['cost_center_id'] ?? null, fn ($query, $id) => $query->where('cost_center_id', $id))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['leader_user_id'] ?? null, fn ($query, $id) => $query->where('leader_user_id', $id))
            ->orderBy('full_name')
            ->paginate($perPage);
    }

    public function find(int $id): ?Employee
    {
        return Employee::find($id);
    }

    public function findOrFail(int $id): Employee
    {
        return Employee::with(['costCenter', 'leader'])->findOrFail($id);
    }

    public function create(array $data): Employee
    {
        return Employee::create($data);
    }

    public function update(Employee $employee, array $data): Employee
    {
        $employee->update($data);

        return $employee;
    }

    public function delete(Employee $employee): void
    {
        $employee->delete();
    }

    public function forLeader(int $leaderUserId): Collection
    {
        return Employee::query()
            ->with('costCenter')
            ->where('leader_user_id', $leaderUserId)
            ->where('status', Employee::STATUS_ACTIVE)
            ->orderBy('full_name')
            ->get();
    }
}
