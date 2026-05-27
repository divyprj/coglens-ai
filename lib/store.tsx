'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { VerificationResult } from './types';
import { reportStorage, cleanupLegacyStorage, type ScanHistoryEntry } from './report-storage';

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
  /** All persisted scan history entries, newest first. */
  scanHistory: ScanHistoryEntry[];
  startVerification: (file: File) => Promise<void>;
  setResult: (result: VerificationResult) => void;
  clearResult: () => void;
  /** Load a historical result by ID into currentResult. */
  loadResult: (id: string) => boolean;
  /** Delete a scan from persistent history. */
  deleteScan: (id: string) => void;
  /** Clear all scan history. */
  clearHistory: () => void;
  /** Refresh scanHistory from storage (e.g. after external mutation). */
  refreshHistory: () => void;
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
  const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clean up legacy localStorage data and load session history on mount
  useEffect(() => {
    cleanupLegacyStorage();
    setScanHistory(reportStorage.getAll());
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const refreshHistory = useCallback(() => {
    setScanHistory(reportStorage.getAll());
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

        const result = data as VerificationResult;
        setCurrentResult(result);

        // Persist to local storage & refresh history
        reportStorage.save(result);
        setScanHistory(reportStorage.getAll());
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

  const loadResult = useCallback((id: string): boolean => {
    const result = reportStorage.getById(id);
    if (result) {
      setCurrentResult(result);
      setError(null);
      return true;
    }
    // Payload missing (orphan manifest entry) — clean up
    reportStorage.remove(id);
    setScanHistory(reportStorage.getAll());
    return false;
  }, []);

  const deleteScan = useCallback((id: string) => {
    reportStorage.remove(id);
    setScanHistory(reportStorage.getAll());
    // If the deleted scan is currently displayed, clear it
    setCurrentResult((prev) => {
      if (prev && prev.document.id === id) return null;
      return prev;
    });
  }, []);

  const clearHistory = useCallback(() => {
    reportStorage.clear();
    setScanHistory([]);
    setCurrentResult(null);
  }, []);

  return (
    <VerificationContext.Provider
      value={{
        currentResult,
        isVerifying,
        stageIndex,
        stageLabel,
        error,
        scanHistory,
        startVerification,
        setResult,
        clearResult,
        loadResult,
        deleteScan,
        clearHistory,
        refreshHistory,
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
