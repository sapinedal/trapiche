import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, CalendarClock, Clock3, CalendarX, ArrowRight, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { fetchDashboardStats } from "./api";
import { categoryLabels } from "@/modules/novedades/noveltyIcons";
import { useAuth } from "@/modules/auth/AuthContext";
import type { DashboardStats, NoveltyCategory } from "@/types";
import { ApiError } from "@/lib/axios";
import { cn } from "@/lib/cn";

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  to,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  hint?: string;
  to?: string;
  accent: string;
}) {
  const content = (
    <Card className="h-full" padding="none">
      <div className="flex items-start gap-4 p-5">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
            accent
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-3xl font-bold leading-tight text-neutral-900">{value}</p>
          <p className="mt-0.5 text-sm text-neutral-500">{label}</p>
          {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
        </div>
        {to && (
          <ArrowRight className="size-4 shrink-0 text-neutral-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary-500" />
        )}
      </div>
    </Card>
  );

  return to ? (
    <Link to={to} className="group block">
      {content}
    </Link>
  ) : (
    content
  );
}

/** Barra proporcional simple: evita sumar una librería de gráficos por tres listas. */
function DistributionBar({
  rows,
  labelKey,
}: {
  rows: { label: string; count: number; days: number }[];
  labelKey: string;
}) {
  const max = Math.max(...rows.map((row) => row.count), 1);

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-neutral-400">
        Sin datos en el periodo seleccionado.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium text-neutral-700">{row.label}</span>
            <span className="shrink-0 text-xs text-neutral-500">
              {row.count} {row.count === 1 ? "novedad" : "novedades"}
              {row.days > 0 && ` · ${row.days} día(s)`}
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-neutral-100"
            role="img"
            aria-label={`${row.label}: ${row.count} novedades`}
          >
            <div
              className="h-full rounded-full bg-primary-500 transition-all"
              style={{ width: `${(row.count / max) * 100}%` }}
            />
          </div>
          <span className="sr-only">{labelKey}</span>
        </li>
      ))}
    </ul>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "No se pudieron cargar las métricas.";
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(" ")[0];

  if (loading) return <PageLoader />;
  if (!stats) return null;

  const { totals } = stats;
  const coverage =
    totals.active_employees > 0
      ? Math.round((totals.employees_with_novelties / totals.active_employees) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={firstName ? `Hola, ${firstName}` : "Inicio"}
        subtitle={`Periodo del ${stats.period.from} al ${stats.period.to}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Personal activo"
          value={totals.active_employees}
          to="/empleados"
          accent="bg-primary-500"
        />
        <StatCard
          icon={CalendarClock}
          label="Novedades del periodo"
          value={totals.novelties}
          hint={`${coverage}% del personal con novedades`}
          to="/novedades"
          accent="bg-secondary-500"
        />
        <StatCard
          icon={Clock3}
          label="Pendientes por aprobar"
          value={totals.pending}
          to="/novedades"
          accent="bg-warning-500"
        />
        <StatCard
          icon={CalendarX}
          label="Días de ausentismo"
          value={totals.absence_days}
          hint="Solo novedades aprobadas"
          accent="bg-neutral-800"
        />
      </div>

      {totals.pending > 0 && (
        <Card className="border-warning-500/30 bg-warning-500/5">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 size-5 shrink-0 text-warning-500" />
              <p className="text-sm text-neutral-700">
                Hay{" "}
                <strong className="font-semibold">
                  {totals.pending}{" "}
                  {totals.pending === 1 ? "novedad pendiente" : "novedades pendientes"}
                </strong>{" "}
                por revisar.
              </p>
            </div>
            <Link
              to="/novedades"
              className="shrink-0 text-sm font-semibold text-primary-600 hover:underline"
            >
              Revisar ahora
            </Link>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-500">
            Novedades por tipo
          </h2>
          <DistributionBar
            labelKey="categoría"
            rows={stats.by_category.map((row) => ({
              label: categoryLabels[row.category as NoveltyCategory] ?? row.category,
              count: row.count,
              days: row.days,
            }))}
          />
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-500">
            Ausentismo por centro de costo
          </h2>
          <DistributionBar
            labelKey="centro de costo"
            rows={stats.by_cost_center.map((row) => ({
              label: row.cost_center,
              count: row.count,
              days: row.days,
            }))}
          />
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-500">
          <TrendingUp className="size-4" />
          Colaboradores con más novedades
        </h2>
        {stats.top_employees.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-400">
            Sin novedades en el periodo seleccionado.
          </p>
        ) : (
          <ol className="divide-y divide-neutral-100">
            {stats.top_employees.map((row, index) => (
              <li key={row.employee} className="flex items-center gap-3 py-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-600">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-neutral-800">{row.employee}</p>
                  <p className="text-xs text-neutral-400">{row.cost_center ?? "—"}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-neutral-700">
                  {row.count} {row.count === 1 ? "novedad" : "novedades"}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
