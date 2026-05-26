import { Search } from 'lucide-react';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ClaimItem {
  id: string;
  text: string;
  status: 'verified' | 'misleading' | 'false';
  confidence: number;
  source: string;
}

interface ClaimsPanelProps {
  claims: ClaimItem[];
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const statusLabel: Record<string, string> = {
  verified: 'Verified',
  misleading: 'Misleading',
  false: 'False',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function ClaimsPanel({ claims, className = '' }: ClaimsPanelProps) {
  if (claims.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No claims extracted"
        description="Upload and analyze a document to extract claims for verification."
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-medium text-coglens-muted uppercase tracking-wider">
          Extracted Claims · {claims.length}
        </p>
      </div>

      <div className="space-y-2">
        {claims.map((claim) => (
          <div
            key={claim.id}
            className="rounded-lg border border-coglens-border bg-coglens-card px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <Badge variant={claim.status as BadgeVariant}>
                {statusLabel[claim.status]}
              </Badge>
              <span className="text-xs text-coglens-muted shrink-0">
                {Math.round(claim.confidence * 100)}%
              </span>
            </div>
            <p className="text-sm text-coglens-primary leading-relaxed">
              {claim.text}
            </p>
            <p className="mt-1.5 text-[11px] text-coglens-muted">
              Source: {claim.source}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export { ClaimsPanel };
export type { ClaimsPanelProps, ClaimItem };
