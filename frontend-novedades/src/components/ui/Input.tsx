import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon: Icon, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-neutral-700">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-800",
              "placeholder:text-neutral-400 outline-none transition-all duration-200",
              "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
              Icon && "pl-9",
              error && "border-error-500 focus:border-error-500 focus:ring-error-500/20",
              props.disabled && "cursor-not-allowed bg-neutral-100 text-neutral-400",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-medium text-error-500">{error}</p>}
        {!error && hint && <p className="text-xs text-neutral-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
