/**
 * CogLens — AI Claim Verification
 *
 * Uses Gemini to analyze search results and determine whether a claim is supported.
 */

import { callGemini } from './gemini-client';
import { callGroq } from './groq-client';

export interface SearchResultInput {
  title: string;
  url: string;
  snippet: string;
}

export interface VerifiedSource {
  title: string;
  url: string;
  snippet: string;
  publisher: string;
  credibility: number;
}

export interface VerificationOutput {
  verdict: 'supported' | 'refuted' | 'unverifiable' | 'mixed';
  confidence: number;
  reasoning: string;
  sources: VerifiedSource[];
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

const VERDICT_MAP: Record<string, VerificationOutput['verdict']> = {
  verified: 'supported',
  supported: 'supported',
  true: 'supported',
  misleading: 'mixed',
  mixed: 'mixed',
  partially: 'mixed',
  false: 'refuted',
  refuted: 'refuted',
  unclear: 'unverifiable',
  unverifiable: 'unverifiable',
  unverified: 'unverifiable',
};

export async function verifyClaim(
  claim: string,
  searchResults: SearchResultInput[]
): Promise<VerificationOutput> {
  if (searchResults.length === 0) {
    return {
      verdict: 'unverifiable',
      confidence: 0.3,
      reasoning: 'No search results found to verify this claim.',
      sources: [],
    };
  }

  const sourcesText = searchResults
    .map(
      (r, i) =>
        `[${i + 1}] "${r.title}" (${extractDomain(r.url)})\n    ${r.snippet}`
    )
    .join('\n\n');

  const prompt = `You are a fact-checker. Analyze whether search results support or contradict the following claim.

CLAIM: "${claim}"

SEARCH RESULTS:
${sourcesText}

Analyze the evidence and return ONLY valid JSON (no markdown, no code blocks):
{
  "verdict": "verified" | "misleading" | "false" | "unclear",
  "confidence": 0.0 to 1.0,
  "reasoning": "One or two sentences explaining your verdict",
  "relevantSourceIndices": [1, 2]
}

GUIDELINES:
- "verified": Multiple reliable sources confirm the claim
- "misleading": Claim is partially true but missing context or exaggerated
- "false": Sources directly contradict the claim
- "unclear": Insufficient or conflicting evidence
- confidence: How certain you are (0.0 = guess, 1.0 = definitive)`;

  const response = await callGemini(prompt);

  // Parse JSON
  let jsonStr = response;
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  try {
    const parsed = JSON.parse(jsonStr);

    const rawVerdict = String(parsed.verdict || 'unclear').toLowerCase();
    const verdict: VerificationOutput['verdict'] =
      VERDICT_MAP[rawVerdict] || 'unverifiable';

    const confidence = Math.min(
      1,
      Math.max(0, Number(parsed.confidence) || 0.5)
    );

    const reasoning = String(
      parsed.reasoning || 'Unable to generate reasoning.'
    );

    // Map relevant sources
    const relevantIndices: number[] = Array.isArray(
      parsed.relevantSourceIndices
    )
      ? parsed.relevantSourceIndices
      : [];

    const sources: VerifiedSource[] = searchResults
      .filter((_, i) => relevantIndices.length === 0 || relevantIndices.includes(i + 1))
      .slice(0, 5)
      .map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet,
        publisher: extractDomain(r.url),
        credibility: getSourceCredibility(extractDomain(r.url)),
      }));

    return { verdict, confidence, reasoning, sources };
  } catch {
    // Fallback if JSON parsing fails
    return {
      verdict: 'unverifiable',
      confidence: 0.4,
      reasoning: 'Could not parse verification results.',
      sources: searchResults.slice(0, 3).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet,
        publisher: extractDomain(r.url),
        credibility: 0.5,
      })),
    };
  }
}

export async function verifyClaimsBatch(
  claimsWithSearch: { claim: string; searchResults: SearchResultInput[] }[]
): Promise<VerificationOutput[]> {
  if (claimsWithSearch.length === 0) {
    return [];
  }

  // Format all claims and search results for the prompt
  let claimsPromptText = '';
  claimsWithSearch.forEach((item, index) => {
    const claimNum = index + 1;
    claimsPromptText += `CLAIM [${claimNum}]: "${item.claim}"\n`;
    if (!item.searchResults || item.searchResults.length === 0) {
      claimsPromptText += `SEARCH RESULTS FOR CLAIM [${claimNum}]: No search results found.\n\n`;
    } else {
      claimsPromptText += `SEARCH RESULTS FOR CLAIM [${claimNum}]:\n`;
      item.searchResults.forEach((r, si) => {
        claimsPromptText += `[Source ${si + 1}] "${r.title}" (${extractDomain(r.url)})\n    Snippet: ${r.snippet}\n`;
      });
      claimsPromptText += `\n`;
    }
  });

  const prompt = `You are a fact-checking assistant. Analyze the following claims and their search results.

VERDICT DEFINITIONS:
- "Verified": The claim is factually accurate and directly supported by matching dates, statistics, numbers, or assertions in the search results.
- "Misleading": The claim contains elements of truth but presents them in a distorted, exaggerated, out-of-context, or partially inaccurate way (e.g. claiming a milestone occurred in a different year than it actually did, or inflating a statistic slightly).
- "False": The claim is directly contradicted by facts in the search results, or the facts/statistics mentioned are completely fabricated.
- "Unverifiable": The search results do not contain enough relevant information to prove or disprove the claim, or the evidence is highly conflicting.

CLAIMS TO VERIFY:
${claimsPromptText}

Determine the verdict, confidence score (0-100), and a concise reason for each claim.
Possible verdicts: "Verified", "Misleading", "False", "Unverifiable".

Return ONLY a valid JSON array of objects matching this format:
[
  {
    "claim": "Claim text",
    "verdict": "Verified" | "Misleading" | "False" | "Unverifiable",
    "confidence": 82,
    "reason": "Concise reason why.",
    "sources": [1, 2]
  }
]
No markdown code blocks, no other text.`;

  console.log(`[verify] Starting single batched verification request for ${claimsWithSearch.length} claims`);

  try {
    let response = '';
    let providerUsed = 'groq';

    if (process.env.GROQ_API_KEY) {
      try {
        response = await callGroq(prompt);
        providerUsed = 'groq';
      } catch (err) {
        console.warn('[verify] Groq verification failed, trying Gemini...', err);
      }
    }

    if (!response && process.env.GEMINI_API_KEY) {
      try {
        response = await callGemini(prompt);
        providerUsed = 'gemini';
      } catch (err) {
        console.warn('[verify] Gemini verification failed...', err);
      }
    }

    if (!response) {
      throw new Error('All AI verification providers failed.');
    }

    console.log(`[verify] Raw response from ${providerUsed}:\n`, response);

    // Parse JSON using robust bracket-matching
    const jsonStr = extractJsonArray(response);
    if (!jsonStr) {
      throw new Error('No JSON array found in Gemini response.');
    }

    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) {
      throw new Error('Batch verification output is not an array.');
    }

    return claimsWithSearch.map((item, index) => {
      const parsedItem = parsed[index] || {};
      
      const rawVerdict = String(parsedItem.verdict || 'unclear').toLowerCase();
      const verdict: VerificationOutput['verdict'] =
        VERDICT_MAP[rawVerdict] || 'unverifiable';

      // Support 0-100 or 0-1 confidence scales
      let rawConf = Number(parsedItem.confidence);
      if (isNaN(rawConf)) {
        rawConf = 50;
      }
      if (rawConf > 1) {
        rawConf = rawConf / 100;
      }
      const confidence = Math.min(1, Math.max(0, rawConf));

      const reasoning = String(
        parsedItem.reason || parsedItem.reasoning || 'No explanation provided.'
      );

      // Support both "sources" or "relevantSourceIndices" in JSON response
      const relevantIndices: number[] = Array.isArray(parsedItem.sources)
        ? parsedItem.sources
        : Array.isArray(parsedItem.relevantSourceIndices)
        ? parsedItem.relevantSourceIndices
        : [];

      const sources: VerifiedSource[] = item.searchResults
        .filter((_, i) => relevantIndices.length === 0 || relevantIndices.includes(i + 1))
        .slice(0, 3)
        .map((r) => ({
          title: r.title,
          url: r.url,
          snippet: r.snippet,
          publisher: extractDomain(r.url),
          credibility: getSourceCredibility(extractDomain(r.url)),
        }));

      return { verdict, confidence, reasoning, sources };
    });
  } catch (err) {
    console.error('[verify] Batch verification failed:', err);
    
    // Graceful fallback behavior if the ONE request fails
    return claimsWithSearch.map((item) => ({
      verdict: 'unverifiable' as const,
      confidence: 0.3,
      reasoning: 'Verification service temporarily busy. Please retry in a moment.',
      sources: item.searchResults.slice(0, 2).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet,
        publisher: extractDomain(r.url),
        credibility: 0.5,
      })),
    }));
  }
}

/** Simple heuristic credibility based on known domains */
function getSourceCredibility(domain: string): number {
  const highCredibility = [
    'who.int', 'un.org', 'worldbank.org', 'imf.org', 'nature.com',
    'science.org', 'gov', 'edu', 'reuters.com', 'apnews.com',
    'bbc.com', 'bbc.co.uk', 'nytimes.com', 'washingtonpost.com',
    'theguardian.com', 'economist.com', 'ft.com', 'bloomberg.com',
    'statista.com', 'ourworldindata.org', 'pewresearch.org',
  ];

  const medCredibility = [
    'wikipedia.org', 'britannica.com', 'cnn.com', 'cnbc.com',
    'forbes.com', 'businessinsider.com', 'techcrunch.com',
  ];

  if (highCredibility.some((d) => domain.includes(d))) return 0.9;
  if (domain.endsWith('.gov') || domain.endsWith('.edu')) return 0.85;
  if (medCredibility.some((d) => domain.includes(d))) return 0.7;
  return 0.5;
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
