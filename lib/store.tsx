'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { VerificationResult } from './types';

/* ------------------------------------------------------------------ */
/*  Pipeline stages for visual progress                                */
/* ------------------------------------------------------------------ */

const PIPELINE_STAGES = [
  { label: 'Uploading PDF...', delay: 0 },
  { label: 'Extracting text...', delay: 2000 },
  { label: 'Extracting claims...', delay: 4000 },
  { label: 'Searching sources...', delay: 7000 },
  { label: 'Verifying claims...', delay: 10000 },
  { label: 'Generating trust report...', delay: 14000 },
] as const;

/* ------------------------------------------------------------------ */
/*  Context type                                                       */
/* ------------------------------------------------------------------ */

interface VerificationContextValue {
  currentResult: VerificationResult | null;
  isVerifying: boolean;
  stageIndex: number;
  stageLabel: string;
  error: string | null;
  startVerification: (file: File) => Promise<void>;
  setResult: (result: VerificationResult) => void;
  clearResult: () => void;
}

const VerificationContext = createContext<VerificationContextValue | null>(null);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function VerificationProvider({ children }: { children: ReactNode }) {
  const [currentResult, setCurrentResult] =
    useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [stageLabel, setStageLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const startVerification = useCallback(
    async (file: File) => {
      // Reset state
      setIsVerifying(true);
      setError(null);
      setCurrentResult(null);
      setStageIndex(0);
      setStageLabel(PIPELINE_STAGES[0].label);
      clearTimers();

      // Start simulated stage progression
      for (let i = 1; i < PIPELINE_STAGES.length; i++) {
        const timer = setTimeout(() => {
          setStageIndex(i);
          setStageLabel(PIPELINE_STAGES[i].label);
        }, PIPELINE_STAGES[i].delay);
        timersRef.current.push(timer);
      }

      // Actually call the API
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/verify', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Verification failed.');
        }

        clearTimers();
        setStageIndex(PIPELINE_STAGES.length);
        setStageLabel('Complete');
        setCurrentResult(data as VerificationResult);
      } catch (err) {
        clearTimers();
        let errMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
        if (
          errMsg.toLowerCase().includes('rate limit') ||
          errMsg.toLowerCase().includes('busy') ||
          errMsg.toLowerCase().includes('quota') ||
          errMsg.toLowerCase().includes('429') ||
          errMsg.toLowerCase().includes('overloaded')
        ) {
          errMsg = 'Verification service is temporarily busy. Retrying…';
        }
        setError(errMsg);
      } finally {
        setIsVerifying(false);
      }
    },
    [clearTimers]
  );

  const setResult = useCallback((result: VerificationResult) => {
    setCurrentResult(result);
    setError(null);
  }, []);

  const clearResult = useCallback(() => {
    setCurrentResult(null);
    setError(null);
    setStageIndex(0);
    setStageLabel('');
  }, []);

  return (
    <VerificationContext.Provider
      value={{
        currentResult,
        isVerifying,
        stageIndex,
        stageLabel,
        error,
        startVerification,
        setResult,
        clearResult,
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useVerification(): VerificationContextValue {
  const ctx = useContext(VerificationContext);
  if (!ctx) {
    throw new Error(
      'useVerification must be used within a VerificationProvider'
    );
  }
  return ctx;
}

export { PIPELINE_STAGES };
