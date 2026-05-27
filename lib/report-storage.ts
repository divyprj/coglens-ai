'use client';

/**
 * CogLens — Report Storage Layer
 *
 * Modular persistence adapter for scan history.
 * Currently backed by sessionStorage (privacy-first: data clears on tab/session close).
 * Designed to be replaced by a SupabaseStorageAdapter with zero frontend changes.
 */

import type { VerificationResult } from './types';

/* ------------------------------------------------------------------ */
/*  Public types                                                       */
/* ------------------------------------------------------------------ */

/** Lightweight metadata shown in dashboard lists (no heavy payload). */
export interface ScanHistoryEntry {
  id: string;
  fileName: string;
  trustScore: number;
  claimsCount: number;
  verifiedCount: number;
  misleadingCount: number;
  falseCount: number;
  sourcesCount: number;
  processingTime: number;
  completedAt: string;
  summary: string;
}

/** Abstract adapter — swap implementations without touching consumers. */
export interface StorageAdapter {
  /** Return all scan metadata, newest first. */
  getAll(): ScanHistoryEntry[];
  /** Return full result payload by ID, or null. */
  getById(id: string): VerificationResult | null;
  /** Persist a completed verification result. */
  save(result: VerificationResult): void;
  /** Remove a single scan by ID. */
  remove(id: string): void;
  /** Wipe all stored scans. */
  clear(): void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const MANIFEST_KEY = 'coglens:manifest';
const REPORT_PREFIX = 'coglens:reports:';

function verdictBucket(verdict: string): 'verified' | 'misleading' | 'false' {
  const v = verdict.toLowerCase();
  if (v === 'supported' || v === 'verified') return 'verified';
  if (v === 'refuted' || v === 'false') return 'false';
  return 'misleading';
}

function resultToEntry(result: VerificationResult): ScanHistoryEntry {
  let verified = 0;
  let misleading = 0;
  let falseCount = 0;
  let sourcesCount = 0;
  for (const c of result.claims) {
    const b = verdictBucket(c.verdict);
    if (b === 'verified') verified++;
    else if (b === 'misleading') misleading++;
    else falseCount++;
    sourcesCount += c.sources.length;
  }

  return {
    id: result.document.id,
    fileName: result.document.fileName,
    trustScore: result.trustScore,
    claimsCount: result.claims.length,
    verifiedCount: verified,
    misleadingCount: misleading,
    falseCount: falseCount,
    sourcesCount,
    processingTime: result.processingTime,
    completedAt: result.completedAt,
    summary: result.summary,
  };
}

/* ------------------------------------------------------------------ */
/*  sessionStorage implementation                                      */
/* ------------------------------------------------------------------ */

class SessionStorageAdapter implements StorageAdapter {
  /* ── manifest (ordered array of entry metadata) ──────────────── */

  private readManifest(): ScanHistoryEntry[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = sessionStorage.getItem(MANIFEST_KEY);
      return raw ? (JSON.parse(raw) as ScanHistoryEntry[]) : [];
    } catch {
      return [];
    }
  }

  private writeManifest(entries: ScanHistoryEntry[]): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(MANIFEST_KEY, JSON.stringify(entries));
    } catch {
      // quota — handled in save()
    }
  }

  /* ── public API ──────────────────────────────────────────────── */

  getAll(): ScanHistoryEntry[] {
    return this.readManifest();
  }

  getById(id: string): VerificationResult | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(REPORT_PREFIX + id);
      return raw ? (JSON.parse(raw) as VerificationResult) : null;
    } catch {
      return null;
    }
  }

  save(result: VerificationResult): void {
    if (typeof window === 'undefined') return;
    const entry = resultToEntry(result);
    const id = entry.id;

    // Attempt to write the full result payload
    try {
      sessionStorage.setItem(REPORT_PREFIX + id, JSON.stringify(result));
    } catch {
      // Quota exceeded — evict oldest entry and retry once
      const manifest = this.readManifest();
      if (manifest.length > 0) {
        const oldest = manifest[manifest.length - 1];
        sessionStorage.removeItem(REPORT_PREFIX + oldest.id);
        manifest.pop();
        this.writeManifest(manifest);
        try {
          sessionStorage.setItem(REPORT_PREFIX + id, JSON.stringify(result));
        } catch {
          // Still failing — give up silently
          return;
        }
      } else {
        return;
      }
    }

    // Update manifest — deduplicate, then prepend (newest first)
    const manifest = this.readManifest().filter((e) => e.id !== id);
    manifest.unshift(entry);
    this.writeManifest(manifest);
  }

  remove(id: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(REPORT_PREFIX + id);
    const manifest = this.readManifest().filter((e) => e.id !== id);
    this.writeManifest(manifest);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    const manifest = this.readManifest();
    for (const e of manifest) {
      sessionStorage.removeItem(REPORT_PREFIX + e.id);
    }
    sessionStorage.removeItem(MANIFEST_KEY);
  }
}

/* ------------------------------------------------------------------ */
/*  Singleton export                                                    */
/* ------------------------------------------------------------------ */

/**
 * App-wide report storage instance.
 * Currently uses sessionStorage (privacy-first, session-scoped).
 * To migrate to Supabase, replace this with a SupabaseStorageAdapter
 * that implements the same StorageAdapter interface.
 */
export const reportStorage: StorageAdapter = new SessionStorageAdapter();

/* ------------------------------------------------------------------ */
/*  Legacy cleanup                                                     */
/* ------------------------------------------------------------------ */

/**
 * One-time cleanup of stale localStorage data from the previous
 * persistent implementation. Safe to call multiple times (no-op if clean).
 */
export function cleanupLegacyStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const legacyManifest = localStorage.getItem(MANIFEST_KEY);
    if (!legacyManifest) return;
    const entries = JSON.parse(legacyManifest) as { id: string }[];
    for (const e of entries) {
      localStorage.removeItem(REPORT_PREFIX + e.id);
    }
    localStorage.removeItem(MANIFEST_KEY);
  } catch {
    // Best-effort cleanup
    localStorage.removeItem(MANIFEST_KEY);
  }
}
