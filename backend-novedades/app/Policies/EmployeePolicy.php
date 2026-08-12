<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\User;

class EmployeePolicy
{
    /**
     * Consultar la nómina es de Gestión Humana y de los líderes; el rol
     * `employee` solo consulta sus propias novedades (fase 2). Sin esto, el
     * servicio no acota a ese rol y devolvería todo el personal.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isLeader();
    }

    public function view(User $user, Employee $employee): bool
    {
        return $user->isAdmin() || $employee->leader_user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Employee $employee): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Employee $employee): bool
    {
        return $user->isAdmin();
    }
}
