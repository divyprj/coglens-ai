import React from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SectionHeaderProps {
  title: string;
  /** Subtitle text (also accepts 'description' as an alias) */
  subtitle?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function SectionHeader({
  title,
  subtitle,
  description,
  action,
  className = "",
}: SectionHeaderProps) {
  const text = subtitle || description;

  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight text-coglens-primary">
          {title}
        </h2>
        {text && (
          <p className="mt-1 text-sm text-coglens-secondary leading-relaxed">
            {text}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export { SectionHeader };
export type { SectionHeaderProps };
