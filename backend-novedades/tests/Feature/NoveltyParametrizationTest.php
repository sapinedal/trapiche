<?php

namespace Tests\Feature;

use App\Models\CostCenter;
use App\Models\Employee;
use App\Models\Novelty;
use App\Models\NoveltyType;
use App\Models\User;
use App\Notifications\NoveltyReviewed;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NoveltyParametrizationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $leader;
    private Employee $employee;
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

        $this->employee = Employee::create([
            'document_number' => '111', 'full_name' => 'Propia', 'position' => 'Asesora',
            'cost_center_id' => $costCenter->id, 'leader_user_id' => $this->leader->id,
            'hire_date' => '2024-01-01', 'base_salary' => 1000000,
        ]);

        $this->type = NoveltyType::create([
            'name' => 'Permiso Cita Médica',
            'code' => 'PER_MED',
            'category' => 'permiso',
            'config' => [
                'measurement' => 'hours',
                'fields' => [
                    ['id' => 'entidad', 'label' => 'Entidad', 'type' => 'text', 'required' => true],
                    ['id' => 'motivo', 'label' => 'Motivo', 'type' => 'select', 'required' => false, 'options' => ['Control', 'Urgencia']],
                ],
            ],
        ]);
    }

    public function test_dynamic_required_field_is_enforced(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/api/novelties', [
            'employee_id' => $this->employee->id,
            'novelty_type_id' => $this->type->id,
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-01',
            'data' => [],
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('data.entidad');
    }

    public function test_dynamic_select_rejects_value_outside_options(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/api/novelties', [
            'employee_id' => $this->employee->id,
            'novelty_type_id' => $this->type->id,
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-01',
            'data' => ['entidad' => 'Sura', 'motivo' => 'Inventado'],
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('data.motivo');
    }

    public function test_dynamic_data_is_persisted(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/api/novelties', [
            'employee_id' => $this->employee->id,
            'novelty_type_id' => $this->type->id,
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-01',
            'data' => ['entidad' => 'Sura', 'motivo' => 'Control'],
        ]);

        $response->assertCreated();
        $this->assertSame('Sura', $response->json('data.data.entidad'));
    }

    public function test_creating_and_approving_writes_the_audit_trail(): void
    {
        $novelty = $this->createNovelty();

        $this->actingAs($this->admin)
            ->patchJson("/api/novelties/{$novelty->id}", ['status' => 'approved'])
            ->assertOk();

        $logs = $novelty->fresh()->auditLogs()->get();

        $this->assertCount(2, $logs);
        $this->assertSame('created', $logs[0]->action);
        $this->assertSame($this->leader->id, $logs[0]->performed_by);
        $this->assertSame('approved', $logs[1]->action);
        $this->assertSame('pending', $logs[1]->from_status);
        $this->assertSame($this->admin->id, $logs[1]->performed_by);
        $this->assertNotNull($logs[1]->performed_at);
    }

    public function test_requester_is_notified_when_novelty_is_reviewed(): void
    {
        Notification::fake();

        $novelty = $this->createNovelty();

        $this->actingAs($this->admin)
            ->patchJson("/api/novelties/{$novelty->id}", ['status' => 'approved'])
            ->assertOk();

        Notification::assertSentTo($this->leader, NoveltyReviewed::class);
    }

    public function test_summary_groups_novelties_by_employee(): void
    {
        $this->createNovelty();
        $this->createNovelty();

        $response = $this->actingAs($this->admin)->getJson('/api/novelties/summary');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('Propia', $response->json('data.0.employee.full_name'));
        $this->assertSame(2, $response->json('data.0.total'));
        $this->assertSame(2, $response->json('data.0.pending'));
    }

    public function test_mine_only_returns_novelties_requested_by_the_user(): void
    {
        $this->createNovelty();                       // registrada por el líder
        $this->createNovelty(requestedBy: $this->admin);

        $response = $this->actingAs($this->admin)->getJson('/api/novelties/mine');

        $response->assertOk();
        $this->assertSame(1, $response->json('meta.total'));
    }

    public function test_only_admin_can_parametrize_novelty_types(): void
    {
        $payload = [
            'name' => 'Nuevo tipo',
            'code' => 'NUEVO',
            'category' => 'permiso',
            'is_paid' => true,
            'requires_attachment' => false,
            'config' => [
                'measurement' => 'days',
                'fields' => [
                    ['id' => 'motivo', 'label' => 'Motivo', 'type' => 'text', 'required' => true],
                ],
            ],
        ];

        $this->actingAs($this->leader)->postJson('/api/novelty-types', $payload)->assertForbidden();
        $this->actingAs($this->admin)->postJson('/api/novelty-types', $payload)->assertCreated();
    }

    public function test_duplicate_field_ids_are_rejected(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/api/novelty-types', [
            'name' => 'Tipo inválido',
            'code' => 'INV',
            'category' => 'permiso',
            'is_paid' => true,
            'requires_attachment' => false,
            'config' => [
                'fields' => [
                    ['id' => 'motivo', 'label' => 'Motivo', 'type' => 'text', 'required' => true],
                    ['id' => 'motivo', 'label' => 'Otro motivo', 'type' => 'text', 'required' => false],
                ],
            ],
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('config.fields');
    }

    public function test_type_with_novelties_is_deactivated_instead_of_deleted(): void
    {
        $this->createNovelty();

        $this->actingAs($this->admin)
            ->deleteJson("/api/novelty-types/{$this->type->id}")
            ->assertOk();

        $this->assertDatabaseHas('novelty_types', [
            'id' => $this->type->id,
            'is_active' => false,
        ]);
    }

    public function test_export_returns_a_spreadsheet(): void
    {
        $this->createNovelty();

        $response = $this->actingAs($this->admin)->get('/api/novelties/export');

        $response->assertOk();
        $this->assertStringContainsString(
            'spreadsheetml',
            $response->headers->get('content-type') ?? '',
        );
    }

    public function test_dashboard_returns_analytics_within_scope(): void
    {
        $this->createNovelty();

        $response = $this->actingAs($this->admin)->getJson('/api/dashboard/stats');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'period' => ['from', 'to'],
                    'totals' => ['active_employees', 'novelties', 'pending', 'employees_with_novelties'],
                    'by_category',
                    'by_cost_center',
                    'top_employees',
                ],
            ]);
    }

    private function createNovelty(?User $requestedBy = null): Novelty
    {
        return app(\App\Services\NoveltyService::class)->create([
            'employee_id' => $this->employee->id,
            'novelty_type_id' => $this->type->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'total_days' => 1,
            'data' => ['entidad' => 'Sura'],
        ], $requestedBy ?? $this->leader);
    }
}
