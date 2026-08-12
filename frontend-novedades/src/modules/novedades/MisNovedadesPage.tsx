import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Inbox } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { PageLoader } from "@/components/ui/Spinner";
import { NoveltyDetail } from "./NoveltyDetail";
import { fetchMyNovelties, fetchNovelty } from "./api";
import type { Novelty } from "@/types";
import { ApiError } from "@/lib/axios";
import { useAuth } from "@/modules/auth/AuthContext";

const statusOptions = [
  { value: "", label: "Todos los estados" },
  { value: "pending", label: "Pendiente" },
  { value: "approved", label: "Aprobada" },
  { value: "rejected", label: "Rechazada" },
  { value: "annulled", label: "Anulada" },
];

export function MisNovedadesPage() {
  const { user } = useAuth();
  const [novelties, setNovelties] = useState<Novelty[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const canCreate = user?.role === "admin" || user?.role === "leader";

  const load = useCallback(() => {
    setLoading(true);
    fetchMyNovelties({ status: status || undefined })
      .then(async (response) => {
        // El listado no trae la bitácora; se pide por novedad para mostrar la traza.
        const detailed = await Promise.all(
          response.data.map((novelty) => fetchNovelty(novelty.id).catch(() => novelty))
        );
        setNovelties(detailed);
      })
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "No se pudieron cargar tus novedades.";
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Novedades"
        subtitle="Novedades que has registrado y su estado de aprobación."
      >
        {canCreate && (
          <Link to="/novedades/nueva">
            <Button icon={Plus}>Crear novedad</Button>
          </Link>
        )}
      </PageHeader>

      <Card padding="sm">
        <div className="max-w-xs">
          <Select
            options={statusOptions}
            value={status}
            onChange={setStatus}
            placeholder="Todos los estados"
          />
        </div>
      </Card>

      {loading ? (
        <PageLoader />
      ) : novelties.length === 0 ? (
        <Card padding="none">
          <div className="flex flex-col items-center gap-3 py-16 text-neutral-500">
            <Inbox className="size-12 text-neutral-300" />
            <p className="text-sm font-medium">Aún no has registrado novedades.</p>
            {canCreate && (
              <Link to="/novedades/nueva">
                <Button variant="outline" size="sm" icon={Plus}>
                  Crear la primera
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {novelties.map((novelty) => (
            <div key={novelty.id}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                {novelty.employee.full_name}
              </p>
              <NoveltyDetail novelty={novelty} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
