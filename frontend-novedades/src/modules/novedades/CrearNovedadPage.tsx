import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, ChevronRight, Paperclip, Check } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DateField } from "@/components/ui/DateField";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { DynamicFields } from "./DynamicFields";
import { getNoveltyIcon, categoryLabels } from "./noveltyIcons";
import { createNovelty, fetchNoveltyTypes } from "./api";
import { fetchEmployees } from "@/modules/empleados/api";
import type { Employee, NoveltyType } from "@/types";
import { ApiError } from "@/lib/axios";
import { cn } from "@/lib/cn";

type FieldValue = string | string[];

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(start: Date, end: Date) {
  const ms = end.setHours(0, 0, 0, 0) - new Date(start).setHours(0, 0, 0, 0);
  return Math.floor(ms / 86_400_000) + 1;
}

export function CrearNovedadPage() {
  const navigate = useNavigate();

  const [types, setTypes] = useState<NoveltyType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState<NoveltyType | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [observations, setObservations] = useState("");
  const [dynamicValues, setDynamicValues] = useState<Record<string, FieldValue>>({});
  const [attachment, setAttachment] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fetchNoveltyTypes(), fetchEmployees({ status: "active" })])
      .then(([typesData, employeesData]) => {
        setTypes(typesData);
        setEmployees(employeesData.data);
      })
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "No se pudo cargar la información.";
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, []);

  const groupedTypes = useMemo(() => {
    const groups = new Map<string, NoveltyType[]>();
    types.forEach((type) => {
      const list = groups.get(type.category) ?? [];
      list.push(type);
      groups.set(type.category, list);
    });
    return [...groups.entries()];
  }, [types]);

  const totalDays = startDate && endDate ? daysBetween(startDate, endDate) : null;

  const resetForm = () => {
    setSelectedType(null);
    setEmployeeId(null);
    setStartDate(null);
    setEndDate(null);
    setObservations("");
    setDynamicValues({});
    setAttachment(null);
    setErrors({});
    setFieldErrors({});
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const nextFieldErrors: Record<string, string> = {};

    if (!employeeId) nextErrors.employee = "Selecciona un colaborador.";
    if (!startDate) nextErrors.startDate = "Indica la fecha de inicio.";
    if (!endDate) nextErrors.endDate = "Indica la fecha de fin.";
    if (startDate && endDate && endDate < startDate) {
      nextErrors.endDate = "La fecha de fin debe ser igual o posterior a la de inicio.";
    }
    if (selectedType?.requires_attachment && !attachment) {
      nextErrors.attachment = "Este tipo de novedad exige adjuntar el soporte.";
    }

    selectedType?.config.fields.forEach((field) => {
      if (!field.required) return;
      const value = dynamicValues[field.id];
      const empty = value == null || value === "" || (Array.isArray(value) && value.length === 0);
      if (empty) nextFieldErrors[field.id] = `El campo "${field.label}" es obligatorio.`;
    });

    setErrors(nextErrors);
    setFieldErrors(nextFieldErrors);

    return Object.keys(nextErrors).length === 0 && Object.keys(nextFieldErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!selectedType || !validate()) return;

    setSubmitting(true);
    try {
      await createNovelty({
        employee_id: Number(employeeId),
        novelty_type_id: selectedType.id,
        start_date: toISODate(startDate!),
        end_date: toISODate(endDate!),
        total_days: selectedType.config.measurement === "days" ? (totalDays ?? undefined) : undefined,
        observations: observations || undefined,
        data: dynamicValues,
        attachment,
      });

      toast.success("Novedad registrada correctamente.");
      resetForm();
      navigate("/novedades/mias");
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        // El backend valida los campos dinámicos como `data.<id>`.
        const nextFieldErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([key, messages]) => {
          if (key.startsWith("data.")) nextFieldErrors[key.slice(5)] = messages[0];
        });
        setFieldErrors(nextFieldErrors);
      }
      const message =
        error instanceof ApiError ? error.message : "No se pudo registrar la novedad.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crear Novedad"
        subtitle={
          selectedType
            ? "Completa la información requerida para este tipo de novedad."
            : "Selecciona el tipo de novedad que quieres reportar."
        }
      >
        {selectedType && (
          <Button variant="ghost" icon={ArrowLeft} onClick={resetForm}>
            Cambiar tipo
          </Button>
        )}
      </PageHeader>

      <AnimatePresence mode="wait">
        {!selectedType ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {groupedTypes.map(([category, categoryTypes]) => (
              <section key={category} className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  {categoryLabels[category as keyof typeof categoryLabels] ?? category}
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryTypes.map((type) => {
                    const Icon = getNoveltyIcon(type.name, type.category);
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        className="group flex items-start gap-3 rounded-2xl border-2 border-neutral-100 bg-white p-4 text-left shadow-sm transition-all hover:border-primary-200 hover:shadow-md active:scale-[0.98]"
                      >
                        <span className="rounded-xl bg-primary-50 p-3 text-primary-500 transition-colors group-hover:bg-primary-100">
                          <Icon className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold leading-tight text-neutral-800">
                            {type.name}
                          </span>
                          {type.description && (
                            <span className="mt-0.5 block text-xs text-neutral-500">
                              {type.description}
                            </span>
                          )}
                          <span className="mt-2 flex flex-wrap gap-1.5">
                            <Badge variant={type.is_paid ? "success" : "neutral"}>
                              {type.is_paid ? "Remunerada" : "No remunerada"}
                            </Badge>
                            {type.requires_attachment && (
                              <Badge variant="warning">Requiere soporte</Badge>
                            )}
                          </span>
                        </span>
                        <ChevronRight className="size-5 shrink-0 text-neutral-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary-500" />
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="mx-auto max-w-3xl space-y-5"
          >
            <Card className="border-l-4 border-l-primary-500" padding="sm">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = getNoveltyIcon(selectedType.name, selectedType.category);
                  return (
                    <span className="rounded-xl bg-primary-50 p-3 text-primary-500">
                      <Icon className="size-5" />
                    </span>
                  );
                })()}
                <div className="min-w-0">
                  <p className="font-bold text-neutral-800">{selectedType.name}</p>
                  <p className="text-xs text-neutral-500">
                    Se mide en {selectedType.config.measurement === "days" ? "días" : "horas"}
                    {totalDays != null && ` · ${totalDays} día(s) seleccionado(s)`}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="space-y-5">
              <Select
                label="Colaborador *"
                placeholder="Selecciona un colaborador"
                value={employeeId}
                onChange={(value) => setEmployeeId(value)}
                error={errors.employee}
                options={employees.map((employee) => ({
                  value: String(employee.id),
                  label: `${employee.full_name} — ${employee.document_number}`,
                }))}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DateField
                  label="Fecha inicio *"
                  value={startDate}
                  onChange={setStartDate}
                  error={errors.startDate}
                />
                <DateField
                  label="Fecha fin *"
                  value={endDate}
                  onChange={setEndDate}
                  minDate={startDate ?? undefined}
                  error={errors.endDate}
                />
              </div>

              <DynamicFields
                fields={selectedType.config.fields}
                values={dynamicValues}
                errors={fieldErrors}
                onChange={(id, value) => {
                  setDynamicValues((prev) => ({ ...prev, [id]: value }));
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                  });
                }}
              />

              <Input
                label="Observaciones"
                value={observations}
                onChange={(event) => setObservations(event.target.value)}
                placeholder="Justificación o detalle adicional (opcional)"
              />

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-neutral-700">
                  Soporte {selectedType.requires_attachment ? "*" : "(opcional)"}
                </span>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed p-4 transition-colors",
                    attachment
                      ? "border-secondary-300 bg-secondary-50"
                      : "border-neutral-200 bg-neutral-50 hover:border-primary-300",
                    errors.attachment && "border-error-500"
                  )}
                >
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(event) => {
                      setAttachment(event.target.files?.[0] ?? null);
                      setErrors((prev) => ({ ...prev, attachment: "" }));
                    }}
                  />
                  {attachment ? (
                    <Check className="size-5 shrink-0 text-secondary-500" />
                  ) : (
                    <Paperclip className="size-5 shrink-0 text-neutral-400" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm text-neutral-600">
                    {attachment?.name ?? "Adjuntar PDF o imagen (máx. 5 MB)"}
                  </span>
                </label>
                {errors.attachment && (
                  <p className="text-xs font-medium text-error-500">{errors.attachment}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
                <Button variant="ghost" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button variant="save" isLoading={submitting} onClick={handleSubmit}>
                  Registrar novedad
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
