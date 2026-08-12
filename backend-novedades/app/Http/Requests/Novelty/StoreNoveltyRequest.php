<?php

namespace App\Http\Requests\Novelty;

use App\Models\NoveltyType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNoveltyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()->role, ['admin', 'leader'], true);
    }

    public function rules(): array
    {
        return [
            'employee_id' => [
                'required',
                // A leader may only register novelties for their own team.
                Rule::exists('employees', 'id')->where(function ($query) {
                    if ($this->user()->isLeader()) {
                        $query->where('leader_user_id', $this->user()->id);
                    }
                }),
            ],
            'novelty_type_id' => ['required', 'exists:novelty_types,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'total_days' => ['nullable', 'numeric', 'min:0'],
            'total_hours' => ['nullable', 'numeric', 'min:0'],
            'observations' => ['nullable', 'string', 'max:2000'],
            'data' => ['nullable', 'array'],
            'attachment' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }

    /**
     * Los campos dinámicos se validan contra el esquema del tipo elegido, que
     * es configurable en tiempo de ejecución y por eso no cabe en rules().
     */
    protected function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $type = NoveltyType::find($this->input('novelty_type_id'));

            if (! $type) {
                return;
            }

            $data = $this->input('data', []) ?? [];

            foreach ($type->fields() as $field) {
                $value = $data[$field['id']] ?? null;
                $isEmpty = $value === null || $value === '' || $value === [];

                if (($field['required'] ?? false) && $isEmpty) {
                    $validator->errors()->add("data.{$field['id']}", "El campo \"{$field['label']}\" es obligatorio.");
                    continue;
                }

                if (! $isEmpty
                    && in_array($field['type'], ['select', 'checklist'], true)
                    && ! empty($field['options'])
                ) {
                    $selected = (array) $value;
                    $invalid = array_diff($selected, $field['options']);

                    if ($invalid !== []) {
                        $validator->errors()->add(
                            "data.{$field['id']}",
                            "El valor seleccionado para \"{$field['label']}\" no es válido.",
                        );
                    }
                }
            }

            if ($type->requires_attachment && ! $this->hasFile('attachment')) {
                $validator->errors()->add('attachment', 'Este tipo de novedad exige adjuntar el soporte.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'employee_id.exists' => 'El colaborador seleccionado no pertenece a tu equipo a cargo.',
        ];
    }

    /** Keep the uploaded file out of the data handed to the model. */
    public function validatedForModel(): array
    {
        return collect($this->validated())->except('attachment')->all();
    }
}
