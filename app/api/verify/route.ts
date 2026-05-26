/**
 * CogLens — Main Verification Pipeline
 *
 * POST /api/verify
 * Accepts multipart/form-data with a PDF file.
 * Returns a complete VerificationResult JSON.
 */

import { NextResponse } from 'next/server';
import { extractTextFromPdf } from '@/lib/pdf/extract-text';
import { validatePdfFile } from '@/lib/pdf/validation';
import { extractClaims } from '@/lib/ai/extract-claims';
import { verifyClaimsBatch } from '@/lib/ai/verify-claims';
import { searchAllClaims } from '@/lib/search/search-claims';
import { calculateTrustScore } from '@/lib/analytics/trust-score';
import { saveReport } from '@/lib/supabase/reports';
import { getCacheKey, getCachedResult, setCachedResult } from '@/lib/cache';
import type { VerificationResult, Claim, Source } from '@/lib/types';

// Force Node.js runtime for pdf-parse compatibility
export const runtime = 'nodejs';

// Allow up to 60s for the full pipeline on Vercel
export const maxDuration = 60;

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // ── 1. Parse form data ──────────────────────────────
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      console.error('[verify] No file in FormData. Keys:', [...formData.keys()]);
      return NextResponse.json(
        { error: 'No PDF file provided.' },
        { status: 400 }
      );
    }

    console.log('[verify] File received:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // ── 2. Validate ─────────────────────────────────────
    const validation = validatePdfFile({
      type: file.type,
      size: file.size,
      name: file.name,
    });

    if (!validation.valid) {
      console.error('[verify] Validation failed:', validation.error);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // ── 3. Extract text ─────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('[verify] Buffer created:', {
      arrayBufferBytes: arrayBuffer.byteLength,
      bufferBytes: buffer.length,
      firstBytes: buffer.slice(0, 5).toString('ascii'),
    });

    let extraction;
    try {
      extraction = await extractTextFromPdf(buffer);
      console.log('[verify] Extraction success:', {
        textLength: extraction.text.length,
        pageCount: extraction.pageCount,
      });
    } catch (err) {
      console.error('[verify] Extraction failed:', err instanceof Error ? err.message : err);
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : 'Failed to extract text from PDF.',
        },
        { status: 422 }
      );
    }

    // ── Cache Check ─────────────────────────────────────
    const cacheKey = getCacheKey(file.name, file.size, extraction.text);
    const cachedResult = getCachedResult(cacheKey);
    if (cachedResult) {
      console.log('[verify] Cache HIT! Returning cached result immediately.');
      return NextResponse.json(cachedResult);
    }

    // ── 4. Extract claims ───────────────────────────────
    let rawClaims;
    try {
      rawClaims = await extractClaims(extraction.text);
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : 'Failed to extract claims.',
        },
        { status: 422 }
      );
    }

    // ── 5. Search for each claim ────────────────────────
    const claimTexts = rawClaims.map((c) => c.claim);
    const searchResults = await searchAllClaims(claimTexts);

    // ── 6. Verify claims in batch ────────────────────────
    const claimsToVerify = rawClaims.map((raw, i) => ({
      claim: raw.claim,
      searchResults: searchResults.get(i) || []
    }));

    let verificationOutputs;
    try {
      // Add a small delay (500ms) before the verification request to be kind to free tier rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
      
      verificationOutputs = await verifyClaimsBatch(claimsToVerify);
    } catch (batchErr) {
      console.error('[verify] Batch verification failed entirely, falling back to default:', batchErr);
      
      // Fallback: build default unverifiable results for everything
      verificationOutputs = claimsToVerify.map(() => ({
        verdict: 'unverifiable' as const,
        confidence: 0.3,
        reasoning: 'Verification service is temporarily busy. Please try again shortly.',
        sources: []
      }));
    }

    const claims: Claim[] = claimsToVerify.map((item, i) => {
      const v = verificationOutputs[i] || {
        verdict: 'unverifiable',
        confidence: 0.3,
        reasoning: 'Verification could not be completed for this claim.',
        sources: []
      };

      const sources: Source[] = (v.sources || []).map((s, si) => ({
        id: `src-${i}-${si}`,
        title: s.title,
        url: s.url,
        snippet: s.snippet,
        publisher: s.publisher,
        credibility: s.credibility,
        publishedAt: null,
      }));

      return {
        id: `claim-${i}`,
        documentId: 'doc-1',
        text: item.claim,
        verdict: v.verdict,
        confidence: v.confidence,
        sources,
        reasoning: v.reasoning,
      };
    });

    // ── 7. Calculate trust score ─────────────────────────
    const verdicts = claims.map((c) => c.verdict);
    const trustScore = calculateTrustScore(verdicts);

    // ── 8. Build result ─────────────────────────────────
    const processingTime = Date.now() - startTime;

    const result: VerificationResult = {
      document: {
        id: crypto.randomUUID(),
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        content: '', // Don't send full text back to client
        uploadedAt: new Date().toISOString(),
        status: 'completed',
        trustScore,
      },
      claims,
      trustScore,
      summary: generateSummary(claims, trustScore, file.name),
      completedAt: new Date().toISOString(),
      processingTime,
    };

    // ── 9. Save to Supabase (optional) ──────────────────
    const reportId = await saveReport(result);

    const finalResult = {
      ...result,
      reportId: reportId || undefined,
    };

    // Cache the result
    setCachedResult(cacheKey, finalResult);

    return NextResponse.json(finalResult);
  } catch (err) {
    console.error('Verification pipeline error:', err);

    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function generateSummary(
  claims: Claim[],
  trustScore: number,
  fileName: string
): string {
  const total = claims.length;
  const supported = claims.filter((c) => c.verdict === 'supported').length;
  const refuted = claims.filter((c) => c.verdict === 'refuted').length;
  const mixed = claims.filter((c) => c.verdict === 'mixed').length;
  const unverifiable = claims.filter(
    (c) => c.verdict === 'unverifiable'
  ).length;

  const parts: string[] = [
    `Analyzed ${total} claims from "${fileName}".`,
  ];

  if (supported > 0) parts.push(`${supported} verified by reliable sources.`);
  if (refuted > 0) parts.push(`${refuted} contradicted by evidence.`);
  if (mixed > 0) parts.push(`${mixed} partially supported or context-dependent.`);
  if (unverifiable > 0) parts.push(`${unverifiable} could not be verified.`);

  parts.push(`Overall trust score: ${trustScore}/100.`);

  return parts.join(' ');
}
