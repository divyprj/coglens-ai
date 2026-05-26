'use client';

import { useState } from 'react';
import { FileText, FolderOpen } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DocumentItem {
  id: string;
  title: string;
  type: string;
  uploadedAt: string;
  status: 'verified' | 'processing' | 'error';
  claimsCount: number;
  trustScore: number | null;
}

interface DocumentListProps {
  documents: DocumentItem[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

const statusDot: Record<string, string> = {
  verified: 'bg-coglens-success',
  processing: 'bg-coglens-warning',
  error: 'bg-coglens-error',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function DocumentList({
  documents,
  selectedId,
  onSelect,
  className = '',
}: DocumentListProps) {
  const [selected, setSelected] = useState(selectedId ?? documents[0]?.id);

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No documents yet"
        description="Upload a PDF to get started with verification."
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      <div className="rounded-xl border border-coglens-border bg-coglens-card overflow-hidden">
        <div className="px-4 py-3 border-b border-coglens-border">
          <p className="text-[11px] font-medium text-coglens-muted uppercase tracking-wider">
            Documents
          </p>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {documents.map((doc) => {
            const isActive = selected === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => {
                  setSelected(doc.id);
                  onSelect?.(doc.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-white/[0.04]'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="shrink-0 rounded-lg bg-white/[0.04] p-2">
                  <FileText
                    className="h-4 w-4 text-coglens-muted"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-coglens-primary truncate">
                    {doc.title}
                  </p>
                  <p className="text-[11px] text-coglens-muted">
                    {formatDate(doc.uploadedAt)} · {doc.claimsCount} claims
                  </p>
                </div>
                <div
                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDot[doc.status] ?? 'bg-coglens-muted'}`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { DocumentList };
export type { DocumentListProps, DocumentItem };
