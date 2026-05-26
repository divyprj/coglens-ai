/**
 * CogLens — Batch Claim Search (Optimized Parallel Version)
 *
 * Searches all claims in parallel in small chunks to respect Serper free-tier rate limits.
 */

import { searchGoogle, type SerperResult } from './serper-client';

export async function searchAllClaims(
  claims: string[]
): Promise<Map<number, SerperResult[]>> {
  const results = new Map<number, SerperResult[]>();

  if (claims.length === 0) {
    return results;
  }

  console.log(`[search] Starting chunked parallel search for ${claims.length} claims`);

  const CHUNK_SIZE = 5;
  const DELAY_MS = 200;

  for (let i = 0; i < claims.length; i += CHUNK_SIZE) {
    const chunk = claims.slice(i, i + CHUNK_SIZE);
    
    // Process chunk in parallel
    const promises = chunk.map(async (claim, chunkIndex) => {
      const globalIndex = i + chunkIndex;
      try {
        const searchResults = await searchGoogle(claim);
        return { index: globalIndex, searchResults };
      } catch (err) {
        console.error(`[search] Search failed for claim ${globalIndex} ("${claim}"):`, err);
        return { index: globalIndex, searchResults: [] as SerperResult[] };
      }
    });

    const resolved = await Promise.all(promises);
    resolved.forEach(({ index, searchResults }) => {
      results.set(index, searchResults);
    });

    // Add a small delay between chunks to respect rate limits
    if (i + CHUNK_SIZE < claims.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  console.log('[search] Chunked parallel search completed successfully');
  return results;
}
