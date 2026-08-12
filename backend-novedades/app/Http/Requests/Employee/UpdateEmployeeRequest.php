<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        $employeeId = $this->route('employee')?->id;

        return [
            'document_type' => ['sometimes', Rule::in(['CC', 'CE', 'PA', 'TI', 'PEP'])],
            'document_number' => ['sometimes', 'string', 'max:30', Rule::unique('employees', 'document_number')->ignore($employeeId)],
            'full_name' => ['sometimes', 'string', 'max:255'],
            'position' => ['sometimes', 'string', 'max:255'],
            'cost_center_id' => ['sometimes', 'exists:cost_centers,id'],
            'leader_user_id' => ['nullable', 'exists:users,id'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'hire_date' => ['nullable', 'date'],
            'contract_type' => ['sometimes', Rule::in(['indefinido', 'fijo', 'obra_labor', 'prestacion_servicios', 'aprendizaje'])],
            'base_salary' => ['nullable', 'numeric', 'min:0'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ];
    }
}
