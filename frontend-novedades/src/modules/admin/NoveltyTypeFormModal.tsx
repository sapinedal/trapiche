import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { createNoveltyType, updateNoveltyType, type NoveltyTypePayload } from "./api";
import { categoryLabels } from "@/modules/novedades/noveltyIcons";
import type { FieldType, NoveltyCategory, NoveltyField, NoveltyType } from "@/types";
import { ApiError } from "@/lib/axios";
import { cn } from "@/lib/cn";

const fieldTypeOptions: { value: FieldType; label: string }[] = [
  { value: "text", label: "Texto corto" },
  { value: "textarea", label: "Texto largo" },
  { value: "number", label: "Número" },
  { value: "date", label: "Fecha" },
  { value: "time", label: "Hora" },
  { value: "select", label: "Lista desplegable" },
  { value: "checklist", label: "Selección múltiple" },
];

const needsOptions = (type: FieldType) => type === "select" || type === "checklist";

/** Deriva un id válido (minúsculas, sin acentos) a partir de la etiqueta. */
function slugify(label: string) {
  return label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^([0-9])/, "campo_$1");
}

const emptyForm: NoveltyTypePayload = {
  name: "",
  description: "",
  code: "",
  category: "permiso",
  is_paid: true,
  requires_attachment: false,
  is_active: true,
  config: { measurement: "days", requires_approval: true, max_days: null, fields: [] },
};

export function NoveltyTypeFormModal({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean;
  editing: NoveltyType | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<NoveltyTypePayload>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      editing
        ? {
            name: editing.name,
            description: editing.description ?? "",
            code: editing.code,
            category: editing.category,
            is_paid: editing.is_paid,
            requires_attachment: editing.requires_attachment,
            is_active: editing.is_active,
            config: {
              measurement: editing.config.measurement,
              requires_approval: editing.config.requires_approval,
              max_days: editing.config.max_days,
              fields: editing.config.fields.map((field) => ({ ...field })),
            },
          }
        : emptyForm
    );
  }, [open, editing]);

  const setField = <K extends keyof NoveltyTypePayload>(key: K, value: NoveltyTypePayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateFieldAt = (index: number, patch: Partial<NoveltyField>) =>
    setForm((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        fields: prev.config.fields.map((field, i) => (i === index ? { ...field, ...patch } : field)),
      },
    }));

  const addField = () =>
    setForm((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        fields: [
          ...prev.config.fields,
          { id: "", label: "", type: "text" as FieldType, required: false },
        ],
      },
    }));

  const removeField = (index: number) =>
    setForm((prev) => ({
      ...prev,
      config: { ...prev.config, fields: prev.config.fields.filter((_, i) => i !== index) },
    }));

  const handleSubmit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = "El nombre es obligatorio.";
    if (!form.code.trim()) nextErrors.code = "El código es obligatorio.";

    form.config.fields.forEach((field, index) => {
      if (!field.label.trim()) nextErrors[`field_${index}`] = "La etiqueta es obligatoria.";
      else if (needsOptions(field.type) && (field.options ?? []).length === 0) {
        nextErrors[`field_${index}`] = "Agrega al menos una opción.";
      }
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // El id se deriva de la etiqueta si el usuario no lo definió.
    const payload: NoveltyTypePayload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      config: {
        ...form.config,
        fields: form.config.fields.map((field) => ({
          ...field,
          id: field.id || slugify(field.label),
          options: needsOptions(field.type) ? field.options ?? [] : undefined,
        })),
      },
    };

    setSubmitting(true);
    try {
      if (editing) {
        await updateNoveltyType(editing.id, payload);
        toast.success("Tipo de novedad actualizado.");
      } else {
        await createNoveltyType(payload);
        toast.success("Tipo de novedad creado.");
      }
      onSaved();
      onClose();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "No se pudo guardar el tipo.";
      toast.error(message);
      if (error instanceof ApiError && error.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([key, messages]) => {
          apiErrors[key] = messages[0];
        });
        setErrors(apiErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Editar tipo de novedad" : "Nuevo tipo de novedad"}
      className="max-w-3xl"
    >
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nombre *"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
            error={errors.name}
          />
          <Input
            label="Código *"
            value={form.code}
            onChange={(event) => setField("code", event.target.value.toUpperCase())}
            hint="Identificador corto, por ejemplo INC_GEN"
            error={errors.code ?? errors["code"]}
          />
          <div className="sm:col-span-2">
            <Input
              label="Descripción"
              value={form.description ?? ""}
              onChange={(event) => setField("description", event.target.value)}
              placeholder="Texto de ayuda que verá quien registra la novedad"
            />
          </div>
          <Select
            label="Categoría *"
            value={form.category}
            onChange={(value) => setField("category", value as NoveltyCategory)}
            options={Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))}
          />
          <Select
            label="Se mide en *"
            value={form.config.measurement}
            onChange={(value) =>
              setField("config", { ...form.config, measurement: value as "days" | "hours" })
            }
            options={[
              { value: "days", label: "Días" },
              { value: "hours", label: "Horas" },
            ]}
          />
        </section>

        <section className="flex flex-wrap gap-4">
          {[
            { key: "is_paid" as const, label: "Remunerada" },
            { key: "requires_attachment" as const, label: "Exige soporte adjunto" },
            { key: "is_active" as const, label: "Activa" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2"
            >
              <input
                type="checkbox"
                checked={Boolean(form[key])}
                onChange={(event) => setField(key, event.target.checked)}
                className="size-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-neutral-700">{label}</span>
            </label>
          ))}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-800">Campos del formulario</h3>
              <p className="text-xs text-neutral-500">
                Definen qué información se pedirá al registrar esta novedad.
              </p>
            </div>
            <Button variant="outline" size="sm" icon={Plus} onClick={addField}>
              Agregar campo
            </Button>
          </div>

          {form.config.fields.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 py-8 text-center text-sm text-neutral-400">
              Sin campos adicionales. La novedad solo pedirá colaborador, fechas y observaciones.
            </p>
          ) : (
            <div className="space-y-3">
              {form.config.fields.map((field, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-xl border bg-white p-4",
                    errors[`field_${index}`] ? "border-error-500" : "border-neutral-200"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <GripVertical className="mt-2.5 size-4 shrink-0 text-neutral-300" />
                    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        label="Etiqueta"
                        value={field.label}
                        onChange={(event) =>
                          updateFieldAt(index, {
                            label: event.target.value,
                            id: field.id || slugify(event.target.value),
                          })
                        }
                        placeholder="Por ejemplo: EPS"
                      />
                      <Select
                        label="Tipo de campo"
                        value={field.type}
                        onChange={(value) =>
                          updateFieldAt(index, {
                            type: value as FieldType,
                            options: needsOptions(value as FieldType) ? field.options ?? [] : undefined,
                          })
                        }
                        options={fieldTypeOptions}
                      />
                      {needsOptions(field.type) && (
                        <div className="sm:col-span-2">
                          <Input
                            label="Opciones"
                            value={(field.options ?? []).join(", ")}
                            onChange={(event) =>
                              updateFieldAt(index, {
                                options: event.target.value
                                  .split(",")
                                  .map((option) => option.trim())
                                  .filter(Boolean),
                              })
                            }
                            hint="Sepáralas con comas"
                          />
                        </div>
                      )}
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(event) =>
                            updateFieldAt(index, { required: event.target.checked })
                          }
                          className="size-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-neutral-700">Obligatorio</span>
                      </label>
                      <div className="flex items-center justify-end">
                        {field.id && <Badge variant="neutral">id: {field.id}</Badge>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      iconOnly
                      title="Eliminar campo"
                      className="mt-5 text-error-500 hover:bg-error-500/10"
                      onClick={() => removeField(index)}
                    />
                  </div>
                  {errors[`field_${index}`] && (
                    <p className="mt-2 text-xs font-medium text-error-500">
                      {errors[`field_${index}`]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="save" isLoading={submitting} onClick={handleSubmit}>
            {editing ? "Guardar cambios" : "Crear tipo"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
