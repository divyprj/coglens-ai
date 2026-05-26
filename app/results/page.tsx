'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Upload, Clock, ExternalLink } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { AnalyticsCard } from '@/components/analytics/analytics-card';
import { TrustScore } from '@/components/analytics/trust-score';
import { ResultCard } from '@/components/results/result-card';
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
  visible: { transition: { staggerChildren: 0.06 } },
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
  const { currentResult } = useVerification();
  const [filter, setFilter] = useState<FilterType>('all');

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

  if (!currentResult) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[50vh]">
        <EmptyState
          icon={FileText}
          title="No verification results"
          description="Upload a PDF document to see verification results here."
        >
          <Link href="/upload">
            <Button variant="primary" icon={<Upload className="h-4 w-4" />}>
              Upload PDF
            </Button>
          </Link>
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
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <SectionHeader
            title="Verification Results"
            subtitle={doc.fileName}
          />
          <div className="flex items-center gap-3 mt-2 text-xs text-coglens-muted">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {(processingTime / 1000).toFixed(1)}s
            </span>
            <span>{claims.length} claims</span>
            <span>{totalSources} sources</span>
          </div>
        </div>
        <Link href="/upload">
          <Button variant="outline" size="sm" icon={<Upload className="h-4 w-4" />}>
            New Analysis
          </Button>
        </Link>
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <VerificationSummary counts={counts} />
        </div>
        <Card>
          <CardContent className="p-5 flex flex-col items-center justify-center h-full">
            <TrustScore score={trustScore} />
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Summary */}
      {summary && (
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-medium text-coglens-primary mb-2">
                Analysis Summary
              </h3>
              <p className="text-sm text-coglens-secondary leading-relaxed">
                {summary}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filter bar */}
      <motion.div variants={fadeUp} className="flex items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === f.value
                ? 'bg-coglens-accent/10 text-coglens-accent'
                : 'text-coglens-muted hover:text-coglens-secondary hover:bg-white/[0.04]'
            }`}
          >
            {f.label}
            {f.value !== 'all' && (
              <span className="ml-1.5 text-[10px] opacity-70">{counts[f.value]}</span>
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
                  <div className="ml-4 pl-4 border-l-2 border-coglens-border mt-1 mb-2">
                    <p className="text-xs text-coglens-secondary leading-relaxed py-2">
                      {claim.reasoning}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
