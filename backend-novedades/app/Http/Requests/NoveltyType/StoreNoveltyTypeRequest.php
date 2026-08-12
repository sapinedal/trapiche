<?php

namespace App\Http\Requests\NoveltyType;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNoveltyTypeRequest extends FormRequest
{
    /** Tipos de campo que la SPA sabe renderizar. */
    public const FIELD_TYPES = ['text', 'textarea', 'number', 'date', 'time', 'select', 'checklist'];

    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return array_merge($this->baseRules(), [
            'code' => ['required', 'string', 'max:30', 'unique:novelty_types,code'],
        ]);
    }

    /** Compartido con UpdateNoveltyTypeRequest. */
    protected function baseRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'category' => ['required', Rule::in([
                'incapacidad', 'licencia', 'permiso', 'ausentismo', 'hora_extra', 'retiro_vacaciones',
            ])],
            'is_paid' => ['required', 'boolean'],
            'requires_attachment' => ['required', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],

            'config' => ['nullable', 'array'],
            'config.measurement' => ['nullable', Rule::in(['days', 'hours'])],
            'config.requires_approval' => ['nullable', 'boolean'],
            'config.max_days' => ['nullable', 'integer', 'min:1'],

            'config.fields' => ['nullable', 'array'],
            'config.fields.*.id' => ['required', 'string', 'max:50', 'regex:/^[a-z][a-z0-9_]*$/'],
            'config.fields.*.label' => ['required', 'string', 'max:120'],
            'config.fields.*.type' => ['required', Rule::in(self::FIELD_TYPES)],
            'config.fields.*.required' => ['required', 'boolean'],
            // Las opciones solo tienen sentido en campos de selección.
            'config.fields.*.options' => ['nullable', 'array', 'required_if:config.fields.*.type,select,checklist'],
            'config.fields.*.options.*' => ['string', 'max:120'],
        ];
    }

    public function messages(): array
    {
        return [
            'config.fields.*.id.regex' => 'El identificador del campo debe empezar por letra minúscula y usar solo letras, números y guion bajo.',
            'config.fields.*.options.required_if' => 'Los campos de tipo selección requieren al menos una opción.',
        ];
    }

    protected function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $fields = $this->input('config.fields', []) ?? [];
            $ids = array_column($fields, 'id');

            if (count($ids) !== count(array_unique($ids))) {
                $validator->errors()->add(
                    'config.fields',
                    'Los identificadores de los campos no pueden repetirse.',
                );
            }
        });
    }
}
