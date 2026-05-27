import React from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type CardVariant = "default" | "elevated" | "interactive" | "glass";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

/* ------------------------------------------------------------------ */
/*  Variant styles                                                     */
/* ------------------------------------------------------------------ */

const variantStyles: Record<CardVariant, string> = {
  default: "",
  elevated: "shadow-lg shadow-black/30",
  interactive:
    "transition-all duration-300 hover:bg-white/[0.03] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 cursor-pointer",
  glass:
    "bg-coglens-card/60 backdrop-blur-xl border border-coglens-border",
};

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */

function Card({
  variant = "default",
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={`bg-coglens-card border border-coglens-border rounded-xl ${variantStyles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card.Header                                                        */
/* ------------------------------------------------------------------ */

function CardHeader({ className = "", children, ...rest }: CardHeaderProps) {
  return (
    <div
      className={`px-5 py-4 border-b border-coglens-border ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card.Content                                                       */
/* ------------------------------------------------------------------ */

function CardContent({ className = "", children, ...rest }: CardContentProps) {
  return (
    <div className={`px-5 py-4 ${className}`} {...rest}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card.Footer                                                        */
/* ------------------------------------------------------------------ */

function CardFooter({ className = "", children, ...rest }: CardFooterProps) {
  return (
    <div
      className={`px-5 py-3 border-t border-coglens-border ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardContent, CardFooter };
export type { CardProps, CardVariant };
