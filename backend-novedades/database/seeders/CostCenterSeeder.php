<?php

namespace Database\Seeders;

use App\Models\CostCenter;
use Illuminate\Database\Seeder;

class CostCenterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $costCenters = [
            ['name' => 'Principal', 'code' => 'PRIN'],
            ['name' => 'Aguacatala', 'code' => 'AGUA'],
            ['name' => 'Bogotá', 'code' => 'BOG'],
            ['name' => 'Boutique Car', 'code' => 'BCAR'],
            ['name' => 'Tecnología', 'code' => 'TECH'],
        ];

        foreach ($costCenters as $costCenter) {
            CostCenter::updateOrCreate(['code' => $costCenter['code']], $costCenter);
        }
    }
}
