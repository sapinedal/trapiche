<?php

namespace Database\Seeders;

use App\Models\CostCenter;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $costCenters = CostCenter::all()->keyBy('code');
        $users = User::all()->keyBy('email');

        $employees = [
            [
                'document_type' => 'CC',
                'document_number' => '1002456789',
                'full_name' => 'María Fernanda López',
                'position' => 'Asesora integral',
                'cost_center_id' => $costCenters['PRIN']->id,
                'leader_user_id' => $users['karen.cano@lujoseltrapiche.com']->id,
                'user_id' => null,
                'hire_date' => '2024-09-09',
                'contract_type' => 'indefinido',
                'base_salary' => 1750905,
            ],
            [
                'document_type' => 'CC',
                'document_number' => '71345221',
                'full_name' => 'Carlos Andrés Restrepo',
                'position' => 'Técnico instalador',
                'cost_center_id' => $costCenters['AGUA']->id,
                'leader_user_id' => $users['juan.camilo@lujoseltrapiche.com']->id,
                'user_id' => null,
                'hire_date' => '2023-04-15',
                'contract_type' => 'indefinido',
                'base_salary' => 1650000,
            ],
            [
                'document_type' => 'CC',
                'document_number' => '1037654321',
                'full_name' => 'Sebastián Lopera',
                'position' => 'Asesor institucional',
                'cost_center_id' => $costCenters['BOG']->id,
                'leader_user_id' => $users['edwin.giraldo@lujoseltrapiche.com']->id,
                'user_id' => null,
                'hire_date' => '2022-08-01',
                'contract_type' => 'indefinido',
                'base_salary' => 2100000,
            ],
            [
                'document_type' => 'CC',
                'document_number' => '43567890',
                'full_name' => 'Lili Morales',
                'position' => 'Líder Boutique Car',
                'cost_center_id' => $costCenters['BCAR']->id,
                'leader_user_id' => $users['gerencia@lujoseltrapiche.com']->id,
                'user_id' => $users['lili.morales@lujoseltrapiche.com']->id,
                'hire_date' => '2021-11-20',
                'contract_type' => 'indefinido',
                'base_salary' => 2300000,
            ],
            [
                'document_type' => 'CC',
                'document_number' => '1011390710',
                'full_name' => 'Samuel Pineda',
                'position' => 'Desarrollador',
                'cost_center_id' => $costCenters['TECH']->id,
                'leader_user_id' => $users['gerencia@lujoseltrapiche.com']->id,
                'user_id' => $users['samuel.pineda@lujoseltrapiche.com']->id,
                'hire_date' => null,
                'contract_type' => 'prestacion_servicios',
                'base_salary' => null,
            ],
        ];

        foreach ($employees as $data) {
            Employee::updateOrCreate(
                ['document_number' => $data['document_number']],
                $data + ['status' => Employee::STATUS_ACTIVE],
            );
        }
    }
}
