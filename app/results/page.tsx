'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Clock, Save, Download, Link2, Check } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TrustScore } from '@/components/analytics/trust-score';
import { ResultCard } from '@/components/results/result-card';
import { VerificationSummary } from '@/components/results/verification-summary';
import { useVerification } from '@/lib/store';

/* ------------------------------------------------------------------ */
/*  Animation                                                          */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ------------------------------------------------------------------ */
/*  Verdict mapping                                                    */
/* ------------------------------------------------------------------ */

type UIVerdict = 'verified' | 'misleading' | 'false';

function mapVerdict(verdict: string): UIVerdict {
  const v = verdict.toLowerCase();
  switch (v) {
    case 'supported':
    case 'verified':
      return 'verified';
    case 'refuted':
    case 'false':
      return 'false';
    case 'mixed':
    case 'misleading':
    case 'unverifiable':
    default:
      return 'misleading';
  }
}

/* ------------------------------------------------------------------ */
/*  Filter type                                                        */
/* ------------------------------------------------------------------ */

type FilterType = 'all' | 'verified' | 'misleading' | 'false';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'verified', label: 'Verified' },
  { value: 'misleading', label: 'Misleading' },
  { value: 'false', label: 'False' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ResultsPage() {
  const { currentResult, clearResult } = useVerification();
  const [filter, setFilter] = useState<FilterType>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Compute verdict counts
  const counts = useMemo(() => {
    if (!currentResult) return { verified: 0, misleading: 0, false: 0 };

    const c = { verified: 0, misleading: 0, false: 0 };
    for (const claim of currentResult.claims) {
      const v = mapVerdict(claim.verdict);
      c[v]++;
    }
    return c;
  }, [currentResult]);

  // Filter claims
  const filteredClaims = useMemo(() => {
    if (!currentResult) return [];
    if (filter === 'all') return currentResult.claims;
    return currentResult.claims.filter(
      (claim) => mapVerdict(claim.verdict) === filter
    );
  }, [currentResult, filter]);

  // Completion Time String Formatter
  const completionTime = useMemo(() => {
    if (!currentResult?.completedAt) return '';
    try {
      const date = new Date(currentResult.completedAt);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }, [currentResult?.completedAt]);

  const handleSaveReport = () => {
    if (!currentResult) return;
    try {
      const dataStr = JSON.stringify(currentResult, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coglens-report-${currentResult.document.fileName.replace(/\.[^/.]+$/, "")}.json`;
      a.click();
      URL.revokeObjectURL(url);
      triggerToast('Report successfully saved to downloads');
    } catch (e) {
      triggerToast('Error saving report');
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      triggerToast('Share link copied to clipboard');
    } catch (e) {
      triggerToast('Failed to copy link');
    }
  };

  if (!currentResult) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[50vh]">
        <EmptyState
          icon={FileText}
          title="No verification results"
          description="Upload a PDF document to see verification results here, or view your scan history."
        >
          <div className="flex items-center gap-3">
            <Link href="/upload" onClick={clearResult}>
              <Button variant="primary" icon={<Upload className="h-4 w-4" />}>
                Upload PDF
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">
                View Dashboard
              </Button>
            </Link>
          </div>
        </EmptyState>
      </div>
    );
  }

  const { document: doc, claims, trustScore, summary, processingTime } = currentResult;
  const totalSources = claims.reduce((sum, c) => sum + c.sources.length, 0);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="max-w-4xl mx-auto space-y-8 print:py-0 print:space-y-4"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-coglens-border pb-6 print:border-b-0 print:pb-0">
        <div>
          <SectionHeader
            title="Verification Results"
            subtitle={doc.fileName}
          />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-coglens-muted/70">
            <span>{claims.length} claims verified</span>
            <span className="text-coglens-border/60">•</span>
            <span>{totalSources} sources analyzed</span>
            <span className="text-coglens-border/60">•</span>
            <span className="text-coglens-secondary font-medium">
              Completed in {(processingTime / 1000).toFixed(1)}s • {completionTime}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveReport}
            icon={<Save className="h-4 w-4" />}
          >
            Save Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            icon={<Download className="h-4 w-4" />}
          >
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            icon={<Link2 className="h-4 w-4" />}
          >
            Share Link
          </Button>
          <div className="h-4 w-px bg-coglens-border/60 mx-1 hidden md:block" />
          <Link href="/upload" onClick={clearResult}>
            <Button variant="primary" size="sm" icon={<Upload className="h-4 w-4" />}>
              New Analysis
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch print:grid-cols-3 print:gap-4">
        <div className="sm:col-span-2 flex flex-col justify-between h-full print:col-span-2">
          <VerificationSummary counts={counts} className="h-full flex flex-col justify-between" />
        </div>
        <Card className="flex flex-col justify-center h-full">
          <CardContent className="p-6 flex flex-col justify-center h-full w-full">
            <TrustScore score={trustScore} className="w-full" />
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Summary */}
      {summary && (
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold tracking-tight text-coglens-primary mb-3">
                Analysis Summary
              </h3>
              <p className="text-[13px] leading-relaxed text-coglens-secondary font-normal">
                {summary}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filter bar */}
      <motion.div variants={fadeUp} className="flex items-center gap-1.5 print:hidden">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 select-none ${
              filter === f.value
                ? 'bg-white/[0.08] text-coglens-primary border border-white/[0.08] shadow-sm'
                : 'text-coglens-muted border border-transparent hover:text-coglens-secondary hover:bg-white/[0.03]'
            }`}
          >
            {f.label}
            {f.value !== 'all' && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.04] opacity-80">{counts[f.value]}</span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Claim cards */}
      <motion.div variants={stagger} className="space-y-4">
        {filteredClaims.length === 0 ? (
          <motion.div variants={fadeUp}>
            <EmptyState
              icon={FileText}
              title="No claims match this filter"
              description="Try a different filter to see other claims."
            />
          </motion.div>
        ) : (
          filteredClaims.map((claim, idx) => (
            <motion.div key={claim.id} variants={fadeUp}>
              <div className="space-y-0">
                <ResultCard
                  claim={claim.text}
                  status={mapVerdict(claim.verdict)}
                  confidence={Math.round(claim.confidence * 100)}
                  sources={claim.sources.map((s) => ({
                    url: s.url,
                    domain: s.publisher,
                    title: s.title,
                  }))}
                  timestamp={currentResult.completedAt}
                  index={idx}
                />
                {claim.reasoning && (
                  <div className="ml-5 pl-4 border-l border-coglens-border/60 mt-2 mb-3">
                    <span className="text-[10px] uppercase tracking-wider text-coglens-muted/70 block mb-1 font-semibold">
                      Verification Reasoning
                    </span>
                    <p className="text-[13px] leading-relaxed text-coglens-secondary">
                      {claim.reasoning}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-coglens-border bg-coglens-card/95 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-coglens-success/10 text-coglens-success">
              <Check className="h-3 w-3" />
            </div>
            <span className="text-xs font-semibold text-coglens-primary">
              {toastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
