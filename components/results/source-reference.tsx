import React from "react";
import { ExternalLink, Shield, ShieldAlert, ShieldOff } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Credibility = "high" | "medium" | "low";

interface SourceReferenceProps {
  url: string;
  domain: string;
  title?: string;
  credibility?: Credibility;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Credibility config                                                 */
/* ------------------------------------------------------------------ */

const credibilityConfig: Record<
  Credibility,
  { icon: React.ReactNode; color: string; label: string }
> = {
  high: {
    icon: <Shield className="h-3.5 w-3.5" />,
    color: "text-coglens-success",
    label: "High",
  },
  medium: {
    icon: <ShieldAlert className="h-3.5 w-3.5" />,
    color: "text-coglens-warning",
    label: "Medium",
  },
  low: {
    icon: <ShieldOff className="h-3.5 w-3.5" />,
    color: "text-coglens-error",
    label: "Low",
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function SourceReference({
  url,
  domain,
  title,
  credibility,
  className = "",
}: SourceReferenceProps) {
  const cred = credibility ? credibilityConfig[credibility] : null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors ${className}`}
    >
      {/* Credibility indicator */}
      {cred && (
        <span
          className={`shrink-0 ${cred.color}`}
          title={`${cred.label} credibility`}
        >
          {cred.icon}
        </span>
      )}

      {/* Text */}
      <div className="min-w-0 flex-1">
        {title && (
          <p className="text-sm text-coglens-primary truncate group-hover:text-coglens-accent transition-colors">
            {title}
          </p>
        )}
        <p className="text-xs text-coglens-muted truncate">{domain}</p>
      </div>

      {/* External link icon */}
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-coglens-muted opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}

export { SourceReference };
export type { SourceReferenceProps, Credibility };
