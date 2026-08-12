import { cn } from "@/lib/cn";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "primary" | "secondary";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-neutral-100 text-neutral-600 ring-neutral-200",
  success: "bg-success-500/10 text-success-500 ring-success-500/20",
  warning: "bg-warning-500/10 text-warning-500 ring-warning-500/20",
  danger: "bg-error-500/10 text-error-500 ring-error-500/20",
  primary: "bg-primary-50 text-primary-600 ring-primary-200",
  secondary: "bg-secondary-50 text-secondary-600 ring-secondary-200",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
