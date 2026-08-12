import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Download, Check, X as XIcon, UserRound, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { PageLoader, Spinner } from "@/components/ui/Spinner";
import { NoveltyDetail } from "./NoveltyDetail";
import { RejectNoveltyModal } from "./RejectNoveltyModal";
import {
  fetchNovelty,
  fetchNoveltySummary,
  fetchNoveltyTypes,
  downloadNoveltiesExcel,
  updateNoveltyStatus,
  type NoveltyFilters,
} from "./api";
import { fetchCostCenters } from "@/modules/empleados/api";
import type { CostCenter, Novelty, NoveltySummaryRow, NoveltyType } from "@/types";
import { ApiError } from "@/lib/axios";
import { cn } from "@/lib/cn";

const statusOptions = [
  { value: "", label: "Todos los estados" },
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobadas" },
  { value: "rejected", label: "Rechazadas" },
];

export function ListarNovedadesPage() {
  const [rows, setRows] = useState<NoveltySummaryRow[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [types, setTypes] = useState<NoveltyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>("pending");
  const [costCenterId, setCostCenterId] = useState<string | null>(null);
  const [typeId, setTypeId] = useState<string | null>(null);

  const [selected, setSelected] = useState<NoveltySummaryRow | null>(null);
  const [detail, setDetail] = useState<Novelty[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [rejecting, setRejecting] = useState<Novelty | null>(null);
  const [actingOn, setActingOn] = useState<number | null>(null);

  const filters: NoveltyFilters = {
    search: search || undefined,
    status: status || undefined,
    cost_center_id: costCenterId || undefined,
    novelty_type_id: typeId || undefined,
  };

  useEffect(() => {
    Promise.all([fetchCostCenters(), fetchNoveltyTypes()])
      .then(([costCentersData, typesData]) => {
        setCostCenters(costCentersData);
        setTypes(typesData);
      })
      .catch(() => undefined);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      fetchNoveltySummary({
        search: search || undefined,
        status: status || undefined,
        cost_center_id: costCenterId || undefined,
        novelty_type_id: typeId || undefined,
      })
        .then(setRows)
        .catch((error) => {
          const message =
            error instanceof ApiError ? error.message : "No se pudo cargar el resumen.";
          toast.error(message);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, status, costCenterId, typeId]);

  useEffect(() => load(), [load]);

  const openDetail = async (row: NoveltySummaryRow) => {
    setSelected(row);
    setLoadingDetail(true);
    try {
      const novelties = await Promise.all(row.novelty_ids.map((id) => fetchNovelty(id)));
      // Las pendientes primero: son las que exigen decisión.
      const order = { pending: 0, approved: 1, rejected: 2, annulled: 3 } as const;
      setDetail(novelties.sort((a, b) => order[a.status] - order[b.status]));
    } catch {
      toast.error("No se pudo cargar el detalle del colaborador.");
      setSelected(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const refreshDetail = async (row: NoveltySummaryRow) => {
    const novelties = await Promise.all(row.novelty_ids.map((id) => fetchNovelty(id)));
    const order = { pending: 0, approved: 1, rejected: 2, annulled: 3 } as const;
    setDetail(novelties.sort((a, b) => order[a.status] - order[b.status]));
    load();
  };

  const handleApprove = async (novelty: Novelty) => {
    setActingOn(novelty.id);
    try {
      await updateNoveltyStatus(novelty.id, "approved");
      toast.success("Novedad aprobada. Se notificó a quien la registró.");
      if (selected) await refreshDetail(selected);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "No se pudo aprobar la novedad.";
      toast.error(message);
    } finally {
      setActingOn(null);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadNoveltiesExcel(filters);
      toast.success("Consolidado descargado correctamente.");
    } catch {
      toast.error("No se pudo generar el consolidado.");
    } finally {
      setDownloading(false);
    }
  };

  const columns: Column<NoveltySummaryRow & { id: number }>[] = [
    {
      key: "employee",
      header: "Colaborador",
      render: (row) => (
        <div>
          <p className="font-semibold text-neutral-800">{row.employee.full_name}</p>
          <p className="text-xs text-neutral-400">
            CC {row.employee.document_number} · {row.employee.position}
          </p>
        </div>
      ),
    },
    {
      key: "cost_center",
      header: "Centro de costo",
      render: (row) => row.employee.cost_center ?? "—",
    },
    { key: "total", header: "Novedades", align: "center" },
    {
      key: "total_days",
      header: "Días",
      align: "center",
      render: (row) => (row.total_days > 0 ? row.total_days : "—"),
    },
    {
      key: "pending",
      header: "Estado",
      align: "center",
      render: (row) =>
        row.pending > 0 ? (
          <Badge variant="warning">{row.pending} pendiente(s)</Badge>
        ) : (
          <Badge variant="success">Al día</Badge>
        ),
    },
    {
      key: "action",
      header: "",
      align: "right",
      hideOnMobile: true,
      render: () => <ChevronRight className="inline size-4 text-neutral-300" />,
    },
  ];

  const data = rows.map((row) => ({ ...row, id: row.employee.id }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listar Novedades"
        subtitle="Personal con novedades en el periodo. Abre un colaborador para revisar y aprobar."
      >
        <Button icon={Download} isLoading={downloading} onClick={handleDownload}>
          Descargar Excel
        </Button>
      </PageHeader>

      <Card padding="sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            icon={Search}
            placeholder="Buscar por nombre o documento"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            options={statusOptions}
            value={status}
            onChange={setStatus}
            placeholder="Todos los estados"
          />
          <Select
            options={[
              { value: "", label: "Todos los centros de costo" },
              ...costCenters.map((cc) => ({ value: String(cc.id), label: cc.name })),
            ]}
            value={costCenterId}
            onChange={setCostCenterId}
            placeholder="Todos los centros de costo"
          />
          <Select
            options={[
              { value: "", label: "Todos los tipos" },
              ...types.map((type) => ({ value: String(type.id), label: type.name })),
            ]}
            value={typeId}
            onChange={setTypeId}
            placeholder="Todos los tipos"
          />
        </div>
      </Card>

      {loading ? (
        <PageLoader />
      ) : (
        <DataTable
          data={data}
          columns={columns}
          emptyText="No hay colaboradores con novedades para estos filtros."
          onRowClick={openDetail}
          getRowIcon={() => (
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary-50 text-primary-500">
              <UserRound className="size-4" />
            </span>
          )}
        />
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Novedades de ${selected.employee.full_name}` : ""}
        className="max-w-3xl"
      >
        {loadingDetail ? (
          <div className="flex justify-center py-12">
            <Spinner className="size-8" />
          </div>
        ) : (
          <div className="space-y-4">
            {selected && (
              <div className="flex flex-wrap gap-4 rounded-xl bg-neutral-50 p-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-400">Documento</p>
                  <p className="font-semibold text-neutral-800">
                    {selected.employee.document_number}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-400">Centro de costo</p>
                  <p className="font-semibold text-neutral-800">
                    {selected.employee.cost_center ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-400">Líder</p>
                  <p className="font-semibold text-neutral-800">
                    {selected.employee.leader ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-400">Pendientes</p>
                  <p
                    className={cn(
                      "font-semibold",
                      selected.pending > 0 ? "text-warning-500" : "text-success-500"
                    )}
                  >
                    {selected.pending}
                  </p>
                </div>
              </div>
            )}

            {detail.map((novelty) => (
              <div key={novelty.id}>
                <NoveltyDetail novelty={novelty} />
                {novelty.status === "pending" && (
                  <div className="mt-2 flex justify-end gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      icon={XIcon}
                      onClick={() => setRejecting(novelty)}
                    >
                      Rechazar
                    </Button>
                    <Button
                      variant="save"
                      size="sm"
                      icon={Check}
                      isLoading={actingOn === novelty.id}
                      onClick={() => handleApprove(novelty)}
                    >
                      Aprobar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      <RejectNoveltyModal
        novelty={rejecting}
        onClose={() => setRejecting(null)}
        onRejected={() => {
          if (selected) refreshDetail(selected);
        }}
      />
    </div>
  );
}
