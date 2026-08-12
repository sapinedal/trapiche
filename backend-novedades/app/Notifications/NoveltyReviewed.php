<?php

namespace App\Notifications;

use App\Models\Novelty;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Avisa a quien registró la novedad que ya fue revisada.
 *
 * Mientras no haya SMTP configurado, `MAIL_MAILER=log` deja el correo en
 * `storage/logs/laravel.log`, así que el flujo es verificable sin credenciales.
 */
class NoveltyReviewed extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Novelty $novelty,
    ) {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $novelty = $this->novelty->loadMissing(['employee', 'noveltyType', 'reviewedBy']);
        $approved = $novelty->status === Novelty::STATUS_APPROVED;

        $message = (new MailMessage)
            ->subject(sprintf(
                'Novedad %s: %s — %s',
                $approved ? 'aprobada' : 'rechazada',
                $novelty->noveltyType->name,
                $novelty->employee->full_name,
            ))
            ->greeting('Hola '.$notifiable->name)
            ->line(sprintf(
                'La novedad de tipo "%s" para %s fue %s por %s.',
                $novelty->noveltyType->name,
                $novelty->employee->full_name,
                $approved ? 'APROBADA' : 'RECHAZADA',
                $novelty->reviewedBy?->name ?? 'el área responsable',
            ))
            ->line(sprintf(
                'Periodo: %s al %s.',
                $novelty->start_date->format('d/m/Y'),
                $novelty->end_date->format('d/m/Y'),
            ));

        if (! $approved && $novelty->rejection_reason) {
            $message->line('Motivo del rechazo: '.$novelty->rejection_reason);
        }

        return $message
            ->action('Ver novedades', rtrim(config('app.frontend_url'), '/').'/novedades')
            ->salutation('Gestión Humana · Lujos El Trapiche');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'novelty_id' => $this->novelty->id,
            'status' => $this->novelty->status,
        ];
    }
}
