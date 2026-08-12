<?php

namespace App\Repositories\Contracts;

use App\Models\Novelty;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface NoveltyRepositoryInterface
{
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /** Todas las novedades que cumplen los filtros, sin paginar (resumen y export). */
    public function all(array $filters = []): Collection;

    public function findOrFail(int $id): Novelty;

    public function create(array $data): Novelty;

    public function update(Novelty $novelty, array $data): Novelty;

    /** Novelties still awaiting a decision for the given employee ids. */
    public function pendingForEmployees(array $employeeIds): int;
}
