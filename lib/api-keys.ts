"use server";

/**
 * CogLens — API Key Management (Server-only)
 *
 * All functions in this module run exclusively on the server.
 * Keys are read from environment variables — never from client-accessible config.
 */

export type ApiProvider = "gemini" | "openai" | "serper" | "groq";

export interface KeyStatus {
  provider: ApiProvider;
  configured: boolean;
  /** Masked preview, e.g. "sk-...a1b2" — safe to show in admin UI */
  preview: string | null;
}

/** Map of provider → env var name */
const ENV_MAP: Record<ApiProvider, string> = {
  gemini: "GEMINI_API_KEY",
  openai: "OPENAI_API_KEY",
  serper: "SERPER_API_KEY",
  groq: "GROQ_API_KEY",
};

/**
 * Retrieve the API key for a given provider.
 * Returns `null` if the key is not set or empty.
 */
export async function getApiKey(
  provider: ApiProvider
): Promise<string | null> {
  const envVar = ENV_MAP[provider];
  const key = process.env[envVar]?.trim();
  return key && key.length > 0 ? key : null;
}

/**
 * Check whether a key looks structurally valid.
 * This does NOT call the provider — it only checks format / length.
 */
export async function validateKeyFormat(
  provider: ApiProvider,
  key: string
): Promise<boolean> {
  if (!key || key.trim().length === 0) return false;

  switch (provider) {
    case "openai":
      return key.startsWith("sk-") && key.length > 20;
    case "gemini":
      return key.length > 20;
    case "serper":
      return key.length > 10;
    case "groq":
      return key.length > 20;
    default:
      return false;
  }
}

/**
 * Return a masked preview of a key, e.g. "sk-...a1b2".
 */
function maskKey(key: string): string {
  if (key.length <= 8) return "••••";
  const prefix = key.slice(0, 4);
  const suffix = key.slice(-4);
  return `${prefix}...${suffix}`;
}

/**
 * Get the configuration status of all API keys.
 * Safe to expose to an admin settings panel (keys are masked).
 */
export async function getAllKeyStatuses(): Promise<KeyStatus[]> {
  const providers: ApiProvider[] = ["gemini", "openai", "serper", "groq"];

  return Promise.all(
    providers.map(async (provider) => {
      const key = await getApiKey(provider);
      return {
        provider,
        configured: key !== null,
        preview: key ? maskKey(key) : null,
      };
    })
  );
}
