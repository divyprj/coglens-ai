"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, ExternalLink } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SourceReference {
  url: string;
  domain: string;
  title?: string;
}

interface ResultCardProps {
  claim: string;
  status: "verified" | "misleading" | "false";
  confidence: number;
  sources: SourceReference[];
  timestamp: string;
  index?: number;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const statusBorderColor: Record<string, string> = {
  verified: "border-l-coglens-success",
  misleading: "border-l-coglens-warning",
  false: "border-l-coglens-error",
};

const statusLabel: Record<string, string> = {
  verified: "Verified",
  misleading: "Misleading",
  false: "False",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function ResultCard({
  claim,
  status,
  confidence,
  sources,
  timestamp,
  index = 0,
  className = "",
}: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      className={`bg-coglens-card border border-coglens-border ${statusBorderColor[status]} border-l-4 rounded-xl overflow-hidden hover:bg-white/[0.01] hover:border-white/[0.12] transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)] ${className}`}
    >
      <div className="px-6 py-5">
        {/* Top row: badge + confidence */}
        <div className="flex items-center justify-between mb-4">
          <Badge variant={status as BadgeVariant}>{statusLabel[status]}</Badge>
          <span className="text-[11px] font-mono tracking-tight text-coglens-muted/80 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.02]">
            {confidence}% confidence
          </span>
        </div>

        {/* Claim text */}
        <p className="text-[14px] leading-relaxed text-coglens-primary font-medium tracking-tight mb-4">
          “{claim}”
        </p>

        {/* Sources */}
        {sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-coglens-border/40">
            <span className="text-[10px] uppercase tracking-wider text-coglens-muted/70 block mb-2 font-medium">
              Supporting Sources
            </span>
            <div className="flex flex-wrap gap-2">
              {sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-coglens-border bg-white/[0.01] px-2.5 py-1 text-xs text-coglens-secondary hover:text-coglens-primary hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200"
                >
                  <ExternalLink className="h-3 w-3 text-coglens-accent" />
                  <span className="font-medium">{source.domain}</span>
                  {source.title && (
                    <span className="text-coglens-muted/40 hidden sm:inline max-w-[240px] truncate">
                      — {source.title}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-coglens-muted/60">
          <Clock className="h-3 w-3" />
          <span>Verified on {new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
    </motion.div>
  );
}

export { ResultCard };
export type { ResultCardProps, SourceReference };
