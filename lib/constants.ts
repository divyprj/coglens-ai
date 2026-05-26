/**
 * CogLens — Domain Constants
 */

/* ──────────────────────────────────────────────
   Verification Statuses
   ────────────────────────────────────────────── */

export const VERIFICATION_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  EXTRACTING: "extracting",
  ANALYZING: "analyzing",
  SOURCING: "sourcing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type VerificationStatusValue =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

/** Human-readable labels for each status */
export const VERIFICATION_STATUS_LABELS: Record<
  VerificationStatusValue,
  string
> = {
  pending: "Waiting to start",
  processing: "Processing document",
  extracting: "Extracting claims",
  analyzing: "Analyzing claims",
  sourcing: "Finding sources",
  completed: "Verification complete",
  failed: "Verification failed",
};

/* ──────────────────────────────────────────────
   Trust Score Ranges
   ────────────────────────────────────────────── */

export const TRUST_SCORE = {
  /** 80–100 — strong evidence supports the document */
  HIGH: { min: 80, max: 100, label: "High Trust", color: "success" },
  /** 50–79 — mixed or partial evidence */
  MEDIUM: { min: 50, max: 79, label: "Medium Trust", color: "warning" },
  /** 0–49 — weak or contradictory evidence */
  LOW: { min: 0, max: 49, label: "Low Trust", color: "error" },
} as const;

/**
 * Determine the trust tier for a numeric score.
 */
export function getTrustTier(score: number) {
  if (score >= TRUST_SCORE.HIGH.min) return TRUST_SCORE.HIGH;
  if (score >= TRUST_SCORE.MEDIUM.min) return TRUST_SCORE.MEDIUM;
  return TRUST_SCORE.LOW;
}

/* ──────────────────────────────────────────────
   File Upload Constraints
   ────────────────────────────────────────────── */

/** Maximum file size in bytes (20 MB) */
export const MAX_FILE_SIZE = 20 * 1024 * 1024;

/** Maximum file size formatted for display */
export const MAX_FILE_SIZE_LABEL = "20 MB";

/** Allowed MIME types for document upload */
export const SUPPORTED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

/** Human-readable list of accepted extensions */
export const SUPPORTED_EXTENSIONS = [
  ".pdf",
  ".txt",
  ".md",
  ".doc",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
] as const;

/** Accept string for <input type="file"> */
export const FILE_INPUT_ACCEPT = SUPPORTED_FILE_TYPES.join(",");

/* ──────────────────────────────────────────────
   Claim Verdicts
   ────────────────────────────────────────────── */

export const CLAIM_VERDICT = {
  SUPPORTED: "supported",
  REFUTED: "refuted",
  UNVERIFIABLE: "unverifiable",
  MIXED: "mixed",
} as const;

export type ClaimVerdictValue =
  (typeof CLAIM_VERDICT)[keyof typeof CLAIM_VERDICT];
