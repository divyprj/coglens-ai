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
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
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
/*  Workflow animated connector                                        */
/* ------------------------------------------------------------------ */

function WorkflowConnector() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div
      ref={ref}
      className="hidden md:block absolute top-[3.25rem] left-[calc(16.67%+2rem)] w-[calc(66.66%-4rem)] h-px"
    >
      {/* Base line */}
      <div className="absolute inset-0 bg-coglens-border" />

      {/* Animated gradient flow */}
      <motion.div
        className="absolute inset-0 origin-left"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={
          inView
            ? { scaleX: 1, opacity: 1 }
            : { scaleX: 0, opacity: 0 }
        }
        transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      >
        <div className="h-full w-full bg-gradient-to-r from-white/[0.12] via-white/[0.06] to-white/[0.12]" />
      </motion.div>

      {/* Flowing pulse */}
      {inView && (
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-16 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          }}
          initial={{ left: '-4rem' }}
          animate={{ left: 'calc(100% + 4rem)' }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 1.5,
            ease: 'linear' as const,
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Workflow step component                                            */
/* ------------------------------------------------------------------ */

function WorkflowStep({
  step,
  title,
  description,
  index,
  inView,
}: {
  step: number;
  title: string;
  description: string;
  index: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: 'blur(0px)' }
          : { opacity: 0, y: 20, filter: 'blur(4px)' }
      }
      transition={{
        duration: 0.6,
        delay: 0.2 + index * 0.2,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      }}
      className="group relative flex flex-col items-center text-center px-6 py-8"
    >
      {/* Step number circle */}
      <motion.div
        className="relative flex h-14 w-14 items-center justify-center rounded-full border border-coglens-border bg-coglens-surface text-sm font-semibold text-coglens-primary mb-5 transition-all duration-300 group-hover:border-white/[0.15] group-hover:bg-coglens-card group-hover:shadow-lg group-hover:shadow-black/20 group-hover:-translate-y-0.5"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={
          inView
            ? { scale: 1, opacity: 1 }
            : { scale: 0.8, opacity: 0 }
        }
        transition={{
          duration: 0.4,
          delay: 0.3 + index * 0.2,
          ease: [0.25, 0.46, 0.45, 0.94] as const,
        }}
      >
        {/* Ambient ring on hover */}
        <div className="absolute inset-0 rounded-full bg-white/[0.02] scale-[1.4] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="relative z-10">{step}</span>
      </motion.div>

      {/* Title */}
      <h3 className="text-base font-medium text-coglens-primary mb-2 transition-colors duration-300 group-hover:text-white">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm leading-relaxed text-coglens-muted max-w-[240px] transition-colors duration-300 group-hover:text-coglens-secondary">
        {description}
      </p>

      {/* Mobile connector (vertical) */}
      {index < 2 && (
        <div className="md:hidden mt-6 flex flex-col items-center gap-1">
          <div className="w-px h-6 bg-gradient-to-b from-coglens-border to-transparent" />
          <ArrowRight className="h-3 w-3 text-coglens-muted/40 rotate-90" />
        </div>
      )}
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
    description:
      'Drop your PDF or paste a URL. We accept research papers, news articles, and reports.',
  },
  {
    step: 2,
    title: 'Analyze',
    description:
      'Our AI extracts claims, identifies sources, and cross-references each assertion.',
  },
  {
    step: 3,
    title: 'Verify',
    description:
      'Review color-coded results with confidence scores, source links, and a trust summary.',
  },
];

/* ------------------------------------------------------------------ */
/*  Workflow Section                                                   */
/* ------------------------------------------------------------------ */

function WorkflowSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section id="workflow" className="relative px-6 py-28 scroll-mt-20 overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-white/[0.008] blur-3xl" />
      </div>

      <div ref={sectionRef} className="relative max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={
            inView
              ? { opacity: 1, y: 0, filter: 'blur(0px)' }
              : { opacity: 0, y: 20, filter: 'blur(4px)' }
          }
          transition={{
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
          }}
          className="text-center mb-16"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-coglens-primary sm:text-3xl">
            How it works
          </h2>
          <p className="mt-3 text-coglens-secondary max-w-lg mx-auto">
            Three simple steps from document to verified truth.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="relative grid gap-0 md:grid-cols-3">
          {/* Animated connector line (desktop only) */}
          <WorkflowConnector />

          {/* Steps */}
          {workflowSteps.map((s, i) => (
            <WorkflowStep
              key={s.step}
              step={s.step}
              title={s.title}
              description={s.description}
              index={i}
              inView={inView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <LandingLayout>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-36 pb-28 text-center">
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
            against authoritative sources so you can trust what you read.
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
      <section id="features" className="px-6 py-24 scroll-mt-20">
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
              <motion.div key={f.title} variants={fadeUp} className="group">
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 hover:border-white/[0.1]">
                  <CardContent className="flex flex-col gap-3 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-coglens-surface border border-coglens-border transition-transform duration-300 group-hover:scale-110">
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
      <WorkflowSection />

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <FadeInSection className="max-w-2xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            className="rounded-2xl border border-coglens-border bg-coglens-surface/60 backdrop-blur-xl p-12 hover:border-white/[0.1] transition-colors duration-500"
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
