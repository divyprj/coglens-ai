import crypto from 'crypto';
import type { VerificationResult } from './types';

interface CacheEntry {
  result: VerificationResult;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 10 * 60 * 1000; // 10 minutes (configurable)

/**
 * Generate a unique cache key based on file metadata and content hash
 */
export function getCacheKey(fileName: string, fileSize: number, pdfText: string): string {
  const cleanText = (pdfText || '').trim();
  const hash = crypto.createHash('sha256').update(cleanText).digest('hex');
  return `${fileName}-${fileSize}-${hash}`;
}

/**
 * Retrieve verification result from cache if valid and not expired
 */
export function getCachedResult(key: string): VerificationResult | null {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  console.log(`[cache] Cache HIT for key: ${key}`);
  return entry.result;
}

/**
 * Cache verification result with TTL
 */
export function setCachedResult(key: string, result: VerificationResult): void {
  console.log(`[cache] Caching verification result for key: ${key}`);
  cache.set(key, {
    result,
    expiresAt: Date.now() + TTL_MS,
  });
}
