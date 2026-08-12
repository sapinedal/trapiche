import { CheckCircle2, XCircle, Clock3, Ban, FileEdit, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDateRange } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { AuditAction, Novelty, NoveltyStatus } from "@/types";

export const statusBadge: Record<
  NoveltyStatus,
  { label: string; variant: "warning" | "success" | "danger" | "neutral" }
> = {
  pending: { label: "Pendiente", variant: "warning" },
  approved: { label: "Aprobada", variant: "success" },
  rejected: { label: "Rechazada", variant: "danger" },
  annulled: { label: "Anulada", variant: "neutral" },
};

const auditMeta: Record<AuditAction, { label: string; icon: typeof CheckCircle2; color: string }> = {
  created: { label: "Registrada", icon: FileEdit, color: "text-primary-500" },
  approved: { label: "Aprobada", icon: CheckCircle2, color: "text-success-500" },
  rejected: { label: "Rechazada", icon: XCircle, color: "text-error-500" },
  annulled: { label: "Anulada", icon: Ban, color: "text-neutral-400" },
  updated: { label: "Modificada", icon: FileEdit, color: "text-warning-500" },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Detalle de una novedad, incluyendo los valores parametrizados y la bitácora.
 * Se reutiliza en "Mis Novedades" y en el modal de revisión.
 */
export function NoveltyDetail({ novelty }: { novelty: Novelty }) {
  const badge = statusBadge[novelty.status];
  const dynamicEntries = Object.entries(novelty.data ?? {});

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <span
        className={cn(
          "absolute left-0 top-0 h-full w-1.5",
          novelty.status === "approved" && "bg-success-500",
          novelty.status === "rejected" && "bg-error-500",
          novelty.status === "pending" && "bg-warning-500",
          novelty.status === "annulled" && "bg-neutral-300"
        )}
      />

      <div className="mb-3 flex flex-wrap items-start justify-between gap-2 pl-2">
        <div>
          <p className="font-bold text-primary-600">{novelty.novelty_type.name}</p>
          <p className="text-xs text-neutral-400">
            #{novelty.id} · {formatDateRange(novelty.start_date, novelty.end_date)}
          </p>
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 pl-2 text-sm sm:grid-cols-2">
        {novelty.total_days && (
          <div className="flex justify-between gap-2 sm:block">
            <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Días</dt>
            <dd className="font-medium text-neutral-800">{novelty.total_days}</dd>
          </div>
        )}
        {dynamicEntries.map(([key, value]) => (
          <div key={key} className="flex justify-between gap-2 sm:block">
            <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {key.replace(/_/g, " ")}
            </dt>
            <dd className="font-medium text-neutral-800">
              {Array.isArray(value) ? value.join(", ") : value}
            </dd>
          </div>
        ))}
      </dl>

      {novelty.observations && (
        <p className="mt-3 rounded-lg bg-neutral-50 p-3 pl-3 text-sm text-neutral-600">
          {novelty.observations}
        </p>
      )}

      {novelty.rejection_reason && (
        <p className="mt-3 rounded-lg border border-error-500/20 bg-error-500/5 p-3 text-sm text-neutral-700">
          <strong className="font-semibold text-error-500">Motivo del rechazo:</strong>{" "}
          {novelty.rejection_reason}
        </p>
      )}

      {novelty.attachment_url && (
        <a
          href={novelty.attachment_url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline"
        >
          <Paperclip className="size-4" />
          Ver soporte adjunto
        </a>
      )}

      {novelty.audit_logs && novelty.audit_logs.length > 0 && (
        <div className="mt-4 border-t border-neutral-100 pt-4 pl-2">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
            <Clock3 className="size-3.5" />
            Traza de la novedad
          </p>
          <ol className="space-y-2.5">
            {novelty.audit_logs.map((log, index) => {
              const meta = auditMeta[log.action];
              const Icon = meta.icon;
              return (
                <li key={index} className="flex items-start gap-2.5 text-sm">
                  <Icon className={cn("mt-0.5 size-4 shrink-0", meta.color)} />
                  <div className="min-w-0">
                    <p className="text-neutral-700">
                      <span className="font-semibold">{meta.label}</span>
                      {log.performed_by && <> por {log.performed_by}</>}
                    </p>
                    <p className="text-xs text-neutral-400">{formatDateTime(log.performed_at)}</p>
                    {log.notes && (
                      <p className="mt-0.5 text-xs italic text-neutral-500">{log.notes}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
