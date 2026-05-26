import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type BadgeVariant = "verified" | "misleading" | "false" | "success" | "warning" | "destructive" | "error" | "default";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  withIcon?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Variant styles                                                     */
/* ------------------------------------------------------------------ */

const variantStyles: Record<string, string> = {
  verified:
    "bg-coglens-success/10 text-coglens-success border-coglens-success/20",
  success:
    "bg-coglens-success/10 text-coglens-success border-coglens-success/20",
  misleading:
    "bg-coglens-warning/10 text-coglens-warning border-coglens-warning/20",
  warning:
    "bg-coglens-warning/10 text-coglens-warning border-coglens-warning/20",
  false: "bg-coglens-error/10 text-coglens-error border-coglens-error/20",
  destructive: "bg-coglens-error/10 text-coglens-error border-coglens-error/20",
  error: "bg-coglens-error/10 text-coglens-error border-coglens-error/20",
  default: "bg-white/[0.06] text-coglens-secondary border-coglens-border",
};

const variantIcons: Record<string, React.ReactNode> = {
  verified: <CheckCircle2 className="h-3 w-3" />,
  success: <CheckCircle2 className="h-3 w-3" />,
  misleading: <AlertTriangle className="h-3 w-3" />,
  warning: <AlertTriangle className="h-3 w-3" />,
  false: <XCircle className="h-3 w-3" />,
  destructive: <XCircle className="h-3 w-3" />,
  error: <XCircle className="h-3 w-3" />,
  default: null,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function Badge({
  variant = "default",
  withIcon = true,
  className = "",
  children,
  ...rest
}: BadgeProps) {
  const icon = withIcon ? variantIcons[variant] : null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5 ${variantStyles[variant] ?? variantStyles.default} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
