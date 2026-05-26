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
      className={`bg-coglens-card border border-coglens-border ${statusBorderColor[status]} border-l-2 rounded-xl overflow-hidden ${className}`}
    >
      <div className="px-5 py-4">
        {/* Top row: badge + confidence */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant={status as BadgeVariant}>{statusLabel[status]}</Badge>
          <span className="text-xs font-medium text-coglens-muted">
            {confidence}% confidence
          </span>
        </div>

        {/* Claim text */}
        <p className="text-sm leading-relaxed text-coglens-primary">{claim}</p>

        {/* Sources */}
        {sources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-coglens-secondary hover:text-coglens-primary transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                {source.domain}
              </a>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="mt-3 flex items-center gap-1 text-xs text-coglens-muted">
          <Clock className="h-3 w-3" />
          {timestamp}
        </div>
      </div>
    </motion.div>
  );
}

export { ResultCard };
export type { ResultCardProps, SourceReference };
