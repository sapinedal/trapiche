<?php

namespace App\Services;

use App\Models\Novelty;
use App\Models\NoveltyAuditLog;
use App\Models\User;
use App\Notifications\NoveltyReviewed;
use App\Repositories\Contracts\NoveltyRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class NoveltyService
{
    public function __construct(
        private readonly NoveltyRepositoryInterface $novelties,
        private readonly NoveltyAuditService $audit,
    ) {
    }

    /**
     * Leaders only ever see novelties of their own team; the requested filter
     * cannot widen that scope.
     */
    public function list(array $filters, User $user, int $perPage = 15): LengthAwarePaginator
    {
        if ($user->isLeader()) {
            $filters['leader_user_id'] = $user->id;
        }

        return $this->novelties->paginate($filters, $perPage);
    }

    public function find(int $id): Novelty
    {
        return $this->novelties->findOrFail($id);
    }

    public function create(array $data, User $requestedBy): Novelty
    {
        return DB::transaction(function () use ($data, $requestedBy) {
            $data['requested_by'] = $requestedBy->id;
            $data['status'] = Novelty::STATUS_PENDING;

            $novelty = $this->novelties->create($data);

            $this->audit->record($novelty, NoveltyAuditLog::ACTION_CREATED, $requestedBy);

            return $novelty;
        });
    }

    public function approve(Novelty $novelty, User $reviewer): Novelty
    {
        $this->ensurePending($novelty);

        $novelty = DB::transaction(function () use ($novelty, $reviewer) {
            $fromStatus = $novelty->status;

            $novelty = $this->novelties->update($novelty, [
                'status' => Novelty::STATUS_APPROVED,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'rejection_reason' => null,
            ]);

            $this->audit->record($novelty, NoveltyAuditLog::ACTION_APPROVED, $reviewer, $fromStatus);

            return $novelty;
        });

        $this->notifyRequester($novelty);

        return $novelty;
    }

    public function reject(Novelty $novelty, User $reviewer, string $reason): Novelty
    {
        $this->ensurePending($novelty);

        $novelty = DB::transaction(function () use ($novelty, $reviewer, $reason) {
            $fromStatus = $novelty->status;

            $novelty = $this->novelties->update($novelty, [
                'status' => Novelty::STATUS_REJECTED,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'rejection_reason' => $reason,
            ]);

            $this->audit->record(
                $novelty,
                NoveltyAuditLog::ACTION_REJECTED,
                $reviewer,
                $fromStatus,
                $reason,
            );

            return $novelty;
        });

        $this->notifyRequester($novelty);

        return $novelty;
    }

    public function annul(Novelty $novelty, User $performedBy): Novelty
    {
        return DB::transaction(function () use ($novelty, $performedBy) {
            $fromStatus = $novelty->status;

            $novelty = $this->novelties->update($novelty, [
                'status' => Novelty::STATUS_ANNULLED,
            ]);

            $this->audit->record($novelty, NoveltyAuditLog::ACTION_ANNULLED, $performedBy, $fromStatus);

            return $novelty;
        });
    }

    /** Used by the payroll-closure flow to block closing a period with unresolved novelties. */
    public function hasPendingForEmployees(array $employeeIds): bool
    {
        return $this->novelties->pendingForEmployees($employeeIds) > 0;
    }

    /**
     * El correo no debe tumbar la aprobación: si el transporte falla, la
     * decisión ya quedó registrada y auditada en base de datos.
     */
    private function notifyRequester(Novelty $novelty): void
    {
        $requester = $novelty->requestedBy;

        if (! $requester?->email) {
            return;
        }

        try {
            $requester->notify(new NoveltyReviewed($novelty));
        } catch (\Throwable $exception) {
            report($exception);
        }
    }

    private function ensurePending(Novelty $novelty): void
    {
        if (! $novelty->isPending()) {
            throw ValidationException::withMessages([
                'status' => 'Solo se pueden aprobar o rechazar novedades en estado pendiente.',
            ]);
        }
    }
}
