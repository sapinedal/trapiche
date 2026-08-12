<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'document_type' => ['required', Rule::in(['CC', 'CE', 'PA', 'TI', 'PEP'])],
            'document_number' => ['required', 'string', 'max:30', 'unique:employees,document_number'],
            'full_name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'cost_center_id' => ['required', 'exists:cost_centers,id'],
            'leader_user_id' => ['nullable', 'exists:users,id'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'hire_date' => ['nullable', 'date'],
            'contract_type' => ['required', Rule::in(['indefinido', 'fijo', 'obra_labor', 'prestacion_servicios', 'aprendizaje'])],
            'base_salary' => ['nullable', 'numeric', 'min:0'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ];
    }
}
