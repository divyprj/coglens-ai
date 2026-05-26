/**
 * CogLens — Utility Functions
 */

/**
 * Merge CSS class names, filtering out falsy values.
 * Lightweight alternative to clsx + tailwind-merge with no extra dependencies.
 *
 * @example cn("px-4", isActive && "bg-surface", undefined, "text-sm")
 */
export function cn(
  ...inputs: (string | boolean | undefined | null)[]
): string {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Format a date into a human-readable string.
 *
 * @param date  — Date object, ISO string, or timestamp
 * @param style — "short" → "Jan 5, 2025"  |  "long" → "January 5, 2025"  |  "relative" → "3 days ago"
 */
export function formatDate(
  date: Date | string | number,
  style: "short" | "long" | "relative" = "short"
): string {
  const d = new Date(date);

  if (style === "relative") {
    const now = Date.now();
    const diff = now - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;

    // Fall through to short format for older dates
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (style === "long") {
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  // "short" (default)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Truncate text to a given length with an ellipsis.
 * Breaks at the last space before the limit to avoid mid-word cuts.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "…";
}

/**
 * Generate a short, collision-resistant unique ID.
 * Uses crypto.randomUUID where available, otherwise falls back to a
 * timestamp + random suffix.
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
