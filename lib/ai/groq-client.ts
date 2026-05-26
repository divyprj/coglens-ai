/**
 * CogLens — Groq API Client
 *
 * Calls the Groq API (llama-3.3-70b-versatile, mixtral-8x7b-32768).
 */

const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions';

const MODELS = [
  'llama-3.3-70b-versatile',
  'mixtral-8x7b-32768',
] as const;

const TIMEOUT_MS = 50_000;
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function callGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY is not configured. Add it to your .env.local file.'
    );
  }

  let lastError: Error | null = null;

  for (const model of MODELS) {
    try {
      const result = await callModel(model, prompt, apiKey);
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[groq] Model "${model}" failed: ${lastError.message}`);

      // If it's an invalid API key (401/403), throw immediately
      if (lastError.message.includes('key is invalid') || lastError.message.includes('401') || lastError.message.includes('403')) {
        throw lastError;
      }

      // Try next model for 429/503/timeout/404/etc.
      console.log(`[groq] Falling back to the next model...`);
      continue;
    }
  }

  throw lastError || new Error('All Groq models failed.');
}

async function callModel(
  model: string,
  prompt: string,
  apiKey: string,
): Promise<string> {
  console.log(`[groq] Calling model: ${model}`);

  const body = JSON.stringify({
    model,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.1,
    max_tokens: 4096,
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1) + Math.random() * 100;
      console.log(`[groq] Retry ${attempt}/${MAX_RETRIES} after ${Math.round(delay)}ms...`);
      await sleep(delay);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(GROQ_BASE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body,
      });

      if (!res.ok) {
        const responseBody = await res.text().catch(() => '');
        console.error(`[groq] ${model} → ${res.status}:`, responseBody.slice(0, 300));

        if (res.status === 404) {
          throw new Error(`Model "${model}" not found (404).`);
        }

        if (res.status === 429) {
          lastError = new Error('Groq rate limit reached. Retrying...');
          continue;
        }

        if (res.status === 503 || res.status === 502) {
          lastError = new Error('Groq service temporarily busy. Retrying...');
          continue;
        }

        if (res.status === 400) {
          throw new Error(`Groq rejected the request: ${extractErrorMessage(responseBody)}`);
        }

        if (res.status === 401 || res.status === 403) {
          throw new Error('Groq API key is invalid or unauthorized. Check .env.local.');
        }

        throw new Error(`Groq API error (${res.status}): ${extractErrorMessage(responseBody)}`);
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error('Groq returned an empty response.');
      }

      console.log(`[groq] Success — ${text.length} chars from ${model}`);
      return text.trim();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        lastError = new Error('Groq request timed out.');
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error('Verification service temporarily busy. Please retry in a moment.');
}

function extractErrorMessage(body: string): string {
  try {
    const parsed = JSON.parse(body);
    return parsed?.error?.message || parsed?.error?.type || body.slice(0, 200);
  } catch {
    return body.slice(0, 200);
  }
}
