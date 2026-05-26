"use client";

import React from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type SkeletonPreset = "text" | "card" | "avatar" | "paragraph";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width as a Tailwind class, e.g. "w-full" or "w-48" */
  width?: string;
  /** Height as a Tailwind class, e.g. "h-4" or "h-32" */
  height?: string;
  /** Border-radius as a Tailwind class */
  rounded?: string;
}

interface SkeletonPresetProps {
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Base Skeleton                                                      */
/* ------------------------------------------------------------------ */

function Skeleton({
  width = "w-full",
  height = "h-4",
  rounded = "rounded-lg",
  className = "",
  ...rest
}: SkeletonProps) {
  return (
    <div
      className={`${width} ${height} ${rounded} ${className}`}
      style={{
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.8s ease-in-out infinite",
      }}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

function SkeletonText({ className = "" }: SkeletonPresetProps) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      <Skeleton width="w-3/4" height="h-4" />
      <Skeleton width="w-full" height="h-4" />
      <Skeleton width="w-5/6" height="h-4" />
    </div>
  );
}

function SkeletonCard({ className = "" }: SkeletonPresetProps) {
  return (
    <div
      className={`bg-coglens-card border border-coglens-border rounded-xl p-5 space-y-4 ${className}`}
    >
      <Skeleton width="w-1/3" height="h-5" />
      <div className="space-y-2.5">
        <Skeleton width="w-full" height="h-4" />
        <Skeleton width="w-4/5" height="h-4" />
      </div>
      <Skeleton width="w-1/4" height="h-8" rounded="rounded-lg" />
    </div>
  );
}

function SkeletonAvatar({ className = "" }: SkeletonPresetProps) {
  return (
    <Skeleton
      width="w-10"
      height="h-10"
      rounded="rounded-full"
      className={className}
    />
  );
}

function SkeletonParagraph({ className = "" }: SkeletonPresetProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Skeleton width="w-full" height="h-3.5" />
      <Skeleton width="w-full" height="h-3.5" />
      <Skeleton width="w-11/12" height="h-3.5" />
      <Skeleton width="w-full" height="h-3.5" />
      <Skeleton width="w-3/4" height="h-3.5" />
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonParagraph,
};
export type { SkeletonProps, SkeletonPreset };
