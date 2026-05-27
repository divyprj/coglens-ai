/**
 * CogLens — AI Claim Extraction
 *
 * Scans document to extract all factual claims.
 * Primary: Groq (llama-3.3-70b-versatile)
 * Fallback 1: Gemini (gemini-3.5-flash)
 * Fallback 2: Local Sentence-Splitting Heuristics
 */

import { callGroq } from './groq-client';
import { callGemini } from './gemini-client';

export interface ExtractedClaim {
  claim: string;
  type: 'statistical' | 'factual' | 'temporal' | 'comparative';
}

/**
 * Main claim extraction handler.
 */
export async function extractClaims(
  documentText: string
): Promise<ExtractedClaim[]> {
  console.log('[extract] Starting claim extraction. Text length:', documentText.length);

  if (documentText.length < 50) {
    throw new Error(
      'Document text is too short to extract meaningful claims.'
    );
  }

  const prompt = `You are an AI fact-checking assistant. Read the following text extracted from a document and extract the top factual, statistical, temporal, or comparative assertions that can be verified with web search.
  
RULES:
1. Extract only objective factual statements (e.g. statistics, dates, measurable achievements, historical events).
2. Avoid subjective opinions, promotional statements, section headers, or general metadata instructions.
3. Keep each claim as a complete, self-contained sentence.
4. Extract up to 50 claims.
5. Return ONLY a valid JSON array of objects, with no markdown formatting or other conversational text.

JSON format:
[
  {
    "claim": "The exact factual claim text.",
    "type": "statistical" | "factual" | "temporal" | "comparative"
  }
]

TEXT:
${documentText}`;

  // Try Groq first
  if (process.env.GROQ_API_KEY) {
    console.log('[provider] Extracting claims using Groq (Primary)...');
    try {
      const response = await callGroq(prompt);
      const claims = parseClaimsResponse(response);
      if (claims && claims.length > 0) {
        console.log(`[provider] Successfully extracted ${claims.length} claims using Groq.`);
        return claims;
      }
    } catch (err) {
      console.warn('[provider] Groq claim extraction failed, falling back to Gemini...', err);
    }
  } else {
    console.log('[provider] GROQ_API_KEY not configured, trying Gemini fallback...');
  }

  // Try Gemini next
  if (process.env.GEMINI_API_KEY) {
    console.log('[provider] Extracting claims using Gemini (Fallback)...');
    try {
      const response = await callGemini(prompt);
      const claims = parseClaimsResponse(response);
      if (claims && claims.length > 0) {
        console.log(`[provider] Successfully extracted ${claims.length} claims using Gemini.`);
        return claims;
      }
    } catch (err) {
      console.warn('[provider] Gemini claim extraction failed, falling back to local heuristic...', err);
    }
  } else {
    console.log('[provider] GEMINI_API_KEY not configured, falling back to local heuristic...');
  }

  // Final fallback: Local sentence-splitting heuristic
  console.log('[provider] Using Local Heuristic (Final Fallback)...');
  const localClaims = extractClaimsLocal(documentText);
  return localClaims;
}

/**
 * Parser helper to extract JSON array from model text response.
 */
function parseClaimsResponse(text: string): ExtractedClaim[] | null {
  try {
    const jsonStr = extractJsonArray(text);
    if (!jsonStr) return null;

    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) return null;

    return parsed
      .map((item: any) => ({
        claim: String(item.claim || '').trim(),
        type: (['statistical', 'factual', 'temporal', 'comparative'].includes(item.type)
          ? item.type
          : 'factual') as ExtractedClaim['type'],
      }))
      .filter((item) => item.claim.length > 15);
  } catch (err) {
    console.error('[extract] Failed to parse claims response JSON:', err);
    return null;
  }
}

/**
 * Robust JSON array extractor using bracket matching depth count.
 */
function extractJsonArray(text: string): string | null {
  const startIdx = text.indexOf('[');
  if (startIdx === -1) {
    return null;
  }

  let depth = 0;
  for (let i = startIdx; i < text.length; i++) {
    if (text[i] === '[') {
      depth++;
    } else if (text[i] === ']') {
      depth--;
      if (depth === 0) {
        return text.slice(startIdx, i + 1);
      }
    }
  }
  return null;
}

/**
 * Clean Local Sentence-Splitting Heuristic (Fallback).
 */
function extractClaimsLocal(documentText: string): ExtractedClaim[] {
  const blocklist = [
    'this document is intentionally designed',
    'it contains accurate claims',
    'this report intentionally includes',
    'a robust verification engine',
    'mixed accuracy',
    'intelligence brief',
  ];

  // Step 1: Normalize newlines
  const text = documentText.replace(/\r\n/g, '\n');

  // Step 2: Split into paragraphs and reconstruct lines
  const rawParagraphs = text.split(/\n\n+/);
  const paragraphs: string[] = [];

  for (const p of rawParagraphs) {
    const trimmed = p.trim();
    if (!trimmed) continue;

    const lines = trimmed.split('\n').map((l) => l.trim());
    let reconstructed = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      if (reconstructed === '') {
        reconstructed = line;
      } else {
        const lastChar = reconstructed.slice(-1);
        const startsWithBullet = /^[\s•\-\*#\d+\.]/.test(line);
        const nextLineStartsUppercase = /^[A-Z0-9]/.test(line);
        const currentLineEndsPunctuation = /[.,;:!?\-\"']$/.test(reconstructed);
        const currentLineEndsSentence = /[.!?]$/.test(reconstructed);

        if (lastChar === '-') {
          reconstructed = reconstructed.slice(0, -1) + line;
        } else if (startsWithBullet) {
          reconstructed += '\n' + line;
        } else if (currentLineEndsSentence || (!currentLineEndsPunctuation && nextLineStartsUppercase)) {
          reconstructed += '\n' + line;
        } else {
          reconstructed += ' ' + line;
        }
      }
    }
    paragraphs.push(reconstructed);
  }

  // Step 3: Split paragraphs into sentences
  const claims: ExtractedClaim[] = [];

  for (const paragraph of paragraphs) {
    const sentences = paragraph
      .split(/(?:(?<=[.!?])\s+(?=[A-Z0-9"“'‘•\-\*])|\n+)/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const sentence of sentences) {
      const cleanSentence = sentence.replace(/^[\s•\-\*#\d+\.\)\(]+/, '').trim();
      const lower = cleanSentence.toLowerCase();

      // Skip blocklist
      if (blocklist.some((block) => lower.includes(block))) {
        continue;
      }

      // Check length constraints
      if (cleanSentence.length < 25 || cleanSentence.length > 350) {
        continue;
      }

      // Check for sentence-ending punctuation
      if (!/[.!?]$/.test(cleanSentence)) {
        continue;
      }

      // Skip subjective/opinion sentences unless they contain statistical or temporal facts
      const hasSubjective = /\b(we|our|us|i|my|think|believe|feel|opinion|should|must|recommend)\b/i.test(lower);
      const hasStat = /\d+%\s*|\d+\s*percent|\b(billion|million|trillion|percent)\b/i.test(cleanSentence) || /\b(19|20)\d{2}\b/.test(cleanSentence);
      if (hasSubjective && !hasStat) {
        continue;
      }

      // Skip page footers or headers
      if (/page\s+\d+\s+of\s+\d+/i.test(lower) || /^section\s+\d+/i.test(lower)) {
        continue;
      }

      let type: ExtractedClaim['type'] = 'factual';
      if (/\d+%\s*|\d+\s*percent/i.test(cleanSentence)) {
        type = 'statistical';
      } else if (/\b(19|20)\d{2}\b/.test(cleanSentence)) {
        type = 'temporal';
      } else if (/\b(more than|less than|higher|lower|increased|decreased|compared to|growth of)\b/i.test(lower)) {
        type = 'comparative';
      }

      claims.push({
        claim: cleanSentence,
        type,
      });
    }
  }

  // Return up to 50 claims
  return claims.slice(0, 50);
}
