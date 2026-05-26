'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  FileText,
  Search,
  Shield,
  BarChart3,
  Upload,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { LandingLayout } from '@/components/layout/landing-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function FadeInSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: FileText,
    title: 'Document Analysis',
    description:
      'Upload PDFs and documents for deep structural analysis. We parse text, tables, and metadata to build a complete understanding.',
  },
  {
    icon: Search,
    title: 'Claim Extraction',
    description:
      'AI identifies every verifiable claim in your document — statistics, quotes, dates, and factual assertions.',
  },
  {
    icon: Shield,
    title: 'Source Verification',
    description:
      'Each claim is cross-referenced against authoritative sources with transparent attribution and confidence scoring.',
  },
  {
    icon: BarChart3,
    title: 'Trust Scoring',
    description:
      'Get a comprehensive trust score for your document, with per-claim breakdowns so you know exactly what to trust.',
  },
];

const workflowSteps = [
  {
    step: 1,
    title: 'Upload',
    description: 'Drop your PDF or paste a URL. We accept research papers, news articles, and reports.',
  },
  {
    step: 2,
    title: 'Analyze',
    description: 'Our AI extracts claims, identifies sources, and cross-references each assertion.',
  },
  {
    step: 3,
    title: 'Verify',
    description: 'Review color-coded results with confidence scores, source links, and a trust summary.',
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <LandingLayout>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center">
        <FadeInSection className="flex flex-col items-center gap-6 max-w-3xl mx-auto">
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-coglens-border bg-coglens-surface px-3 py-1 text-xs text-coglens-secondary">
              <Sparkles className="h-3 w-3" />
              AI-powered document verification
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl font-semibold leading-tight tracking-tight text-coglens-primary sm:text-5xl md:text-6xl"
          >
            Verify information
            <br />
            with confidence.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="max-w-xl text-lg leading-relaxed text-coglens-secondary"
          >
            CogLens analyzes documents, extracts claims, and verifies them
            against authoritative sources — so you can trust what you read.
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center gap-3 mt-2">
            <Link href="/upload">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload PDF
              </Button>
            </Link>
            <a href="#workflow">
              <Button variant="secondary">
                View Workflow
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </motion.div>
        </FadeInSection>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <FadeInSection className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-2xl font-semibold tracking-tight text-coglens-primary sm:text-3xl">
              Everything you need to verify documents
            </h2>
            <p className="mt-3 text-coglens-secondary max-w-lg mx-auto">
              A complete pipeline from upload to verified results — transparent, fast, and reliable.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp}>
                <Card className="h-full">
                  <CardContent className="flex flex-col gap-3 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-coglens-surface border border-coglens-border">
                      <f.icon className="h-5 w-5 text-coglens-accent" />
                    </div>
                    <h3 className="text-sm font-medium text-coglens-primary">
                      {f.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-coglens-muted">
                      {f.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Workflow ──────────────────────────────────────────── */}
      <section id="workflow" className="px-6 py-24 scroll-mt-20">
        <FadeInSection className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-2xl font-semibold tracking-tight text-coglens-primary sm:text-3xl">
              How it works
            </h2>
            <p className="mt-3 text-coglens-secondary max-w-lg mx-auto">
              Three simple steps from document to verified truth.
            </p>
          </motion.div>

          <div className="grid gap-0 md:grid-cols-3">
            {workflowSteps.map((s, i) => (
              <motion.div
                key={s.step}
                variants={fadeUp}
                className="relative flex flex-col items-center text-center px-6 py-8"
              >
                {/* connector line */}
                {i < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-[3.25rem] left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-coglens-border" />
                )}

                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-coglens-border bg-coglens-surface text-sm font-semibold text-coglens-primary mb-4">
                  {s.step}
                </div>
                <h3 className="text-base font-medium text-coglens-primary mb-2">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-coglens-muted max-w-xs">
                  {s.description}
                </p>
              </motion.div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <FadeInSection className="max-w-2xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            className="rounded-2xl border border-coglens-border bg-coglens-surface p-12"
          >
            <CheckCircle2 className="h-8 w-8 text-coglens-accent mx-auto mb-4" />
            <h2 className="text-2xl font-semibold tracking-tight text-coglens-primary mb-3">
              Ready to verify your first document?
            </h2>
            <p className="text-coglens-secondary mb-6 max-w-md mx-auto">
              Upload a PDF and get a detailed verification report in minutes. No account required.
            </p>
            <Link href="/upload">
              <Button>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </FadeInSection>
      </section>
    </LandingLayout>
  );
}
