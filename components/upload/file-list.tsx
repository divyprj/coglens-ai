'use client';

import { FileText, Trash2 } from 'lucide-react';

type FileStatus = 'uploaded' | 'processing' | 'verified' | 'error';

interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  status: FileStatus;
}

interface FileListProps {
  files: UploadedFileItem[];
  onRemove?: (id: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const statusConfig: Record<
  FileStatus,
  { label: string; className: string }
> = {
  uploaded: {
    label: 'Uploaded',
    className: 'bg-coglens-accent/10 text-coglens-accent',
  },
  processing: {
    label: 'Processing',
    className: 'bg-coglens-warning/10 text-coglens-warning',
  },
  verified: {
    label: 'Verified',
    className: 'bg-coglens-success/10 text-coglens-success',
  },
  error: {
    label: 'Error',
    className: 'bg-coglens-error/10 text-coglens-error',
  },
};

export default function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-coglens-border bg-coglens-card/30 py-16 px-6">
        <FileText className="mb-3 h-8 w-8 text-coglens-muted/60" />
        <p className="text-[13px] text-coglens-muted">No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-coglens-border">
      <ul className="divide-y divide-coglens-border">
        {files.map((file) => {
          const status = statusConfig[file.status];

          return (
            <li
              key={file.id}
              className="flex items-center gap-4 bg-coglens-card/30 px-4 py-3 transition-colors hover:bg-coglens-card/60"
            >
              {/* Icon */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-coglens-card">
                <FileText className="h-4 w-4 text-coglens-muted" />
              </div>

              {/* File info */}
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate text-[13px] font-medium text-coglens-primary">
                  {file.name}
                </p>
                <p className="mt-0.5 text-[11px] text-coglens-muted">
                  {formatFileSize(file.size)} &middot;{' '}
                  {formatDate(file.uploadedAt)}
                </p>
              </div>

              {/* Status badge */}
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.className}`}
              >
                {status.label}
              </span>

              {/* Remove */}
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(file.id)}
                  className="shrink-0 rounded-md p-1.5 text-coglens-muted transition-colors hover:bg-coglens-error/10 hover:text-coglens-error"
                  aria-label={`Remove ${file.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export type { UploadedFileItem, FileStatus };
