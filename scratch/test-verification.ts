import fs from 'fs';
import path from 'path';

// Load env vars manually from .env.local
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
        }
      }
    });
    console.log('Loaded env keys manually from .env.local');
  }
} catch (e) {
  console.warn('Failed to parse .env.local:', e);
}

import { extractTextFromPdf } from '../lib/pdf/extract-text';
import { extractClaims } from '../lib/ai/extract-claims';
import { searchAllClaims } from '../lib/search/search-claims';
import { verifyClaimsBatch } from '../lib/ai/verify-claims';

async function runTest() {
  console.log('--- STARTING STRESS TEST PDF VERIFICATION ---');
  const pdfPath = 'C:\\Users\\suraj\\Downloads\\2see_advanced_stress_test.pdf';
  
  if (!fs.existsSync(pdfPath)) {
    console.error(`PDF not found at ${pdfPath}`);
    return;
  }

  const buffer = fs.readFileSync(pdfPath);
  console.log(`Loaded PDF, size: ${buffer.length} bytes`);

  console.log('1. Extracting text...');
  const textResult = await extractTextFromPdf(buffer);
  console.log(`Extracted text. Pages: ${textResult.pageCount}, Text Length: ${textResult.text.length}`);
  console.log('Text preview:\n', textResult.text.slice(0, 300), '\n...\n');

  console.log('2. Extracting claims...');
  const claims = await extractClaims(textResult.text);
  console.log(`Extracted ${claims.length} claims:`);
  claims.forEach((c, idx) => console.log(`  [${idx + 1}] (${c.type}): ${c.claim}`));

  console.log('3. Searching for claims...');
  const searchStartTime = Date.now();
  const searchResultsMap = await searchAllClaims(claims.map(c => c.claim));
  console.log(`Search completed in ${Date.now() - searchStartTime}ms`);
  
  console.log('4. Verifying claims in batch...');
  const claimsWithSearch = claims.map((c, idx) => ({
    claim: c.claim,
    searchResults: searchResultsMap.get(idx) || []
  }));

  const verifyStartTime = Date.now();
  const verificationResults = await verifyClaimsBatch(claimsWithSearch);
  console.log(`Verification completed in ${Date.now() - verifyStartTime}ms`);
  
  console.log('\n--- VERIFICATION RESULTS ---');
  verificationResults.forEach((res, idx) => {
    console.log(`\nClaim: "${claims[idx].claim}"`);
    console.log(`Verdict: ${res.verdict} (Confidence: ${Math.round(res.confidence * 100)}%)`);
    console.log(`Reasoning: ${res.reasoning}`);
    console.log(`Sources (${res.sources.length}):`);
    res.sources.forEach(src => console.log(`  - [${src.publisher}] ${src.title} (${src.url})`));
  });
}

runTest().catch(err => {
  console.error('Test script failed:', err);
});
