<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NoveltyType extends Model
{
    use HasFactory;

    public const CATEGORY_INCAPACIDAD = 'incapacidad';
    public const CATEGORY_LICENCIA = 'licencia';
    public const CATEGORY_PERMISO = 'permiso';
    public const CATEGORY_AUSENTISMO = 'ausentismo';
    public const CATEGORY_HORA_EXTRA = 'hora_extra';
    public const CATEGORY_RETIRO_VACACIONES = 'retiro_vacaciones';

    protected $fillable = [
        'name',
        'description',
        'code',
        'category',
        'is_paid',
        'requires_attachment',
        'is_active',
        'config',
    ];

    protected function casts(): array
    {
        return [
            'is_paid' => 'boolean',
            'requires_attachment' => 'boolean',
            'is_active' => 'boolean',
            'config' => 'array',
        ];
    }

    /** Campos parametrizables definidos para este tipo. */
    public function fields(): array
    {
        return $this->config['fields'] ?? [];
    }

    /** Si la novedad se mide en días o en horas. */
    public function measurement(): string
    {
        return $this->config['measurement'] ?? 'days';
    }

    public function novelties(): HasMany
    {
        return $this->hasMany(Novelty::class);
    }
}
