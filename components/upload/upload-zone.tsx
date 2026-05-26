'use client';

import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';

type UploadState = 'idle' | 'drag-over' | 'uploading' | 'success' | 'error';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

interface UploadZoneProps {
  onFileAccepted?: (file: File) => void;
  maxSizeMB?: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadZone({
  onFileAccepted,
  maxSizeMB = 25,
}: UploadZoneProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.type !== 'application/pdf') {
        return 'Only PDF files are accepted.';
      }
      if (file.size > maxSizeBytes) {
        return `File exceeds the ${maxSizeMB} MB limit.`;
      }
      return null;
    },
    [maxSizeBytes, maxSizeMB],
  );

  const simulateUpload = useCallback(
    (file: File) => {
      setState('uploading');
      setProgress(0);

      let current = 0;
      const interval = setInterval(() => {
        current += Math.random() * 18 + 4;
        if (current >= 100) {
          current = 100;
          clearInterval(interval);
          setProgress(100);
          setState('success');
          setUploadedFile({
            name: file.name,
            size: file.size,
            type: file.type,
          });
          onFileAccepted?.(file);
        } else {
          setProgress(Math.round(current));
        }
      }, 120);
    },
    [onFileAccepted],
  );

  const handleFile = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        setErrorMessage(error);
        setState('error');
        return;
      }
      simulateUpload(file);
    },
    [validateFile, simulateUpload],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setState((s) => (s === 'uploading' || s === 'success' ? s : 'drag-over'));
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setState((s) => (s === 'drag-over' ? 'idle' : s));
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      if (inputRef.current) inputRef.current.value = '';
    },
    [handleFile],
  );

  const reset = useCallback(() => {
    setState('idle');
    setProgress(0);
    setUploadedFile(null);
    setErrorMessage('');
  }, []);

  const openPicker = useCallback(() => {
    if (state === 'uploading') return;
    inputRef.current?.click();
  }, [state]);

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      <AnimatePresence mode="wait">
        {/* ── Idle / Drag-over ─────────────────────────── */}
        {(state === 'idle' || state === 'drag-over') && (
          <motion.button
            key="idle"
            type="button"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={openPicker}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-16 transition-colors ${
              state === 'drag-over'
                ? 'border-coglens-accent/40 bg-coglens-card/60'
                : 'border-white/[0.1] hover:border-coglens-accent/30 hover:bg-coglens-card/40'
            }`}
          >
            <div
              className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                state === 'drag-over'
                  ? 'bg-coglens-accent/10'
                  : 'bg-coglens-card group-hover:bg-coglens-accent/10'
              }`}
            >
              <Upload
                className={`h-5 w-5 transition-colors ${
                  state === 'drag-over'
                    ? 'text-coglens-accent'
                    : 'text-coglens-muted group-hover:text-coglens-accent'
                }`}
              />
            </div>
            <p className="text-[14px] font-medium text-coglens-primary">
              {state === 'drag-over'
                ? 'Drop your PDF here'
                : 'Drag & drop your PDF here'}
            </p>
            <p className="mt-1 text-[12px] text-coglens-muted">
              or click to browse &middot; PDF only &middot; up to {maxSizeMB} MB
            </p>
          </motion.button>
        )}

        {/* ── Uploading ────────────────────────────────── */}
        {state === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex w-full flex-col items-center justify-center rounded-lg border border-coglens-border bg-coglens-card/40 px-6 py-16"
          >
            <FileText className="mb-4 h-8 w-8 text-coglens-secondary" />
            <p className="text-[14px] font-medium text-coglens-primary">
              Uploading...
            </p>
            <p className="mt-1 text-[12px] text-coglens-muted">
              {progress}% complete
            </p>

            {/* Progress bar */}
            <div className="mt-5 h-1 w-full max-w-xs overflow-hidden rounded-full bg-white/[0.1]">
              <motion.div
                className="h-full rounded-full bg-coglens-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'linear', duration: 0.12 }}
              />
            </div>
          </motion.div>
        )}

        {/* ── Success ──────────────────────────────────── */}
        {state === 'success' && uploadedFile && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="relative flex w-full flex-col items-center justify-center rounded-lg border border-coglens-success/20 bg-coglens-success/[0.04] px-6 py-16"
          >
            <button
              type="button"
              onClick={reset}
              className="absolute top-3 right-3 rounded-md p-1 text-coglens-muted transition-colors hover:text-coglens-primary"
              aria-label="Upload another file"
            >
              <X className="h-4 w-4" />
            </button>

            <CheckCircle className="mb-4 h-8 w-8 text-coglens-success" />
            <p className="text-[14px] font-medium text-coglens-primary">
              Upload complete
            </p>
            <p className="mt-1.5 text-[13px] text-coglens-secondary">
              {uploadedFile.name}
            </p>
            <p className="mt-0.5 text-[12px] text-coglens-muted">
              {formatFileSize(uploadedFile.size)}
            </p>

            <button
              type="button"
              onClick={reset}
              className="mt-5 rounded-md border border-coglens-border px-4 py-1.5 text-[12px] text-coglens-secondary transition-colors hover:border-white/[0.1] hover:text-coglens-primary"
            >
              Upload another
            </button>
          </motion.div>
        )}

        {/* ── Error ────────────────────────────────────── */}
        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="relative flex w-full flex-col items-center justify-center rounded-lg border border-coglens-error/20 bg-coglens-error/[0.04] px-6 py-16"
          >
            <button
              type="button"
              onClick={reset}
              className="absolute top-3 right-3 rounded-md p-1 text-coglens-muted transition-colors hover:text-coglens-primary"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>

            <AlertCircle className="mb-4 h-8 w-8 text-coglens-error" />
            <p className="text-[14px] font-medium text-coglens-primary">
              Upload failed
            </p>
            <p className="mt-1.5 text-[13px] text-coglens-error/80">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={reset}
              className="mt-5 rounded-md border border-coglens-border px-4 py-1.5 text-[12px] text-coglens-secondary transition-colors hover:border-white/[0.1] hover:text-coglens-primary"
            >
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
