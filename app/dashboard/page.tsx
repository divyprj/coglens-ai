'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  Trash2,
  ChevronRight,
  BarChart3,
  Activity,
  Info,
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { AnalyticsCard } from '@/components/analytics/analytics-card';
import { useVerification } from '@/lib/store';
import type { ScanHistoryEntry } from '@/lib/report-storage';

/* ------------------------------------------------------------------ */
/*  Animation                                                          */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function scoreColor(score: number): string {
  if (score > 70) return 'text-coglens-success bg-coglens-success/10 border-coglens-success/20';
  if (score >= 40) return 'text-coglens-warning bg-coglens-warning/10 border-coglens-warning/20';
  return 'text-coglens-error bg-coglens-error/10 border-coglens-error/20';
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

/* ------------------------------------------------------------------ */
/*  Scan Row Component                                                 */
/* ------------------------------------------------------------------ */

function ScanRow({
  entry,
  onView,
  onDelete,
}: {
  entry: ScanHistoryEntry;
  onView: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="group flex items-center gap-4 px-5 py-4 border-b border-coglens-border/50 last:border-b-0 hover:bg-white/[0.02] transition-colors duration-200 cursor-pointer"
      onClick={onView}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onView(); } }}
      tabIndex={0}
      role="button"
    >
      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] border border-coglens-border/50">
        <FileText className="h-4 w-4 text-coglens-muted" />
      </div>

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-coglens-primary truncate">
          {entry.fileName}
        </p>
        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-coglens-muted/70">
          <span>{entry.claimsCount} claims</span>
          <span className="text-coglens-border/60">•</span>
          <span>{(entry.processingTime / 1000).toFixed(1)}s</span>
          <span className="text-coglens-border/60">•</span>
          <span>{formatTime(entry.completedAt)}</span>
        </div>
      </div>

      {/* Trust score pill */}
      <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums ${scoreColor(entry.trustScore)}`}>
        {entry.trustScore}
      </span>

      {/* Verdict badges — desktop */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <span className="inline-flex items-center gap-1 text-[10px] text-coglens-success/80">
          <CheckCircle2 className="h-3 w-3" />
          {entry.verifiedCount}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] text-coglens-warning/80">
          <AlertTriangle className="h-3 w-3" />
          {entry.misleadingCount}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] text-coglens-error/80">
          <XCircle className="h-3 w-3" />
          {entry.falseCount}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="rounded-md p-1.5 text-coglens-muted/40 hover:text-coglens-error hover:bg-coglens-error/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
          title="Delete scan"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <ChevronRight className="h-4 w-4 text-coglens-muted/30 group-hover:text-coglens-muted/60 transition-colors" />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const router = useRouter();
  const { scanHistory, loadResult, deleteScan, clearHistory } = useVerification();

  // Prevent hydration mismatch: sessionStorage data only available after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Aggregate stats across all scans
  const stats = useMemo(() => {
    if (scanHistory.length === 0) {
      return { totalDocs: 0, totalClaims: 0, avgScore: 0, totalSources: 0, totalVerified: 0 };
    }
    let totalClaims = 0;
    let totalScore = 0;
    let totalSources = 0;
    let totalVerified = 0;
    for (const s of scanHistory) {
      totalClaims += s.claimsCount;
      totalScore += s.trustScore;
      totalSources += s.sourcesCount;
      totalVerified += s.verifiedCount;
    }
    return {
      totalDocs: scanHistory.length,
      totalClaims,
      avgScore: Math.round(totalScore / scanHistory.length),
      totalSources,
      totalVerified,
    };
  }, [scanHistory]);

  const handleView = (id: string) => {
    if (loadResult(id)) {
      router.push('/results');
    }
    // If loadResult returns false, the orphan entry is auto-cleaned
    // and scanHistory re-renders — the row disappears as feedback.
  };

  // Before mount, show a minimal skeleton to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <SectionHeader title="Dashboard" subtitle="Your verification workspace." />
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-sm text-coglens-muted">Loading...</div>
        </div>
      </div>
    );
  }

  /* ── Empty state ──────────────────────────────────── */
  if (scanHistory.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="max-w-3xl mx-auto space-y-8"
      >
        <motion.div variants={fadeUp}>
          <SectionHeader
            title="Dashboard"
            subtitle="Your verification workspace."
          />
        </motion.div>

        <motion.div variants={fadeUp} className="flex items-center justify-center min-h-[40vh]">
          <EmptyState
            icon={Activity}
            title="No analyses yet"
            description="Upload your first PDF to begin verification. Your scan history will appear here."
          >
            <Link href="/upload">
              <Button variant="primary" icon={<Upload className="h-4 w-4" />}>
                Upload PDF
              </Button>
            </Link>
          </EmptyState>
        </motion.div>
      </motion.div>
    );
  }

  /* ── History available ────────────────────────────── */
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SectionHeader
          title="Dashboard"
          subtitle="Your verification workspace."
        />
        <Link href="/upload">
          <Button variant="primary" size="sm" icon={<Upload className="h-4 w-4" />}>
            New Analysis
          </Button>
        </Link>
      </motion.div>

      {/* Aggregate metrics */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          label="Documents"
          value={stats.totalDocs}
          icon={<FileText className="h-4 w-4" />}
        />
        <AnalyticsCard
          label="Total Claims"
          value={stats.totalClaims}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <AnalyticsCard
          label="Avg Trust Score"
          value={stats.avgScore}
          icon={<Shield className="h-4 w-4" />}
        />
        <AnalyticsCard
          label="Verified Claims"
          value={stats.totalVerified}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </motion.div>

      {/* Scan history list */}
      <motion.div variants={fadeUp}>
        <Card>
          <div className="px-5 py-4 border-b border-coglens-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-coglens-muted" />
              <h3 className="text-sm font-semibold tracking-tight text-coglens-primary">
                Recent Analyses
              </h3>
              <Badge variant="default" withIcon={false} className="text-[10px]">
                {scanHistory.length}
              </Badge>
            </div>
            <button
              type="button"
              onClick={clearHistory}
              className="text-[11px] text-coglens-muted/50 hover:text-coglens-error transition-colors duration-200"
            >
              Clear Workspace
            </button>
          </div>
          <CardContent className="p-0">
            <motion.div variants={stagger}>
              {scanHistory.map((entry) => (
                <ScanRow
                  key={entry.id}
                  entry={entry}
                  onView={() => handleView(entry.id)}
                  onDelete={() => deleteScan(entry.id)}
                />
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy notice */}
      <motion.div variants={fadeUp} className="flex items-start gap-2 px-1">
        <Info className="h-3 w-3 text-coglens-muted/30 mt-0.5 shrink-0" />
        <p className="text-[11px] leading-relaxed text-coglens-muted/40">
          Reports are stored temporarily during your active session and cleared automatically when you close the browser. Export important results before leaving.
        </p>
      </motion.div>
    </motion.div>
  );
}
