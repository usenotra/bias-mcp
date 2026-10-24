import { RRF_K, type ProviderId } from "../constants/providers.js";
import type { MergedSearchHit, SearchHit } from "../types/provider.js";
import { normalizeUrl } from "./url.js";

/**
 * Merge ranked result lists from several providers with reciprocal rank fusion.
 * URLs found by multiple providers rank higher; the richest snippet/title wins.
 */
export function mergeSearchResults(lists: { provider: ProviderId; hits: SearchHit[] }[]): MergedSearchHit[] {
  const byUrl = new Map<string, MergedSearchHit>();
  for (const { provider, hits } of lists) {
    hits.forEach((hit, rank) => {
      const key = normalizeUrl(hit.url);
      const contribution = 1 / (RRF_K + rank + 1);
      const existing = byUrl.get(key);
      if (!existing) {
        byUrl.set(key, { ...hit, score: contribution, providers: [provider] });
        return;
      }
      existing.score += contribution;
      if (!existing.providers.includes(provider)) existing.providers.push(provider);
      if (hit.snippet.length > existing.snippet.length) existing.snippet = hit.snippet;
      if (!existing.title && hit.title) existing.title = hit.title;
      existing.publishedDate ??= hit.publishedDate;
      existing.author ??= hit.author;
    });
  }
  return [...byUrl.values()].sort((a, b) => b.score - a.score);
}
