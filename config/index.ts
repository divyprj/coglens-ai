/**
 * CogLens — Application Configuration
 *
 * Central source of truth for app-wide constants.
 * Values that may change per-environment should reference env vars
 * with sensible defaults for local development.
 */

export const APP_CONFIG = {
  /** Display name shown in the UI and metadata */
  name: "CogLens",

  /** Semantic version — bump on each release */
  version: "0.1.0",

  /** One-liner used in metadata and footers */
  description:
    "AI-powered document verification and fact-checking with source-backed evidence.",

  /** Canonical URL — falls back to localhost in dev */
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  /** Repository link for footer / about pages */
  repository: "https://github.com/coglens/coglens",
} as const;

export const API_CONFIG = {
  /** Maximum request timeout in milliseconds */
  timeout: 30_000,

  /** Base retry count for transient failures */
  maxRetries: 3,

  /** Supported AI providers */
  providers: ["gemini", "openai"] as const,
} as const;

export const FEATURE_FLAGS = {
  /** Show analytics dashboard */
  analytics: true,

  /** Enable multi-document comparison */
  comparison: false,

  /** Enable collaborative verification */
  collaboration: false,
} as const;
