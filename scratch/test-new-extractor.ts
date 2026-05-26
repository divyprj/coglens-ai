import fs from 'fs';
import path from 'path';
import { extractTextFromPdf } from '../lib/pdf/extract-text';

// Improved claim extraction logic for testing
export interface ExtractedClaim {
  claim: string;
  type: 'statistical' | 'factual' | 'temporal' | 'comparative';
}

function extractClaimsNew(documentText: string): ExtractedClaim[] {
  console.log('[extract] Starting local claim extraction. Text length:', documentText.length);

  if (documentText.length < 50) {
    return [];
  }

  const blocklist = [
    'this document is intentionally designed',
    'it contains accurate claims',
    'this report intentionally includes',
    'a robust verification engine',
    'mixed accuracy',
    'intelligence brief'
  ];

  // Step 1: Normalize newlines
  let text = documentText.replace(/\r\n/g, '\n');

  // Step 2: Split into paragraphs and reconstruct them
  const rawParagraphs = text.split(/\n\n+/);
  const paragraphs: string[] = [];

  for (const p of rawParagraphs) {
    const trimmed = p.trim();
    if (!trimmed) continue;

    // Join single newlines with space, but preserve hyphenated word joins
    // and don't join if a line looks like a list item or table row.
    const lines = trimmed.split('\n').map(l => l.trim());
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
          // Join hyphenated word
          reconstructed = reconstructed.slice(0, -1) + line;
        } else if (startsWithBullet) {
          // Start of a list item — keep a separator
          reconstructed += '\n' + line;
        } else if (currentLineEndsSentence || (!currentLineEndsPunctuation && nextLineStartsUppercase)) {
          // New sentence or heading. Keep them separated.
          reconstructed += '\n' + line;
        } else {
          // Regular line wrap
          reconstructed += ' ' + line;
        }
      }
    }
    paragraphs.push(reconstructed);
  }

  // Step 3: Split paragraphs into sentences
  const claims: ExtractedClaim[] = [];
  
  for (const paragraph of paragraphs) {
    // Split sentences by punctuation followed by space, or by newline unconditionally
    const sentences = paragraph
      .split(/(?:(?<=[.!?])\s+(?=[A-Z0-9"“'‘•\-\*])|\n+)/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const sentence of sentences) {
      // Clean leading bullet points or symbols
      const cleanSentence = sentence.replace(/^[\s•\-\*#\d+\.\)\(]+/, '').trim();
      const lower = cleanSentence.toLowerCase();

      // Skip blocklist
      if (blocklist.some(block => lower.includes(block))) {
        continue;
      }

      // Check length constraints
      if (cleanSentence.length < 25 || cleanSentence.length > 350) {
        continue;
      }

      // Check for period at the end (sentences must end with punctuation)
      if (!/[.!?]$/.test(cleanSentence)) {
        continue;
      }

      // Skip subjective/opinion phrases (but keep if they contain a clear stat/date)
      const hasSubjective = /\b(we|our|us|i|my|think|believe|feel|opinion|should|must|recommend)\b/i.test(lower);
      const hasStat = /\d+%\s*|\d+\s*percent|\b(billion|million|trillion|percent)\b/i.test(cleanSentence) || /\b(19|20)\d{2}\b/.test(cleanSentence);
      if (hasSubjective && !hasStat) {
        continue;
      }

      // Skip common page footer/header artifacts (like "Page 1 of 3", "2see report", etc.)
      if (/page\s+\d+\s+of\s+\d+/i.test(lower) || /^section\s+\d+/i.test(lower)) {
        continue;
      }

      // Classify claim type
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

  return claims;
}

async function run() {
  const pdfPath = 'C:\\Users\\suraj\\Downloads\\2see_advanced_stress_test.pdf';
  const buffer = fs.readFileSync(pdfPath);
  const textResult = await extractTextFromPdf(buffer);
  
  console.log('\n--- TEXT FROM PDF ---');
  console.log(textResult.text);
  console.log('---------------------\n');

  const claims = extractClaimsNew(textResult.text);
  console.log(`Extracted ${claims.length} claims:`);
  claims.forEach((c, idx) => {
    console.log(`  [${idx + 1}] (${c.type}): "${c.claim}"`);
  });
}

run().catch(console.error);
