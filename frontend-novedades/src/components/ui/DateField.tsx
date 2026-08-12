import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/cn";

registerLocale("es", es);

interface DateFieldProps {
  label?: string;
  value: Date | null | undefined;
  onChange: (date: Date | null) => void;
  error?: string;
  placeholder?: string;
  minDate?: Date;
  className?: string;
}

export function DateField({
  label,
  value,
  onChange,
  error,
  placeholder = "Selecciona una fecha",
  minDate,
  className,
}: DateFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <label className="text-sm font-semibold text-neutral-700">{label}</label>}
      <DatePicker
        selected={value ?? null}
        onChange={onChange}
        locale="es"
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholder}
        minDate={minDate}
        /* Portalled so the calendar is never clipped by a modal's overflow. */
        portalId="datepicker-portal"
        className={cn(
          "h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-800",
          "placeholder:text-neutral-400 outline-none transition-all duration-200",
          "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
          error && "border-error-500 focus:border-error-500 focus:ring-error-500/20"
        )}
      />
      {error && <p className="text-xs font-medium text-error-500">{error}</p>}
    </div>
  );
}
