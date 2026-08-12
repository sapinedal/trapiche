<?php

namespace App\Http\Requests\NoveltyType;

use Illuminate\Validation\Rule;

class UpdateNoveltyTypeRequest extends StoreNoveltyTypeRequest
{
    public function rules(): array
    {
        return array_merge($this->baseRules(), [
            'code' => [
                'required',
                'string',
                'max:30',
                Rule::unique('novelty_types', 'code')->ignore($this->route('novelty_type')?->id),
            ],
        ]);
    }
}
