import { BIAS_LEVELS } from "../constants/bias.js";
import type { BiasLevel } from "../types/bias.js";
import { normalizeUrl } from "./url.js";

export function clampScore(score: number | null, applicable: boolean): number | null {
  if (!applicable || score === null || Number.isNaN(score)) return null;
  return Math.round(Math.min(1, Math.max(0, score)) * 100) / 100;
}

export function biasLevel(score: number | null): BiasLevel | null {
  if (score === null) return null;
  return BIAS_LEVELS.find((b) => score <= b.max)?.level ?? "very_high";
}

export function filterSources<T extends { url: string }>(sources: T[], allowedUrls: string[]): T[] {
  const allowed = new Set(allowedUrls.map(normalizeUrl));
  return sources.filter((s) => allowed.has(normalizeUrl(s.url)));
}
