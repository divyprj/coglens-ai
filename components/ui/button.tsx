"use client";

import React from "react";
import { Loader2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconOnly?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Style maps                                                         */
/* ------------------------------------------------------------------ */

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-white/[0.08] text-coglens-primary hover:bg-white/[0.14] active:bg-white/[0.10] hover:shadow-[0_2px_12px_rgba(255,255,255,0.04)]",
  secondary:
    "bg-transparent text-coglens-secondary hover:text-coglens-primary hover:bg-white/[0.05] active:bg-white/[0.03]",
  outline:
    "bg-transparent text-coglens-primary border border-coglens-border hover:bg-white/[0.04] active:bg-white/[0.02]",
  danger:
    "bg-coglens-error/10 text-coglens-error hover:bg-coglens-error/20 active:bg-coglens-error/15",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-9 px-4 text-sm gap-2 rounded-lg",
  lg: "h-11 px-5 text-sm gap-2 rounded-xl",
};

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 w-8 rounded-lg",
  md: "h-9 w-9 rounded-lg",
  lg: "h-11 w-11 rounded-xl",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconOnly = false,
      disabled,
      className = "",
      children,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const base =
      "inline-flex items-center justify-center font-medium transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-coglens-bg";

    const disabledClass = isDisabled
      ? "opacity-40 pointer-events-none cursor-not-allowed"
      : "cursor-pointer hover:scale-[1.02] hover:-translate-y-px active:scale-[0.98]";

    const sizeClass = iconOnly
      ? iconOnlySizeStyles[size]
      : sizeStyles[size];

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`${base} ${variantStyles[variant]} ${sizeClass} ${disabledClass} ${className}`}
        {...rest}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        ) : null}
        {!iconOnly && children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
