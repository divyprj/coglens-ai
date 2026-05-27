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
import { Button } from '@/components/ui/button';
import { useVerification, PIPELINE_STAGES } from '@/lib/store';

/* ------------------------------------------------------------------ */
/*  Animation                                                          */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function UploadPage() {
  const router = useRouter();
  const {
    isVerifying,
    stageIndex,
    error,
    currentResult,
    startVerification,
    clearResult,
  } = useVerification();

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Clear stale result once on initial mount
  useEffect(() => {
    clearResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autofocus the upload button zone on mount
  useEffect(() => {
    if (!isVerifying && !currentResult && !error) {
      const timer = setTimeout(() => {
        buttonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVerifying, currentResult, error]);

  // Redirect to results when verification completes
  useEffect(() => {
    if (currentResult && !isVerifying) {
      const timer = setTimeout(() => router.push('/results'), 800);
      return () => clearTimeout(timer);
    }
  }, [currentResult, isVerifying, router]);

  const [fileError, setFileError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setFileError(null);
      if (file.type !== 'application/pdf') {
        setFileError('Only PDF files are accepted. Please select a valid PDF document.');
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
      className="relative max-w-3xl mx-auto space-y-10"
    >
      {/* ── Ambient depth glow behind content ──────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[400px] z-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255,255,255,0.018) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <motion.div variants={fadeUp} className="relative z-10">
        <SectionHeader
          title="Upload Document"
          subtitle="Upload a PDF to begin verification. We'll extract claims and check them against trusted sources."
        />
      </motion.div>

      {/* Upload / Verification area */}
      <motion.div variants={fadeUp} className="relative z-10">
        <AnimatePresence mode="wait">
          {!isVerifying && !isComplete && !error && (
            /* ── Idle: premium drag-drop zone ──────────────── */
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Ambient glow behind dropzone */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -m-4 z-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.012) 0%, transparent 60%)',
                }}
              />

              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleInputChange}
              />
              <button
                ref={buttonRef}
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
                className={`group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border px-8 py-24 backdrop-blur-md transition-all duration-500 ease-out ${
                  dragOver
                    ? 'border-coglens-accent/30 bg-white/[0.04] scale-[1.01] shadow-[0_0_60px_-15px_rgba(255,255,255,0.06)]'
                    : 'border-white/[0.06] bg-white/[0.015] hover:border-white/[0.12] hover:bg-white/[0.03] hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)]'
                }`}
              >
                {/* Soft inner highlight */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500 ${
                    dragOver ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                  }`}
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 50%)',
                  }}
                />

                {/* Upload icon with gradient ring */}
                <div
                  className={`relative mb-5 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-500 ${
                    dragOver
                      ? 'bg-coglens-accent/[0.08] scale-110 shadow-[0_0_24px_-4px_rgba(255,255,255,0.08)]'
                      : 'bg-white/[0.04] group-hover:bg-white/[0.06] group-hover:shadow-[0_0_20px_-6px_rgba(255,255,255,0.05)]'
                  }`}
                >
                  {/* Ring */}
                  <div
                    className={`absolute inset-0 rounded-full border transition-all duration-500 ${
                      dragOver
                        ? 'border-coglens-accent/20'
                        : 'border-white/[0.06] group-hover:border-white/[0.1]'
                    }`}
                  />
                  <Upload
                    className={`h-5 w-5 transition-all duration-400 ${
                      dragOver
                        ? 'text-coglens-accent'
                        : 'text-coglens-muted group-hover:text-coglens-primary'
                    }`}
                  />
                </div>

                {/* Copy */}
                <p className="text-[15px] font-medium text-coglens-primary tracking-tight">
                  {dragOver ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
                </p>
                <p className="mt-1.5 text-xs text-coglens-muted/70 tracking-wide">
                  or click to browse · PDF only · up to 20 MB
                </p>
              </button>

              {/* Inline file type error */}
              <AnimatePresence>
                {fileError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 text-xs text-coglens-error/80 text-center"
                  >
                    {fileError}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {(isVerifying || isComplete) && (
            /* ── Verifying: glassmorphic pipeline stages ───── */
            <motion.div
              key="verifying"
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl px-8 py-10 shadow-[0_4px_32px_-8px_rgba(0,0,0,0.3)]"
            >
              {/* Inner highlight */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(255,255,255,0.015) 0%, transparent 40%)',
                }}
              />

              <div className="relative space-y-5">
                {PIPELINE_STAGES.map((stage, i) => {
                  const isDone = stageIndex > i || isComplete;
                  const isActive = stageIndex === i && isVerifying;

                  return (
                    <motion.div
                      key={stage.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-3.5"
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-[18px] w-[18px] text-coglens-success shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="h-[18px] w-[18px] text-coglens-accent animate-spin shrink-0" />
                      ) : (
                        <Circle className="h-[18px] w-[18px] text-white/[0.12] shrink-0" />
                      )}
                      <span
                        className={`text-sm transition-all duration-300 ${
                          isDone
                            ? 'text-coglens-secondary/80'
                            : isActive
                              ? 'text-coglens-primary font-medium'
                              : 'text-white/[0.2]'
                        }`}
                      >
                        {stage.label.replace('...', '')}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-8 pt-5 border-t border-coglens-success/10 flex items-center"
                >
                  <p className="text-sm text-coglens-success font-medium tracking-tight">
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
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-2xl border border-coglens-error/15 bg-coglens-error/[0.03] backdrop-blur-xl px-8 py-12 flex flex-col items-center text-center shadow-[0_4px_32px_-8px_rgba(0,0,0,0.3)]"
            >
              <button
                type="button"
                onClick={() => clearResult()}
                className="absolute top-4 right-4 rounded-lg p-1.5 text-coglens-muted/50 hover:text-coglens-primary hover:bg-white/[0.04] transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-coglens-error/[0.08] border border-coglens-error/10 mb-4">
                <AlertCircle className="h-5 w-5 text-coglens-error" />
              </div>
              <p className="text-sm font-medium text-coglens-primary mb-1.5 tracking-tight">
                Verification Failed
              </p>
              <p className="text-xs text-coglens-error/70 max-w-md leading-relaxed">
                {error}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-6"
                onClick={() => clearResult()}
              >
                Try again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Supported formats — premium glass card */}
      {!isVerifying && !isComplete && !error && (
        <motion.div variants={fadeUp} className="relative z-10">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-md p-7 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.2)] transition-all duration-500 hover:border-white/[0.09] hover:shadow-[0_4px_24px_-6px_rgba(0,0,0,0.3)]">
            {/* Inner top highlight */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl"
              style={{
                background:
                  'linear-gradient(to right, transparent, rgba(255,255,255,0.04) 50%, transparent)',
              }}
            />

            <h3 className="text-[13px] font-semibold tracking-tight text-coglens-primary mb-5">
              Supported Formats
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: FileText,
                  title: 'PDF Documents',
                  desc: 'Research papers, reports, articles',
                },
                {
                  icon: FileImage,
                  title: 'Scanned Documents',
                  desc: 'OCR-enabled PDF processing',
                },
                {
                  icon: Clock,
                  title: 'Processing Time',
                  desc: '20–60 seconds per document',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group flex items-start gap-3.5 rounded-xl border border-white/[0.04] bg-white/[0.01] p-3.5 transition-all duration-300 hover:bg-white/[0.025] hover:border-white/[0.08]"
                >
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] transition-all duration-300 group-hover:bg-white/[0.06] group-hover:border-white/[0.1]">
                    <item.icon className="h-4 w-4 text-coglens-accent transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-coglens-primary leading-tight">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-coglens-muted/60 mt-0.5 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
