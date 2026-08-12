<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Novelty;
use App\Models\NoveltyType;
use App\Models\User;
use App\Services\NoveltyService;
use Illuminate\Database\Seeder;

class NoveltySeeder extends Seeder
{
    /**
     * Novedades de ejemplo situadas en el mes en curso, para que el dashboard
     * y el resumen tengan contenido apenas se instala el sistema.
     *
     * Se crean a través de NoveltyService (no con Model::create) para que
     * queden con su bitácora de auditoría, igual que en producción.
     */
    public function run(): void
    {
        $service = app(NoveltyService::class);

        $users = User::all()->keyBy('email');
        $employees = Employee::all()->keyBy('document_number');
        $types = NoveltyType::all()->keyBy('code');

        $karen = $users['karen.cano@lujoseltrapiche.com'];
        $juan = $users['juan.camilo@lujoseltrapiche.com'];
        $edwin = $users['edwin.giraldo@lujoseltrapiche.com'];
        $gerencia = $users['gerencia@lujoseltrapiche.com'];

        $novelties = [
            [
                'employee' => '1002456789',
                'type' => 'VAC',
                'start' => now()->startOfMonth()->addDays(9),
                'end' => now()->startOfMonth()->addDays(13),
                'days' => 5,
                'requested_by' => $karen,
                'observations' => 'Vacaciones anuales causadas.',
                'data' => ['periodo_causado' => '2025-2026', 'deja_reemplazo' => 'Sí'],
                'decision' => 'approved',
                'reviewer' => $gerencia,
            ],
            [
                'employee' => '71345221',
                'type' => 'INC_GEN',
                'start' => now()->startOfMonth()->addDays(4),
                'end' => now()->startOfMonth()->addDays(6),
                'days' => 3,
                'requested_by' => $juan,
                'observations' => 'Incapacidad general expedida por la EPS.',
                'data' => ['eps' => 'Sura', 'diagnostico' => 'J00', 'prorroga' => 'No'],
                'decision' => 'approved',
                'reviewer' => $gerencia,
            ],
            [
                'employee' => '1037654321',
                'type' => 'PER_MED',
                'start' => now()->startOfMonth()->addDays(15),
                'end' => now()->startOfMonth()->addDays(15),
                'days' => 1,
                'requested_by' => $edwin,
                'observations' => 'Cita médica de control.',
                'data' => ['entidad' => 'Colsanitas', 'hora_cita' => '09:00'],
                'decision' => null,
            ],
            [
                'employee' => '1002456789',
                'type' => 'PER_PERS',
                'start' => now()->startOfMonth()->addDays(19),
                'end' => now()->startOfMonth()->addDays(19),
                'days' => 1,
                'requested_by' => $karen,
                'observations' => 'Diligencia personal en la mañana.',
                'data' => ['hora_salida' => '08:00', 'hora_regreso' => '11:00', 'compensa' => 'Sí'],
                'decision' => null,
            ],
            [
                'employee' => '71345221',
                'type' => 'HEX',
                'start' => now()->startOfMonth()->addDays(11),
                'end' => now()->startOfMonth()->addDays(11),
                'hours' => 3,
                'requested_by' => $juan,
                'observations' => 'Instalación fuera de horario en sede Aguacatala.',
                'data' => ['tipo_hora' => 'Nocturna', 'justificacion' => 'Entrega urgente al cliente.'],
                'decision' => null,
            ],
            [
                'employee' => '1037654321',
                'type' => 'AUS_INJ',
                'start' => now()->startOfMonth()->addDays(2),
                'end' => now()->startOfMonth()->addDays(2),
                'days' => 1,
                'requested_by' => $edwin,
                'observations' => 'No se presentó ni reportó novedad.',
                'data' => ['observacion' => 'No contestó los medios de contacto.'],
                'decision' => 'rejected',
                'reviewer' => $gerencia,
                'reason' => 'El colaborador presentó soporte de incapacidad posteriormente.',
            ],
        ];

        foreach ($novelties as $item) {
            $employee = $employees[$item['employee']] ?? null;
            $type = $types[$item['type']] ?? null;

            if (! $employee || ! $type) {
                continue;
            }

            $exists = Novelty::where('employee_id', $employee->id)
                ->where('novelty_type_id', $type->id)
                ->whereDate('start_date', $item['start']->toDateString())
                ->exists();

            if ($exists) {
                continue;
            }

            $novelty = $service->create([
                'employee_id' => $employee->id,
                'novelty_type_id' => $type->id,
                'start_date' => $item['start']->toDateString(),
                'end_date' => $item['end']->toDateString(),
                'total_days' => $item['days'] ?? null,
                'total_hours' => $item['hours'] ?? null,
                'observations' => $item['observations'],
                'data' => $item['data'],
            ], $item['requested_by']);

            match ($item['decision']) {
                'approved' => $service->approve($novelty->fresh(), $item['reviewer']),
                'rejected' => $service->reject($novelty->fresh(), $item['reviewer'], $item['reason']),
                default => null,
            };
        }
    }
}
