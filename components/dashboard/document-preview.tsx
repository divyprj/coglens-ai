import { FileText, Calendar, Layers } from 'lucide-react';

interface DocumentPreviewProps {
  document?: {
    name: string;
    pageCount: number;
    uploadedAt: Date;
  } | null;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DocumentPreview({ document }: DocumentPreviewProps) {
  /* ── Empty state ──────────────────────────────────── */
  if (!document) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-lg border border-coglens-border bg-coglens-card/20 px-6">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-coglens-card">
          <FileText className="h-6 w-6 text-coglens-muted/50" />
        </div>
        <p className="text-[14px] font-medium text-coglens-secondary">
          No document selected
        </p>
        <p className="mt-1 text-[12px] text-coglens-muted">
          Select a document from the list to preview
        </p>
      </div>
    );
  }

  /* ── Preview state ────────────────────────────────── */
  return (
    <div className="flex h-full min-h-[400px] flex-col rounded-lg border border-coglens-border bg-coglens-card/20">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-coglens-border px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-coglens-card">
          <FileText className="h-4 w-4 text-coglens-muted" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-coglens-primary">
            {document.name}
          </p>
          <div className="mt-0.5 flex items-center gap-3 text-[11px] text-coglens-muted">
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {document.pageCount} {document.pageCount === 1 ? 'page' : 'pages'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(document.uploadedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Preview placeholder */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="relative mb-6">
          {/* Stacked pages effect */}
          <div className="absolute -right-1 -bottom-1 h-32 w-24 rounded-md border border-coglens-border bg-coglens-surface" />
          <div className="absolute -right-0.5 -bottom-0.5 h-32 w-24 rounded-md border border-coglens-border bg-coglens-card" />
          <div className="relative flex h-32 w-24 flex-col items-center justify-center rounded-md border border-coglens-border-strong bg-coglens-card">
            <FileText className="h-8 w-8 text-coglens-muted/40" />
            <span className="mt-1 text-[9px] font-medium uppercase tracking-wider text-coglens-muted/60">
              PDF
            </span>
          </div>
        </div>

        <p className="text-[13px] text-coglens-secondary">
          Document preview
        </p>
        <p className="mt-1 text-[11px] text-coglens-muted">
          PDF rendering will appear here
        </p>
      </div>
    </div>
  );
}
