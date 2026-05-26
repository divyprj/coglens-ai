/**
 * CogLens — Core Type Definitions
 */

import type { ClaimVerdictValue, VerificationStatusValue } from "./constants";

/* ──────────────────────────────────────────────
   Document
   ────────────────────────────────────────────── */

export interface Document {
  id: string;
  /** Original file name */
  fileName: string;
  /** MIME type */
  fileType: string;
  /** File size in bytes */
  fileSize: number;
  /** Extracted plain-text content */
  content: string;
  /** ISO 8601 timestamp */
  uploadedAt: string;
  /** Current verification status */
  status: VerificationStatusValue;
  /** Final trust score (0–100), null while processing */
  trustScore: number | null;
}

/* ──────────────────────────────────────────────
   Claim
   ────────────────────────────────────────────── */

export interface Claim {
  id: string;
  /** Parent document ID */
  documentId: string;
  /** The factual assertion extracted from the document */
  text: string;
  /** AI verdict for this claim */
  verdict: ClaimVerdictValue;
  /** Confidence of the verdict (0–1) */
  confidence: number;
  /** Supporting sources that informed the verdict */
  sources: Source[];
  /** AI-generated explanation of the verdict */
  reasoning: string;
}

/* ──────────────────────────────────────────────
   Source
   ────────────────────────────────────────────── */

export interface Source {
  id: string;
  /** Display title */
  title: string;
  /** Source URL */
  url: string;
  /** Short excerpt or snippet relevant to the claim */
  snippet: string;
  /** Publisher or domain name */
  publisher: string;
  /** Source credibility score (0–1) */
  credibility: number;
  /** ISO 8601 publish date, if available */
  publishedAt: string | null;
}

/* ──────────────────────────────────────────────
   Verification Result
   ────────────────────────────────────────────── */

export interface VerificationResult {
  /** Associated document */
  document: Document;
  /** All claims extracted from the document */
  claims: Claim[];
  /** Overall trust score (0–100) */
  trustScore: number;
  /** AI-generated summary of the verification */
  summary: string;
  /** ISO 8601 timestamp of completion */
  completedAt: string;
  /** Processing duration in milliseconds */
  processingTime: number;
}

/* ──────────────────────────────────────────────
   Verification Status (UI state)
   ────────────────────────────────────────────── */

export interface VerificationStatus {
  status: VerificationStatusValue;
  /** Progress percentage (0–100) */
  progress: number;
  /** Current step label shown in the UI */
  message: string;
}

/* ──────────────────────────────────────────────
   Analytics Summary
   ────────────────────────────────────────────── */

export interface AnalyticsSummary {
  /** Total documents verified */
  totalDocuments: number;
  /** Average trust score across all documents */
  averageTrustScore: number;
  /** Total claims extracted and checked */
  totalClaims: number;
  /** Breakdown by verdict */
  verdictDistribution: {
    supported: number;
    refuted: number;
    unverifiable: number;
    mixed: number;
  };
  /** Total unique sources referenced */
  totalSources: number;
}

/* ──────────────────────────────────────────────
   Upload State (hook state shape)
   ────────────────────────────────────────────── */

export interface UploadState {
  /** Selected file, or null */
  file: File | null;
  /** Upload progress 0–100 */
  progress: number;
  /** Current phase of the upload */
  status: "idle" | "uploading" | "processing" | "complete" | "error";
  /** Error message, if any */
  error: string | null;
}
