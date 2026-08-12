import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Power } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { NoveltyTypeFormModal } from "./NoveltyTypeFormModal";
import { fetchAllNoveltyTypes, deleteNoveltyType } from "./api";
import { categoryLabels, getNoveltyIcon } from "@/modules/novedades/noveltyIcons";
import type { NoveltyType } from "@/types";
import { ApiError } from "@/lib/axios";

export function TiposNovedadPage() {
  const [types, setTypes] = useState<NoveltyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NoveltyType | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchAllNoveltyTypes()
      .then(setTypes)
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "No se pudieron cargar los tipos.";
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  const handleToggle = async (type: NoveltyType) => {
    try {
      const message = await deleteNoveltyType(type.id);
      toast.success(message ?? "Tipo actualizado.");
      load();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "No se pudo actualizar el tipo.";
      toast.error(message);
    }
  };

  const columns: Column<NoveltyType>[] = [
    {
      key: "name",
      header: "Tipo",
      render: (type) => (
        <div>
          <p className="font-semibold text-neutral-800">{type.name}</p>
          <p className="text-xs text-neutral-400">{type.description ?? type.code}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Categoría",
      render: (type) => categoryLabels[type.category] ?? type.category,
    },
    {
      key: "measurement",
      header: "Mide",
      align: "center",
      render: (type) => (type.config.measurement === "days" ? "Días" : "Horas"),
    },
    {
      key: "fields",
      header: "Campos",
      align: "center",
      render: (type) => (
        <Badge variant={type.config.fields.length > 0 ? "primary" : "neutral"}>
          {type.config.fields.length}
        </Badge>
      ),
    },
    {
      key: "flags",
      header: "Reglas",
      render: (type) => (
        <div className="flex flex-wrap gap-1">
          <Badge variant={type.is_paid ? "success" : "neutral"}>
            {type.is_paid ? "Remunerada" : "No remunerada"}
          </Badge>
          {type.requires_attachment && <Badge variant="warning">Soporte</Badge>}
        </div>
      ),
    },
    {
      key: "is_active",
      header: "Estado",
      align: "center",
      render: (type) => (
        <Badge variant={type.is_active ? "success" : "neutral"}>
          {type.is_active ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tipos de Novedad"
        subtitle="Parametriza qué novedades existen y qué información pide cada una."
      >
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Nuevo tipo
        </Button>
      </PageHeader>

      <DataTable
        data={types}
        columns={columns}
        loading={loading}
        emptyText="No hay tipos de novedad parametrizados."
        getRowIcon={(type) => {
          const Icon = getNoveltyIcon(type.name, type.category);
          return (
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary-50 text-primary-500">
              <Icon className="size-4" />
            </span>
          );
        }}
        getRowActions={(type) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="xs"
              icon={Pencil}
              iconOnly
              title="Editar"
              onClick={() => {
                setEditing(type);
                setModalOpen(true);
              }}
            />
            <Button
              variant="ghost"
              size="xs"
              icon={Power}
              iconOnly
              title={type.is_active ? "Desactivar" : "Eliminar"}
              className="text-error-500 hover:bg-error-500/10"
              onClick={() => handleToggle(type)}
            />
          </div>
        )}
      />

      <NoveltyTypeFormModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
