import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/cn";
import type { NoveltyField } from "@/types";

type FieldValue = string | string[];

interface DynamicFieldsProps {
  fields: NoveltyField[];
  values: Record<string, FieldValue>;
  errors?: Record<string, string>;
  onChange: (id: string, value: FieldValue) => void;
}

/**
 * Renderiza los campos que Gestión Humana parametrizó para el tipo de novedad.
 *
 * El esquema llega del backend (`novelty_types.config.fields`), así que agregar
 * un campo nuevo no requiere tocar este componente.
 */
export function DynamicFields({ fields, values, errors = {}, onChange }: DynamicFieldsProps) {
  if (fields.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const value = values[field.id] ?? (field.type === "checklist" ? [] : "");
        const error = errors[field.id];
        const isWide = ["textarea", "checklist"].includes(field.type);

        return (
          <div key={field.id} className={cn(isWide && "sm:col-span-2")}>
            {field.type === "select" && (
              <Select
                label={`${field.label}${field.required ? " *" : ""}`}
                placeholder={`Selecciona ${field.label.toLowerCase()}`}
                value={(value as string) || null}
                onChange={(next) => onChange(field.id, next)}
                error={error}
                options={(field.options ?? []).map((option) => ({
                  value: option,
                  label: option,
                }))}
              />
            )}

            {field.type === "checklist" && (
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-neutral-700">
                  {field.label}
                  {field.required ? " *" : ""}
                </span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(field.options ?? []).map((option) => {
                    const selected = Array.isArray(value) && value.includes(option);
                    return (
                      <label
                        key={option}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
                          selected
                            ? "border-primary-300 bg-primary-50"
                            : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(event) => {
                            const current = Array.isArray(value) ? value : [];
                            onChange(
                              field.id,
                              event.target.checked
                                ? [...current, option]
                                : current.filter((item) => item !== option)
                            );
                          }}
                          className="size-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-neutral-700">{option}</span>
                      </label>
                    );
                  })}
                </div>
                {error && <p className="text-xs font-medium text-error-500">{error}</p>}
              </div>
            )}

            {field.type === "textarea" && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={`field-${field.id}`}
                  className="text-sm font-semibold text-neutral-700"
                >
                  {field.label}
                  {field.required ? " *" : ""}
                </label>
                <textarea
                  id={`field-${field.id}`}
                  rows={3}
                  value={value as string}
                  onChange={(event) => onChange(field.id, event.target.value)}
                  placeholder={`Ingresa ${field.label.toLowerCase()}`}
                  className={cn(
                    "w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800",
                    "placeholder:text-neutral-400 outline-none transition-all duration-200",
                    "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
                    error && "border-error-500 focus:border-error-500 focus:ring-error-500/20"
                  )}
                />
                {error && <p className="text-xs font-medium text-error-500">{error}</p>}
              </div>
            )}

            {["text", "number", "date", "time"].includes(field.type) && (
              <Input
                label={`${field.label}${field.required ? " *" : ""}`}
                type={field.type}
                value={value as string}
                onChange={(event) => onChange(field.id, event.target.value)}
                placeholder={
                  field.type === "text" || field.type === "number"
                    ? `Ingresa ${field.label.toLowerCase()}`
                    : undefined
                }
                error={error}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
