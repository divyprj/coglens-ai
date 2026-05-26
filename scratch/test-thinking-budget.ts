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
        if (key === 'GEMINI_API_KEY') {
          apiKey = val;
        }
      }
    });
  }
} catch (e) {
  console.warn('Failed to parse .env.local:', e);
}

if (!apiKey) {
  console.error('GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

async function debugGemini() {
  const model = 'gemini-2.0-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const testPrompt = `You are a fact-checking assistant. Return a valid JSON array of 5 items. Just reply with JSON array containing 5 objects.`;

  console.log('Sending request to Gemini with thinkingBudget = 0...');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: testPrompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
        thinkingConfig: {
          thinkingBudget: 0
        }
      },
    }),
  });

  console.log('Response status:', res.status);
  const data = await res.json();
  console.log('Response body:', JSON.stringify(data, null, 2));
}

debugGemini().catch(console.error);
