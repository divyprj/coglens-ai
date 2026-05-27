"use client";

import React, { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TrustScoreProps {
  /** Score from 0 to 100 */
  score: number;
  /** Optional label displayed above the score */
  label?: string;
  /** Show the numeric value */
  showValue?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getScoreColor(score: number): string {
  if (score > 70) return "bg-coglens-success";
  if (score >= 40) return "bg-coglens-warning";
  return "bg-coglens-error";
}

function getScoreTextColor(score: number): string {
  if (score > 70) return "text-coglens-success";
  if (score >= 40) return "text-coglens-warning";
  return "text-coglens-error";
}

function getScoreLabel(score: number): string {
  if (score > 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function getScoreBadgeClasses(score: number): string {
  if (score > 70) return "bg-coglens-success/10 text-coglens-success";
  if (score >= 40) return "bg-coglens-warning/10 text-coglens-warning";
  return "bg-coglens-error/10 text-coglens-error";
}

const heightMap: Record<string, string> = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-2.5",
};

const valueTextMap: Record<string, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function TrustScore({
  score,
  label = "Trust Score",
  showValue = true,
  size = "md",
  className = "",
}: TrustScoreProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const clampedScore = Math.max(0, Math.min(100, score));

  useEffect(() => {
    // Animate width on mount / score change
    const timer = setTimeout(() => {
      setAnimatedWidth(clampedScore);
    }, 50);
    return () => clearTimeout(timer);
  }, [clampedScore]);

  return (
    <div className={className}>
      {/* Header row */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-coglens-muted">
            {label}
          </span>
          {showValue && (
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className={`${valueTextMap[size]} font-semibold tracking-tight ${getScoreTextColor(clampedScore)}`}
              >
                {clampedScore}
              </span>
              <span className="text-xs text-coglens-muted">/100</span>
            </div>
          )}
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${getScoreBadgeClasses(clampedScore)}`}
        >
          {getScoreLabel(clampedScore)}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className={`w-full ${heightMap[size]} bg-white/[0.06] rounded-full overflow-hidden`}
      >
        <div
          className={`${heightMap[size]} ${getScoreColor(clampedScore)} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${animatedWidth}%` }}
        />
      </div>
    </div>
  );
}

export { TrustScore };
export type { TrustScoreProps };
