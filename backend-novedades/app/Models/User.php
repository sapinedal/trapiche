<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_ADMIN = 'admin';
    public const ROLE_LEADER = 'leader';
    public const ROLE_EMPLOYEE = 'employee';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isLeader(): bool
    {
        return $this->role === self::ROLE_LEADER;
    }

    /** The employee record linked to this login account, if any. */
    public function employee(): HasOne
    {
        return $this->hasOne(Employee::class);
    }

    /** Employees this user leads/supervises as a leader. */
    public function leadingEmployees(): HasMany
    {
        return $this->hasMany(Employee::class, 'leader_user_id');
    }

    public function requestedNovelties(): HasMany
    {
        return $this->hasMany(Novelty::class, 'requested_by');
    }

    public function reviewedNovelties(): HasMany
    {
        return $this->hasMany(Novelty::class, 'reviewed_by');
    }
}
