<?php

namespace App\Policies;

use App\Models\Novelty;
use App\Models\User;

class NoveltyPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Novelty $novelty): bool
    {
        return $user->isAdmin() || $novelty->employee->leader_user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isLeader();
    }

    /** Approve/reject/annul a novelty. */
    public function review(User $user, Novelty $novelty): bool
    {
        return $user->isAdmin() || $novelty->employee->leader_user_id === $user->id;
    }
}
