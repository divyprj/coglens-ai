/**
 * CogLens — Trust Score Calculation
 *
 * Generates a 0–100 trust score based on claim verdict distribution.
 */

const VERDICT_WEIGHTS: Record<string, number> = {
  supported: 1.0,
  mixed: 0.3,
  unverifiable: 0.5,
  refuted: 0.0,
};

export function calculateTrustScore(verdicts: string[]): number {
  if (verdicts.length === 0) return 0;

  let weightedSum = 0;
  for (const verdict of verdicts) {
    weightedSum += VERDICT_WEIGHTS[verdict] ?? 0.5;
  }

  const score = Math.round((weightedSum / verdicts.length) * 100);
  return Math.max(0, Math.min(100, score));
}

export function getTrustScoreLabel(
  score: number
): { label: string; color: string } {
  if (score >= 80) return { label: 'High Trust', color: 'success' };
  if (score >= 50) return { label: 'Medium Trust', color: 'warning' };
  return { label: 'Low Trust', color: 'error' };
}
