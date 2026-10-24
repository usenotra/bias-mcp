import { DEFAULT_FETCH_ORDER, type ProviderId } from "../constants/providers.js";
import type {
  FetchedPage,
  MergedSearchHit,
  Provider,
  ProviderError,
  SearchOptions,
} from "../types/provider.js";
import { errorMessage } from "../utils/error.js";
import { mergeSearchResults } from "../utils/merge.js";

/** The single interface over all configured providers. */
export class ProviderRouter {
  constructor(private readonly providers: Map<ProviderId, Provider>) {}

  get available(): ProviderId[] {
    return [...this.providers.keys()];
  }

  private pick(requested?: ProviderId[]): Provider[] {
    const ids = requested?.length ? requested : this.available;
    const missing = ids.filter((id) => !this.providers.has(id));
    if (missing.length === ids.length) {
      throw new Error(
        `None of the requested providers are configured (${ids.join(", ")}). Configured: ${this.available.join(", ") || "none"}.`,
      );
    }
    return ids.flatMap((id) => this.providers.get(id) ?? []);
  }

  /** Query providers in parallel and fuse the rankings. Failed providers are reported, not fatal. */
  async search(
    options: SearchOptions,
    requested?: ProviderId[],
  ): Promise<{ results: MergedSearchHit[]; errors: ProviderError[] }> {
    const providers = this.pick(requested);
    const settled = await Promise.allSettled(providers.map((p) => p.search(options)));
    const lists: Parameters<typeof mergeSearchResults>[0] = [];
    const errors: ProviderError[] = [];
    settled.forEach((s, i) => {
      const provider = providers[i].id;
      if (s.status === "fulfilled") lists.push({ provider, hits: s.value });
      else errors.push({ provider, error: errorMessage(s.reason) });
    });
    if (lists.length === 0) {
      throw new Error(`All providers failed: ${errors.map((e) => `${e.provider}: ${e.error}`).join("; ")}`);
    }
    return { results: mergeSearchResults(lists).slice(0, options.numResults), errors };
  }

  /** Fetch with the given provider, or try each in fallback order until one succeeds. */
  async fetch(
    url: string,
    provider: ProviderId | "auto",
  ): Promise<{ page: FetchedPage; provider: ProviderId; errors: ProviderError[] }> {
    const order = provider === "auto" ? DEFAULT_FETCH_ORDER : [provider];
    const providers = this.pick(order);
    const errors: ProviderError[] = [];
    for (const p of providers) {
      try {
        return { page: await p.fetch({ url }), provider: p.id, errors };
      } catch (err) {
        errors.push({ provider: p.id, error: errorMessage(err) });
      }
    }
    throw new Error(`Could not fetch ${url}: ${errors.map((e) => `${e.provider}: ${e.error}`).join("; ")}`);
  }
}
