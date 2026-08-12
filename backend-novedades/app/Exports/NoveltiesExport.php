<?php

namespace App\Exports;

use App\Models\Novelty;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Consolidado de novedades para nómina.
 *
 * Las columnas se dejan planas y con encabezados explícitos para que el archivo
 * sea importable en Siigo, Novasoft o Kactus sin transformaciones intermedias.
 */
class NoveltiesExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    public function __construct(
        private readonly Collection $novelties,
    ) {
    }

    public function collection(): Collection
    {
        return $this->novelties;
    }

    public function headings(): array
    {
        return [
            'Tipo Doc.',
            'Documento',
            'Colaborador',
            'Cargo',
            'Centro de Costo',
            'Líder',
            'Tipo de Novedad',
            'Categoría',
            'Remunerada',
            'Fecha Inicio',
            'Fecha Fin',
            'Días',
            'Horas',
            'Estado',
            'Observaciones',
            'Registrada por',
            'Aprobada/Rechazada por',
            'Fecha de revisión',
            'Motivo de rechazo',
        ];
    }

    /**
     * @param  Novelty  $novelty
     */
    public function map($novelty): array
    {
        return [
            $novelty->employee?->document_type,
            $novelty->employee?->document_number,
            $novelty->employee?->full_name,
            $novelty->employee?->position,
            $novelty->employee?->costCenter?->name,
            $novelty->employee?->leader?->name,
            $novelty->noveltyType?->name,
            $novelty->noveltyType?->category,
            $novelty->noveltyType?->is_paid ? 'Sí' : 'No',
            $novelty->start_date?->format('d/m/Y'),
            $novelty->end_date?->format('d/m/Y'),
            $novelty->total_days,
            $novelty->total_hours,
            $this->statusLabel($novelty->status),
            $novelty->observations,
            $novelty->requestedBy?->name,
            $novelty->reviewedBy?->name,
            $novelty->reviewed_at?->format('d/m/Y H:i'),
            $novelty->rejection_reason,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => 'solid',
                    'startColor' => ['rgb' => '283276'],
                ],
            ],
        ];
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            Novelty::STATUS_PENDING => 'Pendiente',
            Novelty::STATUS_APPROVED => 'Aprobada',
            Novelty::STATUS_REJECTED => 'Rechazada',
            Novelty::STATUS_ANNULLED => 'Anulada',
            default => $status,
        };
    }
}
