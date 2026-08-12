import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "save" | "secondary" | "outline" | "ghost" | "danger";
type Size = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  iconOnly?: boolean;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary-500 text-white hover:bg-primary-600 hover:shadow-md",
  save: "bg-secondary-500 text-white hover:bg-secondary-600 hover:shadow-md",
  secondary: "bg-neutral-800 text-white hover:bg-neutral-700 hover:shadow-md",
  outline: "border-2 border-primary-500 text-primary-500 hover:bg-primary-50",
  ghost: "text-neutral-700 hover:bg-neutral-100",
  danger: "bg-error-500 text-white hover:bg-red-600 hover:shadow-md",
};

const sizeClasses: Record<Size, { base: string; iconOnly: string }> = {
  xs: { base: "px-2 py-1 text-xs", iconOnly: "p-1.5 text-xs" },
  sm: { base: "px-3 py-1.5 text-sm", iconOnly: "p-1.5 text-sm" },
  md: { base: "px-4 py-2 text-sm", iconOnly: "p-2 text-sm" },
  lg: { base: "px-6 py-3 text-base", iconOnly: "p-3 text-base" },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      icon: Icon,
      iconPosition = "left",
      iconOnly = false,
      isLoading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold shadow-sm transition-all duration-200",
          variantClasses[variant],
          iconOnly ? sizeClasses[size].iconOnly : sizeClasses[size].base,
          isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className={cn("size-4 animate-spin", !iconOnly && children ? "mr-2" : "")} />
        ) : (
          Icon &&
          iconPosition === "left" && (
            <Icon className={cn("size-4", iconOnly ? "" : "mr-2")} />
          )
        )}
        {children}
        {!isLoading && Icon && iconPosition === "right" && (
          <Icon className={cn("size-4", iconOnly ? "" : "ml-2")} />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
