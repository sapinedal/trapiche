<?php

namespace Database\Seeders;

use App\Models\NoveltyType;
use Illuminate\Database\Seeder;

class NoveltyTypeSeeder extends Seeder
{
    /**
     * Cada tipo trae su `config` parametrizable. Los campos definidos en
     * `config.fields` son los que la SPA renderiza dinámicamente al registrar
     * la novedad y se guardan en `novelties.data`.
     */
    public function run(): void
    {
        $types = [
            [
                'name' => 'Incapacidad General',
                'description' => 'Incapacidad por enfermedad de origen común certificada por la EPS.',
                'code' => 'INC_GEN',
                'category' => 'incapacidad',
                'is_paid' => true,
                'requires_attachment' => true,
                'config' => [
                    'measurement' => 'days',
                    'requires_approval' => true,
                    'fields' => [
                        ['id' => 'eps', 'label' => 'EPS', 'type' => 'text', 'required' => true],
                        ['id' => 'diagnostico', 'label' => 'Diagnóstico / CIE-10', 'type' => 'text', 'required' => false],
                        ['id' => 'prorroga', 'label' => '¿Es prórroga?', 'type' => 'select', 'required' => true, 'options' => ['No', 'Sí']],
                    ],
                ],
            ],
            [
                'name' => 'Incapacidad Laboral',
                'description' => 'Incapacidad derivada de accidente o enfermedad laboral (ARL).',
                'code' => 'INC_LAB',
                'category' => 'incapacidad',
                'is_paid' => true,
                'requires_attachment' => true,
                'config' => [
                    'measurement' => 'days',
                    'requires_approval' => true,
                    'fields' => [
                        ['id' => 'arl', 'label' => 'ARL', 'type' => 'text', 'required' => true],
                        ['id' => 'fecha_accidente', 'label' => 'Fecha del accidente', 'type' => 'date', 'required' => true],
                        ['id' => 'descripcion', 'label' => 'Descripción del evento', 'type' => 'textarea', 'required' => true],
                    ],
                ],
            ],
            [
                'name' => 'Licencia de Maternidad',
                'description' => 'Licencia remunerada por maternidad.',
                'code' => 'LIC_MAT',
                'category' => 'licencia',
                'is_paid' => true,
                'requires_attachment' => true,
                'config' => [
                    'measurement' => 'days',
                    'requires_approval' => true,
                    'fields' => [
                        ['id' => 'fecha_probable_parto', 'label' => 'Fecha probable de parto', 'type' => 'date', 'required' => true],
                    ],
                ],
            ],
            [
                'name' => 'Licencia de Paternidad',
                'description' => 'Licencia remunerada por paternidad.',
                'code' => 'LIC_PAT',
                'category' => 'licencia',
                'is_paid' => true,
                'requires_attachment' => true,
                'config' => [
                    'measurement' => 'days',
                    'requires_approval' => true,
                    'fields' => [
                        ['id' => 'fecha_nacimiento', 'label' => 'Fecha de nacimiento', 'type' => 'date', 'required' => true],
                    ],
                ],
            ],
            [
                'name' => 'Licencia Remunerada',
                'description' => 'Licencia autorizada con pago de salario.',
                'code' => 'LIC_REM',
                'category' => 'licencia',
                'is_paid' => true,
                'requires_attachment' => false,
                'config' => [
                    'measurement' => 'days',
                    'requires_approval' => true,
                    'fields' => [
                        ['id' => 'motivo', 'label' => 'Motivo', 'type' => 'textarea', 'required' => true],
                    ],
                ],
            ],
            [
                'name' => 'Licencia No Remunerada',
                'description' => 'Permiso sin pago de salario autorizado por el líder.',
                'code' => 'LIC_NOREM',
                'category' => 'licencia',
                'is_paid' => false,
                'requires_attachment' => false,
                'config' => [
                    'measurement' => 'days',
                    'requires_approval' => true,
                    'fields' => [
                        ['id' => 'motivo', 'label' => 'Motivo', 'type' => 'textarea', 'required' => true],
                    ],
                ],
            ],
            [
                'name' => 'Permiso Personal',
                'description' => 'Permiso de corta duración por asuntos personales.',
                'code' => 'PER_PERS',
                'category' => 'permiso',
                'is_paid' => true,
                'requires_attachment' => false,
                'config' => [
                    'measurement' => 'hours',
                    'requires_approval' => true,
                    'fields' => [
                        ['id' => 'hora_salida', 'label' => 'Hora de salida', 'type' => 'time', 'required' => true],
                        ['id' => 'hora_regreso', 'label' => 'Hora de regreso', 'type' => 'time', 'required' => true],
                        ['id' => 'compensa', 'label' => '¿Compensa el tiempo?', 'type' => 'select', 'required' => true, 'options' => ['Sí', 'No']],
                    ],
                ],
            ],
            [
                'name' => 'Permiso Cita Médica',
                'description' => 'Permiso para asistir a cita médica.',
                'code' => 'PER_MED',
                'category' => 'permiso',
                'is_paid' => true,
                'requires_attachment' => true,
                'config' => [
                    'measurement' => 'hours',
                    'requires_approval' => true,
                    'fields' => [
                        ['id' => 'entidad', 'label' => 'Entidad / IPS', 'type' => 'text', 'required' => true],
                        ['id' => 'hora_cita', 'label' => 'Hora de la cita', 'type' => 'time', 'required' => true],
                    ],
                ],
            ],
            [
                'name' => 'Permiso por Calamidad Doméstica',
                'description' => 'Permiso por situación de calamidad familiar.',
                'code' => 'PER_CAL',
                'category' => 'permiso',
                'is_paid' => true,
                'requires_attachment' => true,
                'config' => [
                    'measurement' => 'days',
                    'requires_approval' => true,
                    'fields' => [
                        ['id' => 'parentesco', 'label' => 'Parentesco', 'type' => 'select', 'required' => true, 'options' => ['Padre/Madre', 'Cónyuge', 'Hijo(a)', 'Hermano(a)', 'Otro']],
                        ['id' => 'descripcion', 'label' => 'Descripción', 'type' => 'textarea', 'required' => true],
                    ],
                ],
            ],
            [
                'name' => 'Ausentismo / Falta no Justificada',
                'description' => 'Inasistencia sin justificación válida.',
                'code' => 'AUS_INJ',
                'category' => 'ausentismo',
                'is_paid' => false,
                'requires_attachment' => false,
                'config' => [
                    'measurement' => 'days',
                    'requires_approval' => true,
                    'fields' => [
                        ['id' => 'observacion', 'label' => 'Observación del líder', 'type' => 'textarea', 'required' => true],
                    ],
                ],
            ],
            [
                'name' => 'Horas Extra',
                'description' => 'Tiempo laborado por encima de la jornada ordinaria.',
                'code' => 'HEX',
                'category' => 'hora_extra',
                'is_paid' => true,
                'requires_attachment' => false,
                'config' => [
                    'measurement' => 'hours',
                    'requires_approval' => true,
                    'fields' => [
                        ['id' => 'tipo_hora', 'label' => 'Tipo de hora', 'type' => 'select', 'required' => true, 'options' => ['Diurna', 'Nocturna', 'Dominical/Festiva', 'Festiva Nocturna']],
                        ['id' => 'justificacion', 'label' => 'Justificación', 'type' => 'textarea', 'required' => true],
                    ],
                ],
            ],
            [
                'name' => 'Recargo Nocturno / Dominical',
                'description' => 'Recargo por jornada nocturna, dominical o festiva.',
                'code' => 'REC_NOC',
                'category' => 'hora_extra',
                'is_paid' => true,
                'requires_attachment' => false,
                'config' => [
                    'measurement' => 'hours',
                    'requires_approval' => true,
                    'fields' => [
                        ['id' => 'tipo_recargo', 'label' => 'Tipo de recargo', 'type' => 'select', 'required' => true, 'options' => ['Nocturno', 'Dominical', 'Festivo', 'Festivo Nocturno']],
                    ],
                ],
            ],
            [
                'name' => 'Vacaciones',
                'description' => 'Disfrute de vacaciones causadas.',
                'code' => 'VAC',
                'category' => 'retiro_vacaciones',
                'is_paid' => true,
                'requires_attachment' => false,
                'config' => [
                    'measurement' => 'days',
                    'requires_approval' => true,
                    'fields' => [
                        ['id' => 'periodo_causado', 'label' => 'Periodo causado', 'type' => 'text', 'required' => false],
                        ['id' => 'deja_reemplazo', 'label' => '¿Deja reemplazo?', 'type' => 'select', 'required' => true, 'options' => ['Sí', 'No']],
                    ],
                ],
            ],
            [
                'name' => 'Retiro',
                'description' => 'Terminación del contrato laboral.',
                'code' => 'RET',
                'category' => 'retiro_vacaciones',
                'is_paid' => false,
                'requires_attachment' => true,
                'config' => [
                    'measurement' => 'days',
                    'requires_approval' => true,
                    'fields' => [
                        ['id' => 'motivo_retiro', 'label' => 'Motivo del retiro', 'type' => 'select', 'required' => true, 'options' => ['Renuncia voluntaria', 'Terminación de contrato', 'Justa causa', 'Mutuo acuerdo']],
                        ['id' => 'ultimo_dia', 'label' => 'Último día laborado', 'type' => 'date', 'required' => true],
                    ],
                ],
            ],
        ];

        foreach ($types as $type) {
            NoveltyType::updateOrCreate(['code' => $type['code']], $type);
        }
    }
}
