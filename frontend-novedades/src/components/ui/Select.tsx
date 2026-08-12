import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { Z_INDEX } from "@/lib/zIndex";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function Select({
  label,
  error,
  placeholder = "Selecciona una opción",
  options,
  value,
  onChange,
  disabled,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  useLayoutEffect(() => {
    if (open && triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        listRef.current &&
        !listRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleScroll() {
      if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleScroll);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <span className="text-sm font-semibold text-neutral-700">{label}</span>}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-neutral-300 bg-white px-3 text-sm",
          "outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
          !selected && "text-neutral-400",
          error && "border-error-500",
          disabled && "cursor-not-allowed bg-neutral-100 text-neutral-400"
        )}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-neutral-400 transition-transform", open && "rotate-180")} />
      </button>
      {error && <p className="text-xs font-medium text-error-500">{error}</p>}

      {open &&
        rect &&
        createPortal(
          <div
            ref={listRef}
            style={{
              position: "fixed",
              top: rect.bottom + 4,
              left: rect.left,
              width: rect.width,
              zIndex: Z_INDEX.popover,
            }}
            className="animate-scale-in max-h-64 overflow-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
          >
            {options.length === 0 && (
              <p className="px-3 py-2 text-sm text-neutral-400">Sin opciones</p>
            )}
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-primary-50",
                  option.value === value ? "font-semibold text-primary-600" : "text-neutral-700"
                )}
              >
                {option.label}
                {option.value === value && <Check className="size-4" />}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
