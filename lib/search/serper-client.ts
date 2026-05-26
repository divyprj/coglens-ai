/**
 * CogLens — Serper API Client
 *
 * Calls the Serper Google Search API to find web sources for verification.
 */

const SERPER_API_URL = 'https://google.serper.dev/search';
const TIMEOUT_MS = 10_000;

export interface SerperResult {
  title: string;
  url: string;
  snippet: string;
}

export async function searchGoogle(query: string): Promise<SerperResult[]> {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    throw new Error(
      'SERPER_API_KEY is not configured. Add it to your .env.local file.'
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(SERPER_API_URL, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        q: query,
        num: 5,
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error('Serper API rate limit reached. Please wait and retry.');
      }
      if (res.status === 401 || res.status === 403) {
        throw new Error('Serper API key is invalid. Check your configuration.');
      }
      throw new Error(`Serper API error (${res.status})`);
    }

    const data = await res.json();

    const organic: Array<{ title: string; link: string; snippet: string }> =
      data.organic || [];

    return organic.slice(0, 5).map((item) => ({
      title: item.title || '',
      url: item.link || '',
      snippet: item.snippet || '',
    }));
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Search request timed out.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
