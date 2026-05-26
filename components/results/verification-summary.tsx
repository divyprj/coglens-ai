import React from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface VerificationCounts {
  verified: number;
  misleading: number;
  false: number;
}

interface VerificationSummaryProps {
  counts: VerificationCounts;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Stat items config                                                  */
/* ------------------------------------------------------------------ */

interface StatConfig {
  key: keyof VerificationCounts;
  label: string;
  icon: React.ReactNode;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

const stats: StatConfig[] = [
  {
    key: "verified",
    label: "Verified",
    icon: <CheckCircle2 className="h-4 w-4" />,
    textColor: "text-coglens-success",
    bgColor: "bg-coglens-success/10",
    borderColor: "border-coglens-success/20",
  },
  {
    key: "misleading",
    label: "Misleading",
    icon: <AlertTriangle className="h-4 w-4" />,
    textColor: "text-coglens-warning",
    bgColor: "bg-coglens-warning/10",
    borderColor: "border-coglens-warning/20",
  },
  {
    key: "false",
    label: "False",
    icon: <XCircle className="h-4 w-4" />,
    textColor: "text-coglens-error",
    bgColor: "bg-coglens-error/10",
    borderColor: "border-coglens-error/20",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function VerificationSummary({
  counts,
  className = "",
}: VerificationSummaryProps) {
  const total = counts.verified + counts.misleading + counts.false;

  return (
    <div className={className}>
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className={`flex flex-col items-center justify-center rounded-xl border px-4 py-3.5 ${stat.bgColor} ${stat.borderColor}`}
          >
            <span className={stat.textColor}>{stat.icon}</span>
            <span
              className={`mt-1.5 text-xl font-semibold tracking-tight ${stat.textColor}`}
            >
              {counts[stat.key]}
            </span>
            <span className="text-xs text-coglens-secondary mt-0.5">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Horizontal bar */}
      {total > 0 && (
        <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
          {counts.verified > 0 && (
            <div
              className="bg-coglens-success transition-all duration-500"
              style={{ width: `${(counts.verified / total) * 100}%` }}
            />
          )}
          {counts.misleading > 0 && (
            <div
              className="bg-coglens-warning transition-all duration-500"
              style={{ width: `${(counts.misleading / total) * 100}%` }}
            />
          )}
          {counts.false > 0 && (
            <div
              className="bg-coglens-error transition-all duration-500"
              style={{ width: `${(counts.false / total) * 100}%` }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export { VerificationSummary };
export type { VerificationSummaryProps, VerificationCounts };
