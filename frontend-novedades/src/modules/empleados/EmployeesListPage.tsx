import { useEffect, useState } from "react";
import { Search, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { fetchCostCenters, fetchEmployees } from "./api";
import type { CostCenter, Employee } from "@/types";
import { ApiError } from "@/lib/axios";

const statusOptions = [
  { value: "", label: "Todos los estados" },
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
];

const columns: Column<Employee>[] = [
  {
    key: "full_name",
    header: "Colaborador",
    render: (employee) => (
      <div>
        <p className="font-semibold text-neutral-800">{employee.full_name}</p>
        <p className="text-xs text-neutral-400">
          {employee.document_type} {employee.document_number}
        </p>
      </div>
    ),
  },
  { key: "position", header: "Cargo" },
  {
    key: "cost_center",
    header: "Centro de costo",
    render: (employee) => employee.cost_center.name,
  },
  {
    key: "leader",
    header: "Líder",
    render: (employee) => employee.leader?.name ?? "—",
  },
  {
    key: "status",
    header: "Estado",
    align: "center",
    render: (employee) => (
      <Badge variant={employee.status === "active" ? "success" : "neutral"}>
        {employee.status === "active" ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
];

export function EmployeesListPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [costCenterId, setCostCenterId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchCostCenters()
      .then(setCostCenters)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      fetchEmployees({
        search: search || undefined,
        cost_center_id: costCenterId || undefined,
        status: status || undefined,
      })
        .then((res) => setEmployees(res.data))
        .catch((error) => {
          const message =
            error instanceof ApiError ? error.message : "No se pudo cargar el personal.";
          toast.error(message);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, costCenterId, status]);

  const costCenterOptions = [
    { value: "", label: "Todos los centros de costo" },
    ...costCenters.map((cc) => ({ value: String(cc.id), label: cc.name })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personal Activo"
        subtitle="Consulta y administra la nómina de colaboradores."
      />

      <Card padding="sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            icon={Search}
            placeholder="Buscar por nombre o documento"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            options={costCenterOptions}
            value={costCenterId}
            onChange={setCostCenterId}
            placeholder="Todos los centros de costo"
          />
          <Select
            options={statusOptions}
            value={status}
            onChange={setStatus}
            placeholder="Todos los estados"
          />
        </div>
      </Card>

      <DataTable
        data={employees}
        columns={columns}
        loading={loading}
        emptyText="No se encontraron colaboradores."
        getRowIcon={() => (
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary-50 text-primary-500">
            <UserRound className="size-4" />
          </span>
        )}
      />
    </div>
  );
}
