import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TrendDirection = "up" | "down" | "neutral";

interface AnalyticsCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    direction: TrendDirection;
  };
  icon?: React.ReactNode;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Trend helpers                                                      */
/* ------------------------------------------------------------------ */

const trendConfig: Record<
  TrendDirection,
  { icon: React.ReactNode; color: string }
> = {
  up: {
    icon: <TrendingUp className="h-3 w-3" />,
    color: "text-coglens-success",
  },
  down: {
    icon: <TrendingDown className="h-3 w-3" />,
    color: "text-coglens-error",
  },
  neutral: {
    icon: <Minus className="h-3 w-3" />,
    color: "text-coglens-muted",
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function AnalyticsCard({
  label,
  value,
  trend,
  icon,
  className = "",
}: AnalyticsCardProps) {
  return (
    <div
      className={`bg-coglens-card border border-coglens-border rounded-xl px-5 py-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-coglens-muted">
          {label}
        </span>
        {icon && (
          <span className="text-coglens-muted [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-semibold tracking-tight text-coglens-primary">
          {value}
        </span>

        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium pb-0.5 ${trendConfig[trend.direction].color}`}
          >
            {trendConfig[trend.direction].icon}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

export { AnalyticsCard };
export type { AnalyticsCardProps, TrendDirection };
