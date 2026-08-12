<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'document_type' => $this->document_type,
            'document_number' => $this->document_number,
            'full_name' => $this->full_name,
            'position' => $this->position,
            'cost_center' => [
                'id' => $this->costCenter?->id,
                'name' => $this->costCenter?->name,
            ],
            'leader' => $this->whenLoaded('leader', fn () => $this->leader ? [
                'id' => $this->leader->id,
                'name' => $this->leader->name,
            ] : null),
            'email' => $this->email,
            'phone' => $this->phone,
            'hire_date' => $this->hire_date?->toDateString(),
            'contract_type' => $this->contract_type,
            'base_salary' => $this->base_salary,
            'status' => $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
