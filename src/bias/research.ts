import { RESEARCH_RESULTS } from "../constants/bias.js";
import type { ProviderRouter } from "../providers/router.js";
import type { SearchHit } from "../types/provider.js";

const cache = new Map<string, Promise<SearchHit[]>>();

/**
 * Look up who owns / funds a publisher so the bias model has evidence beyond the page itself
 * (e.g. a news site funded by a party). Uses a single provider and caches per hostname.
 */
export function researchPublisher(router: ProviderRouter, hostname: string): Promise<SearchHit[]> {
  let pending = cache.get(hostname);
  if (!pending) {
    const provider = router.available[0];
    pending = router
      .search(
        {
          query: `${hostname} owner parent company funding political affiliation`,
          numResults: RESEARCH_RESULTS,
        },
        [provider],
      )
      .then((r) => r.results)
      .catch(() => {
        cache.delete(hostname);
        return [];
      });
    cache.set(hostname, pending);
  }
  return pending;
}
