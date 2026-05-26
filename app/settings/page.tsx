'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Key,
  CheckCircle2,
  XCircle,
  Shield,
  Bell,
  BarChart3,
  Info,
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface KeyStatus {
  provider: string;
  configured: boolean;
  preview: string | null;
}

const PROVIDER_META: Record<string, { label: string; description: string }> = {
  gemini: {
    label: 'Google Gemini',
    description: 'AI claim extraction and verification (fallback)',
  },
  groq: {
    label: 'Groq API',
    description: 'Primary AI provider (llama-3.3-70b-versatile)',
  },
  openai: {
    label: 'OpenAI',
    description: 'Alternative AI provider (optional)',
  },
  serper: {
    label: 'Serper',
    description: 'Google Search API for source discovery',
  },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const [keys, setKeys] = useState<KeyStatus[]>([]);
  const [loading, setLoading] = useState(true);

  // Preferences (client-side only)
  const [autoVerify, setAutoVerify] = useState(false);
  const [showConfidence, setShowConfidence] = useState(true);

  useEffect(() => {
    fetch('/api/keys')
      .then((res) => res.json())
      .then((data) => setKeys(data))
      .catch(() => setKeys([]))
      .finally(() => setLoading(false));
  }, []);

  const hasAIProvider = keys.some(k => (k.provider === 'groq' || k.provider === 'gemini') && k.configured);
  const requiredMissing = keys.filter(k => {
    if (k.provider === 'serper') return !k.configured;
    if (k.provider === 'groq') return !hasAIProvider;
    return false;
  });

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
          title="Settings"
          subtitle="Configure API keys and preferences."
        />
      </motion.div>

      {/* Missing keys warning */}
      {!loading && requiredMissing.length > 0 && (
        <motion.div variants={fadeUp}>
          <div className="rounded-lg border border-coglens-warning/20 bg-coglens-warning/[0.04] px-5 py-4">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-coglens-warning mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-coglens-primary">
                  Missing API Keys
                </p>
                <p className="text-xs text-coglens-secondary mt-1 leading-relaxed">
                  {requiredMissing.map((k) => PROVIDER_META[k.provider]?.label || k.provider).join(' and ')}{' '}
                  {requiredMissing.length === 1 ? 'is' : 'are'} not configured.
                  Add {requiredMissing.length === 1 ? 'it' : 'them'} to your{' '}
                  <code className="text-[11px] px-1 py-0.5 rounded bg-coglens-card border border-coglens-border font-mono">
                    .env.local
                  </code>{' '}
                  file to enable verification.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* API Keys */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="px-5 py-4 border-b border-coglens-border">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-coglens-accent" />
              <h3 className="text-sm font-medium text-coglens-primary">
                API Configuration
              </h3>
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-coglens-border">
            {loading ? (
              <div className="px-5 py-4 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              keys.map((key) => {
                const meta = PROVIDER_META[key.provider];
                return (
                  <div
                    key={key.provider}
                    className="flex items-center justify-between px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-coglens-primary">
                        {meta?.label || key.provider}
                      </p>
                      <p className="text-xs text-coglens-muted mt-0.5">
                        {meta?.description || ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {key.configured ? (
                        <>
                          <code className="hidden sm:block text-[11px] text-coglens-muted font-mono">
                            {key.preview}
                          </code>
                          <Badge variant="verified">Active</Badge>
                        </>
                      ) : (
                        <Badge variant="default">Not Set</Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Preferences */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="px-5 py-4 border-b border-coglens-border">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-coglens-accent" />
              <h3 className="text-sm font-medium text-coglens-primary">
                Preferences
              </h3>
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-coglens-border">
            <ToggleRow
              label="Auto-verify on upload"
              description="Automatically start verification when a document is uploaded"
              icon={BarChart3}
              checked={autoVerify}
              onChange={setAutoVerify}
            />
            <ToggleRow
              label="Show confidence scores"
              description="Display confidence percentages on claim cards"
              icon={BarChart3}
              checked={showConfidence}
              onChange={setShowConfidence}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* About */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="px-5 py-4 border-b border-coglens-border">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-coglens-accent" />
              <h3 className="text-sm font-medium text-coglens-primary">
                About
              </h3>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-coglens-muted text-xs">Application</p>
                <p className="text-coglens-primary font-medium mt-0.5">CogLens</p>
              </div>
              <div>
                <p className="text-coglens-muted text-xs">Version</p>
                <p className="text-coglens-primary font-medium mt-0.5">0.1.0</p>
              </div>
              <div>
                <p className="text-coglens-muted text-xs">AI Model</p>
                <p className="text-coglens-primary font-medium mt-0.5">Groq Llama 3 / Gemini</p>
              </div>
              <div>
                <p className="text-coglens-muted text-xs">Built for</p>
                <p className="text-coglens-primary font-medium mt-0.5">Cog Culture Agency</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle Row                                                         */
/* ------------------------------------------------------------------ */

function ToggleRow({
  label,
  description,
  icon: Icon,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-coglens-primary">{label}</p>
        <p className="text-xs text-coglens-muted mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 ml-4 h-5 w-9 rounded-full transition-colors cursor-pointer ${
          checked ? 'bg-coglens-success/60' : 'bg-coglens-card border border-coglens-border'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
