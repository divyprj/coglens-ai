'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { AnalyticsCard } from '@/components/analytics/analytics-card';
import { TrustScore } from '@/components/analytics/trust-score';
import { VerificationSummary } from '@/components/results/verification-summary';
import { useVerification } from '@/lib/store';

/* ------------------------------------------------------------------ */
/*  Animation                                                          */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const { currentResult } = useVerification();

  // Derive counts from result
  const counts = useMemo(() => {
    if (!currentResult) return { verified: 0, misleading: 0, false: 0 };
    const c = { verified: 0, misleading: 0, false: 0 };
    for (const claim of currentResult.claims) {
      const v = claim.verdict.toLowerCase();
      if (v === 'supported' || v === 'verified') c.verified++;
      else if (v === 'refuted' || v === 'false') c['false']++;
      else c.misleading++;
    }
    return c;
  }, [currentResult]);

  const totalClaims = currentResult?.claims.length ?? 0;
  const totalSources = currentResult?.claims.reduce(
    (sum, c) => sum + c.sources.length,
    0
  ) ?? 0;

  /* ── No result yet ─────────────────────────────────── */
  if (!currentResult) {
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
            icon={FileText}
            title="No documents verified yet"
            description="Upload a PDF to start verifying claims. Results will appear here."
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

  /* ── Result available ──────────────────────────────── */
  const { document: doc, claims, trustScore, summary, processingTime } = currentResult;

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
          title="Verification Overview"
          subtitle={`Results for "${doc.fileName}"`}
        />
        <Link href="/upload">
          <Button variant="outline" size="sm" icon={<Upload className="h-4 w-4" />}>
            New Analysis
          </Button>
        </Link>
      </motion.div>

      {/* Analytics row */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          label="Total Claims"
          value={totalClaims}
          icon={<FileText className="h-4 w-4" />}
        />
        <AnalyticsCard
          label="Verified"
          value={counts.verified}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <AnalyticsCard
          label="Misleading"
          value={counts.misleading}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <AnalyticsCard
          label="False"
          value={counts['false']}
          icon={<XCircle className="h-4 w-4" />}
        />
      </motion.div>

      {/* Trust score + summary */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <TrustScore score={trustScore} />
            <div className="mt-3 flex items-center gap-2 text-xs text-coglens-muted">
              <Clock className="h-3 w-3" />
              <span>{(processingTime / 1000).toFixed(1)}s</span>
              <span>·</span>
              <span>{totalSources} sources</span>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-6 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-coglens-accent" />
                <h3 className="text-sm font-medium text-coglens-primary">
                  Analysis Summary
                </h3>
              </div>
              <p className="text-sm text-coglens-secondary leading-relaxed flex-1">
                {summary}
              </p>
              <div className="mt-4 pt-3 border-t border-coglens-border">
                <VerificationSummary counts={counts} />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Claims list */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="px-5 py-4 border-b border-coglens-border">
            <h3 className="text-sm font-medium text-coglens-primary">
              Extracted Claims ({claims.length})
            </h3>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-coglens-border">
            {claims.map((claim) => {
              let badgeVariant: 'verified' | 'misleading' | 'false' = 'misleading';
              const v = claim.verdict.toLowerCase();
              if (v === 'supported' || v === 'verified') badgeVariant = 'verified';
              else if (v === 'refuted' || v === 'false') badgeVariant = 'false';

              return (
                <div
                  key={claim.id}
                  className="px-5 py-4 flex items-start gap-3"
                >
                  <Badge variant={badgeVariant} className="mt-0.5 shrink-0">
                    {badgeVariant === 'verified'
                      ? 'Verified'
                      : badgeVariant === 'false'
                        ? 'False'
                        : 'Unclear'}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-coglens-primary leading-relaxed">
                      {claim.text}
                    </p>
                    <p className="text-xs text-coglens-muted mt-1">
                      {Math.round(claim.confidence * 100)}% confidence
                      {claim.sources.length > 0 &&
                        ` · ${claim.sources.length} source${claim.sources.length > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Link to full results */}
      <motion.div variants={fadeUp} className="text-center">
        <Link href="/results">
          <Button variant="secondary" size="sm">
            View detailed results →
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
