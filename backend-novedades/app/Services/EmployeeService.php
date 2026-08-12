<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\User;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EmployeeService
{
    public function __construct(
        private readonly EmployeeRepositoryInterface $employees,
    ) {
    }

    /**
     * Leaders only ever see their own team; the requested filter cannot widen
     * that scope, so the constraint is applied after the caller's filters.
     */
    public function list(array $filters, User $user, int $perPage = 15): LengthAwarePaginator
    {
        if ($user->isLeader()) {
            $filters['leader_user_id'] = $user->id;
        }

        return $this->employees->paginate($filters, $perPage);
    }

    public function find(int $id): Employee
    {
        return $this->employees->findOrFail($id);
    }

    public function create(array $data): Employee
    {
        return $this->employees->create($data);
    }

    public function update(Employee $employee, array $data): Employee
    {
        return $this->employees->update($employee, $data);
    }

    public function delete(Employee $employee): void
    {
        $this->employees->delete($employee);
    }
}
