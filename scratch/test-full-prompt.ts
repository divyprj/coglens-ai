import fs from 'fs';
import path from 'path';

// Load env vars manually from .env.local
let apiKey = '';
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        if (key && !key.startsWith('#')) {
          process.env[key] = val;
          if (key === 'GEMINI_API_KEY') {
            apiKey = val;
          }
        }
      }
    });
  }
} catch (e) {
  console.warn('Failed to parse .env.local:', e);
}

import { extractTextFromPdf } from '../lib/pdf/extract-text';
import { extractClaims } from '../lib/ai/extract-claims';
import { searchAllClaims } from '../lib/search/search-claims';

async function run() {
  const pdfPath = 'C:\\Users\\suraj\\Downloads\\2see_advanced_stress_test.pdf';
  const buffer = fs.readFileSync(pdfPath);
  const textResult = await extractTextFromPdf(buffer);
  const claims = await extractClaims(textResult.text);
  const searchResultsMap = await searchAllClaims(claims.map(c => c.claim));
  
  const claimsWithSearch = claims.map((c, idx) => ({
    claim: c.claim,
    searchResults: searchResultsMap.get(idx) || []
  }));

  let claimsPromptText = '';
  claimsWithSearch.forEach((item, index) => {
    const claimNum = index + 1;
    claimsPromptText += `CLAIM [${claimNum}]: "${item.claim}"\n`;
    if (!item.searchResults || item.searchResults.length === 0) {
      claimsPromptText += `SEARCH RESULTS FOR CLAIM [${claimNum}]: No search results found.\n\n`;
    } else {
      claimsPromptText += `SEARCH RESULTS FOR CLAIM [${claimNum}]:\n`;
      item.searchResults.forEach((r, si) => {
        claimsPromptText += `[Source ${si + 1}] "${r.title}" (${r.url})\n    Snippet: ${r.snippet}\n`;
      });
      claimsPromptText += `\n`;
    }
  });

  const prompt = `You are a fact-checking assistant. Analyze the following claims and their search results.

VERDICT DEFINITIONS:
- "Verified": The claim is factually accurate and directly supported by matching dates, statistics, numbers, or assertions in the search results.
- "Misleading": The claim contains elements of truth but presents them in a distorted, exaggerated, out-of-context, or partially inaccurate way.
- "False": The claim is directly contradicted by facts in the search results, or the facts/statistics mentioned are completely fabricated.
- "Unverifiable": The search results do not contain enough relevant information to prove or disprove the claim.

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

  const model = 'gemini-3.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  console.log('Sending full batch verification request to Gemini...');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      },
    }),
  });

  console.log('Response status:', res.status);
  const data = await res.json();
  console.log('Response body:', JSON.stringify(data, null, 2));
}

run().catch(console.error);
