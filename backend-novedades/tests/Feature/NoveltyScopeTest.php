<?php

namespace Tests\Feature;

use App\Models\CostCenter;
use App\Models\Employee;
use App\Models\Novelty;
use App\Models\NoveltyType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NoveltyScopeTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $leader;
    private User $otherLeader;
    private Employee $ownEmployee;
    private Employee $otherEmployee;
    private NoveltyType $type;

    protected function setUp(): void
    {
        parent::setUp();

        $costCenter = CostCenter::create(['name' => 'Principal', 'code' => 'PRIN']);

        $this->admin = User::create([
            'name' => 'Admin', 'email' => 'admin@test.com',
            'password' => 'secret', 'role' => User::ROLE_ADMIN,
        ]);
        $this->leader = User::create([
            'name' => 'Karen', 'email' => 'karen@test.com',
            'password' => 'secret', 'role' => User::ROLE_LEADER,
        ]);
        $this->otherLeader = User::create([
            'name' => 'Edwin', 'email' => 'edwin@test.com',
            'password' => 'secret', 'role' => User::ROLE_LEADER,
        ]);

        $this->ownEmployee = Employee::create([
            'document_number' => '111', 'full_name' => 'Propia', 'position' => 'Asesora',
            'cost_center_id' => $costCenter->id, 'leader_user_id' => $this->leader->id,
            'hire_date' => '2024-01-01', 'base_salary' => 1000000,
        ]);
        $this->otherEmployee = Employee::create([
            'document_number' => '222', 'full_name' => 'Ajena', 'position' => 'Asesor',
            'cost_center_id' => $costCenter->id, 'leader_user_id' => $this->otherLeader->id,
            'hire_date' => '2024-01-01', 'base_salary' => 1000000,
        ]);

        $this->type = NoveltyType::create([
            'name' => 'Incapacidad General', 'code' => 'INC_GEN', 'category' => 'incapacidad',
        ]);
    }

    public function test_leader_only_sees_their_own_team(): void
    {
        $response = $this->actingAs($this->leader)->getJson('/api/employees');

        $response->assertOk();
        $this->assertSame(1, $response->json('meta.total'));
        $this->assertSame('Propia', $response->json('data.0.full_name'));
    }

    public function test_admin_sees_every_employee(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/api/employees');

        $response->assertOk();
        $this->assertSame(2, $response->json('meta.total'));
    }

    public function test_leader_filter_cannot_widen_scope_to_another_team(): void
    {
        $response = $this->actingAs($this->leader)
            ->getJson('/api/employees?leader_user_id='.$this->otherLeader->id);

        $response->assertOk();
        $this->assertSame(1, $response->json('meta.total'));
        $this->assertSame('Propia', $response->json('data.0.full_name'));
    }

    public function test_leader_only_sees_novelties_of_their_own_team(): void
    {
        $this->createNovelty($this->ownEmployee);
        $this->createNovelty($this->otherEmployee);

        $response = $this->actingAs($this->leader)->getJson('/api/novelties');

        $response->assertOk();
        $this->assertSame(1, $response->json('meta.total'));
        $this->assertSame('Propia', $response->json('data.0.employee.full_name'));
    }

    public function test_leader_cannot_register_a_novelty_for_another_team(): void
    {
        $response = $this->actingAs($this->leader)->postJson('/api/novelties', [
            'employee_id' => $this->otherEmployee->id,
            'novelty_type_id' => $this->type->id,
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-02',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('employee_id');
    }

    public function test_leader_can_register_a_novelty_for_their_own_team(): void
    {
        $response = $this->actingAs($this->leader)->postJson('/api/novelties', [
            'employee_id' => $this->ownEmployee->id,
            'novelty_type_id' => $this->type->id,
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-02',
        ]);

        $response->assertCreated();
        $this->assertSame('pending', $response->json('data.status'));
    }

    public function test_novelty_end_date_cannot_precede_start_date(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/api/novelties', [
            'employee_id' => $this->ownEmployee->id,
            'novelty_type_id' => $this->type->id,
            'start_date' => '2026-09-10',
            'end_date' => '2026-09-01',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('end_date');
    }

    public function test_guests_cannot_list_employees(): void
    {
        $this->getJson('/api/employees')->assertUnauthorized();
    }

    public function test_plain_employees_cannot_list_the_payroll(): void
    {
        $employeeUser = User::create([
            'name' => 'Colaborador', 'email' => 'colaborador@test.com',
            'password' => 'secret', 'role' => User::ROLE_EMPLOYEE,
        ]);

        // Sin esta barrera el servicio no acota al rol `employee` y devolvería
        // toda la nómina, incluido el personal de otros líderes.
        $this->actingAs($employeeUser)->getJson('/api/employees')->assertForbidden();
    }

    private function createNovelty(Employee $employee): Novelty
    {
        return Novelty::create([
            'employee_id' => $employee->id,
            'novelty_type_id' => $this->type->id,
            'start_date' => '2026-05-01',
            'end_date' => '2026-05-02',
            'status' => Novelty::STATUS_PENDING,
            'requested_by' => $this->admin->id,
        ]);
    }
}
