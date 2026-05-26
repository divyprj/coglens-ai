'use client';

import { useCallback, useRef, useState, useEffect, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  FileImage,
  Clock,
  CheckCircle2,
  Loader2,
  Circle,
  AlertCircle,
  X,
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVerification, PIPELINE_STAGES } from '@/lib/store';

/* ------------------------------------------------------------------ */
/*  Animation                                                          */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function UploadPage() {
  const router = useRouter();
  const {
    isVerifying,
    stageIndex,
    stageLabel,
    error,
    currentResult,
    startVerification,
    clearResult,
  } = useVerification();

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Redirect to results when verification completes
  useEffect(() => {
    if (currentResult && !isVerifying) {
      const timer = setTimeout(() => router.push('/results'), 800);
      return () => clearTimeout(timer);
    }
  }, [currentResult, isVerifying, router]);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are accepted.');
        return;
      }
      startVerification(file);
    },
    [startVerification]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      if (inputRef.current) inputRef.current.value = '';
    },
    [handleFile]
  );

  const isComplete = !!currentResult && !isVerifying;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="max-w-3xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <SectionHeader
          title="Upload Document"
          subtitle="Upload a PDF to begin verification. We'll extract claims and check them against trusted sources."
        />
      </motion.div>

      {/* Upload / Verification area */}
      <motion.div variants={fadeUp}>
        <AnimatePresence mode="wait">
          {!isVerifying && !isComplete && !error && (
            /* ── Idle: drag-drop zone ─────────────────────── */
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                }}
                onDrop={handleDrop}
                className={`group flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-20 transition-colors ${
                  dragOver
                    ? 'border-coglens-accent/40 bg-coglens-card/60'
                    : 'border-white/[0.1] hover:border-coglens-accent/30 hover:bg-coglens-card/40'
                }`}
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                    dragOver
                      ? 'bg-coglens-accent/10'
                      : 'bg-coglens-card group-hover:bg-coglens-accent/10'
                  }`}
                >
                  <Upload
                    className={`h-5 w-5 transition-colors ${
                      dragOver
                        ? 'text-coglens-accent'
                        : 'text-coglens-muted group-hover:text-coglens-accent'
                    }`}
                  />
                </div>
                <p className="text-sm font-medium text-coglens-primary">
                  {dragOver ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
                </p>
                <p className="mt-1 text-xs text-coglens-muted">
                  or click to browse · PDF only · up to 20 MB
                </p>
              </button>
            </motion.div>
          )}

          {(isVerifying || isComplete) && (
            /* ── Verifying: pipeline stages ───────────────── */
            <motion.div
              key="verifying"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-coglens-border bg-coglens-card px-6 py-8"
            >
              <div className="space-y-4">
                {PIPELINE_STAGES.map((stage, i) => {
                  const isDone = stageIndex > i || isComplete;
                  const isActive = stageIndex === i && isVerifying;
                  const isPending = stageIndex < i && !isComplete;

                  return (
                    <div key={stage.label} className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-coglens-success shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="h-4.5 w-4.5 text-coglens-accent animate-spin shrink-0" />
                      ) : (
                        <Circle className="h-4.5 w-4.5 text-coglens-muted/40 shrink-0" />
                      )}
                      <span
                        className={`text-sm transition-colors ${
                          isDone
                            ? 'text-coglens-secondary'
                            : isActive
                              ? 'text-coglens-primary font-medium'
                              : 'text-coglens-muted/60'
                        }`}
                      >
                        {stage.label.replace('...', '')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 pt-5 border-t border-coglens-border flex items-center justify-between"
                >
                  <p className="text-sm text-coglens-success font-medium">
                    Verification complete — redirecting...
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {error && !isVerifying && (
            /* ── Error state ──────────────────────────────── */
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="relative rounded-xl border border-coglens-error/20 bg-coglens-error/[0.04] px-6 py-10 flex flex-col items-center text-center"
            >
              <button
                type="button"
                onClick={() => {
                  clearResult();
                  window.location.reload();
                }}
                className="absolute top-3 right-3 rounded-md p-1 text-coglens-muted hover:text-coglens-primary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <AlertCircle className="h-8 w-8 text-coglens-error mb-3" />
              <p className="text-sm font-medium text-coglens-primary mb-1">
                Verification Failed
              </p>
              <p className="text-xs text-coglens-error/80 max-w-md">
                {error}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={() => window.location.reload()}
              >
                Try again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Supported formats — only show when idle */}
      {!isVerifying && !isComplete && !error && (
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-coglens-primary mb-4">
                Supported Formats
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-coglens-surface border border-coglens-border">
                    <FileText className="h-4 w-4 text-coglens-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-coglens-primary">PDF Documents</p>
                    <p className="text-xs text-coglens-muted mt-0.5">
                      Research papers, reports, articles
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-coglens-surface border border-coglens-border">
                    <FileImage className="h-4 w-4 text-coglens-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-coglens-primary">Scanned Documents</p>
                    <p className="text-xs text-coglens-muted mt-0.5">
                      OCR-enabled PDF processing
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-coglens-surface border border-coglens-border">
                    <Clock className="h-4 w-4 text-coglens-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-coglens-primary">Processing Time</p>
                    <p className="text-xs text-coglens-muted mt-0.5">
                      20–60 seconds per document
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
