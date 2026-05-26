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

async function listModels() {
  const versions = ['v1beta', 'v1'];
  for (const ver of versions) {
    console.log(`\n--- Fetching models for version: ${ver} ---`);
    const url = `https://generativelanguage.googleapis.com/${ver}/models?key=${apiKey}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Error (${res.status}): ${await res.text()}`);
        continue;
      }
      const data = await res.json();
      console.log('Available models:');
      data.models?.forEach((m: any) => {
        console.log(`  - ${m.name} (supports: ${m.supportedGenerationMethods?.join(', ')})`);
      });
    } catch (err) {
      console.error(`Fetch failed for ${ver}:`, err);
    }
  }
}

listModels().catch(console.error);
