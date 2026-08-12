import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { updateNoveltyStatus } from "./api";
import type { Novelty } from "@/types";
import { ApiError } from "@/lib/axios";
import { formatDateRange } from "@/lib/format";
import { cn } from "@/lib/cn";

export function RejectNoveltyModal({
  novelty,
  onClose,
  onRejected,
}: {
  novelty: Novelty | null;
  onClose: () => void;
  onRejected: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (novelty) {
      setReason("");
      setError(null);
    }
  }, [novelty]);

  const handleSubmit = async () => {
    if (!novelty) return;

    if (!reason.trim()) {
      setError("Indica el motivo del rechazo.");
      return;
    }

    setSubmitting(true);
    try {
      await updateNoveltyStatus(novelty.id, "rejected", reason.trim());
      toast.success("Novedad rechazada.");
      onRejected();
      onClose();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo rechazar la novedad.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={novelty !== null} onClose={onClose} title="Rechazar novedad">
      {novelty && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg bg-neutral-50 p-4 text-sm">
            <p className="font-semibold text-neutral-800">{novelty.employee.full_name}</p>
            <p className="text-neutral-500">
              {novelty.novelty_type.name} ·{" "}
              {formatDateRange(novelty.start_date, novelty.end_date)}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="rejection-reason" className="text-sm font-semibold text-neutral-700">
              Motivo del rechazo
            </label>
            <textarea
              id="rejection-reason"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Explica por qué se rechaza esta novedad. El líder que la registró podrá verlo."
              className={cn(
                "w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800",
                "placeholder:text-neutral-400 outline-none transition-all duration-200",
                "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
                error && "border-error-500 focus:border-error-500 focus:ring-error-500/20"
              )}
            />
            {error && <p className="text-xs font-medium text-error-500">{error}</p>}
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="danger" isLoading={submitting} onClick={handleSubmit}>
              Rechazar novedad
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
