/**
 * CogLens — Gemini API Client
 *
 * Calls the Google Generative Language API (AI Studio keys).
 * Primary model: gemini-2.0-flash (fast, current)
 * Fallback model: gemini-1.5-flash-latest
 */

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const MODELS = [
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
] as const;

const TIMEOUT_MS = 50_000;
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Add it to your .env.local file.'
    );
  }

  // Try each model in order until one works
  let lastError: Error | null = null;

  for (const model of MODELS) {
    try {
      const result = await callModel(model, prompt, apiKey);
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[gemini] Model "${model}" failed: ${lastError.message}`);

      // If it's an invalid API key (403), throw immediately
      if (lastError.message.includes('key is invalid') || lastError.message.includes('403')) {
        throw lastError;
      }

      // For other errors (404, 429 rate limit/quota, 503 overload, timeout), try the next model
      console.log(`[gemini] Falling back to the next model...`);
      continue;
    }
  }

  throw lastError || new Error('All Gemini models failed.');
}

async function callModel(
  model: string,
  prompt: string,
  apiKey: string,
): Promise<string> {
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;

  console.log(`[gemini] Calling model: ${model}`);

  const generationConfig: any = {
    temperature: 0.2,
    maxOutputTokens: 8192,
  };

  if (model.includes('3.5') || model.includes('2.5')) {
    generationConfig.thinkingConfig = {
      thinkingBudget: 0,
    };
  }

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig,
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1) + Math.random() * 100;
      console.log(`[gemini] Retry ${attempt}/${MAX_RETRIES} after ${Math.round(delay)}ms...`);
      await sleep(delay);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body,
      });

      // ── Handle errors ──────────────────────────────
      if (!res.ok) {
        const responseBody = await res.text().catch(() => '');
        console.error(`[gemini] ${model} → ${res.status}:`, responseBody.slice(0, 300));

        // 404: model not found — no point retrying
        if (res.status === 404) {
          throw new Error(`Model "${model}" not found (404). It may have been deprecated.`);
        }

        // 429: rate limited — retry
        if (res.status === 429) {
          lastError = new Error('Verification service is temporarily busy. Retrying...');
          continue;
        }

        // 503: overloaded — retry
        if (res.status === 503) {
          lastError = new Error('Verification service is temporarily busy. Retrying...');
          continue;
        }

        // 400: bad request
        if (res.status === 400) {
          throw new Error(
            `Gemini rejected the request: ${extractErrorMessage(responseBody)}`
          );
        }

        // 403: auth error
        if (res.status === 403) {
          throw new Error(
            'Gemini API key is invalid or lacks permissions. Check your key in .env.local.'
          );
        }

        throw new Error(
          `Gemini API error (${res.status}): ${extractErrorMessage(responseBody)}`
        );
      }

      // ── Parse response ─────────────────────────────
      const data = await res.json();

      // Check for blocked content
      if (data.promptFeedback?.blockReason) {
        throw new Error(
          `Gemini blocked the request: ${data.promptFeedback.blockReason}`
        );
      }

      const parts = data?.candidates?.[0]?.content?.parts;
      const text = Array.isArray(parts) ? parts.map((p: any) => p.text || '').join('') : '';
      if (!text) {
        const finishReason = data?.candidates?.[0]?.finishReason;
        if (finishReason && finishReason !== 'STOP') {
          throw new Error(`Gemini returned no content (reason: ${finishReason}).`);
        }
        throw new Error('Gemini returned an empty response.');
      }

      console.log(`[gemini] Success — ${text.length} chars from ${model}`);
      return text.trim();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        lastError = new Error('Gemini request timed out. Try a shorter document.');
        continue; // retry on timeout
      }
      throw err; // rethrow non-retryable errors
    } finally {
      clearTimeout(timeout);
    }
  }

  // Exhausted retries
  throw new Error('Verification service temporarily busy. Please retry in a moment.');
}

/** Extract a readable error message from a Gemini JSON error body */
function extractErrorMessage(body: string): string {
  try {
    const parsed = JSON.parse(body);
    return (
      parsed?.error?.message ||
      parsed?.error?.status ||
      body.slice(0, 200)
    );
  } catch {
    return body.slice(0, 200);
  }
}
