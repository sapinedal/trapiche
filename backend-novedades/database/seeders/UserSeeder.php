<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Default password for every seeded account is "password" — change it
     * before deploying to a real environment.
     */
    public function run(): void
    {
        $users = [
            ['name' => 'Samuel Pineda', 'email' => 'samuel.pineda@lujoseltrapiche.com', 'role' => User::ROLE_ADMIN],
            ['name' => 'Gerencia General', 'email' => 'gerencia@lujoseltrapiche.com', 'role' => User::ROLE_ADMIN],
            ['name' => 'Karen Cano', 'email' => 'karen.cano@lujoseltrapiche.com', 'role' => User::ROLE_LEADER],
            ['name' => 'Juan Camilo', 'email' => 'juan.camilo@lujoseltrapiche.com', 'role' => User::ROLE_LEADER],
            ['name' => 'Edwin Giraldo', 'email' => 'edwin.giraldo@lujoseltrapiche.com', 'role' => User::ROLE_LEADER],
            ['name' => 'Lili Morales', 'email' => 'lili.morales@lujoseltrapiche.com', 'role' => User::ROLE_LEADER],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'role' => $user['role'],
                    'password' => 'password',
                    'email_verified_at' => now(),
                    'is_active' => true,
                ]
            );
        }
    }
}
