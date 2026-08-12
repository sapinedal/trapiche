<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\StoreEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Services\EmployeeService;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function __construct(
        private readonly EmployeeService $employees,
    ) {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Employee::class);

        $filters = $request->only(['search', 'cost_center_id', 'status', 'leader_user_id']);

        $employees = $this->employees->list($filters, $request->user(), (int) $request->integer('per_page', 15));

        return response()->json([
            'data' => EmployeeResource::collection($employees),
            'meta' => [
                'current_page' => $employees->currentPage(),
                'last_page' => $employees->lastPage(),
                'total' => $employees->total(),
            ],
            'message' => null,
            'status' => 'success',
        ]);
    }

    public function store(StoreEmployeeRequest $request)
    {
        $employee = $this->employees->create($request->validated());

        return response()->json([
            'data' => new EmployeeResource($employee->load(['costCenter', 'leader'])),
            'message' => 'Colaborador creado correctamente.',
            'status' => 'success',
        ], 201);
    }

    public function show(Employee $employee)
    {
        return response()->json([
            'data' => new EmployeeResource($employee->load(['costCenter', 'leader'])),
            'message' => null,
            'status' => 'success',
        ]);
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee)
    {
        $employee = $this->employees->update($employee, $request->validated());

        return response()->json([
            'data' => new EmployeeResource($employee->load(['costCenter', 'leader'])),
            'message' => 'Colaborador actualizado correctamente.',
            'status' => 'success',
        ]);
    }

    public function destroy(Employee $employee)
    {
        $this->authorize('delete', $employee);

        $this->employees->delete($employee);

        return response()->json([
            'data' => null,
            'message' => 'Colaborador eliminado correctamente.',
            'status' => 'success',
        ]);
    }
}
