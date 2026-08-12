<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CostCenterSeeder::class,
            NoveltyTypeSeeder::class,
            UserSeeder::class,
            EmployeeSeeder::class,
            NoveltySeeder::class,
        ]);
    }
}
