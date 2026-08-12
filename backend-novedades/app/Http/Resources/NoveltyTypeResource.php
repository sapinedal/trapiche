<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NoveltyTypeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'code' => $this->code,
            'category' => $this->category,
            'is_paid' => $this->is_paid,
            'requires_attachment' => $this->requires_attachment,
            'is_active' => $this->is_active,
            'config' => [
                'measurement' => $this->measurement(),
                'requires_approval' => $this->config['requires_approval'] ?? true,
                'max_days' => $this->config['max_days'] ?? null,
                'fields' => $this->fields(),
            ],
            'novelties_count' => $this->whenCounted('novelties'),
        ];
    }
}
